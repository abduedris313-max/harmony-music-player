import * as mm from 'music-metadata-browser';
import { Track } from '../types/music';
import { saveTrackDB, saveAudioBlobDB } from './db';

const VALID_AUDIO_EXTENSIONS = /\.(mp3|flac|wav|m4a|aac|ogg)$/i;

export interface DirectoryScanProgress {
  totalFilesFound: number;
  processedCount: number;
  currentFileName: string;
  isScanningDirectory: boolean;
  isExtractingTags: boolean;
}

// Extract album cover art from metadata picture array
export function extractCoverArtUrl(pictureArray?: mm.IPicture[]): string {
  if (!pictureArray || pictureArray.length === 0) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop';
  }

  try {
    const pic = pictureArray[0];
    const blob = new Blob([pic.data], { type: pic.format || 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Failed to parse cover art blob:', err);
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop';
  }
}

// Extract tags from a single audio File object
export async function extractFileTags(file: File): Promise<Track> {
  const fileId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const objectUrl = URL.createObjectURL(file);
  const cleanFilename = file.name.replace(VALID_AUDIO_EXTENSIONS, '');

  let title = cleanFilename;
  let artist = 'Local Artist';
  let album = 'Local Library';
  let genre = 'Local Audio';
  let releaseYear: number | undefined = undefined;
  let duration = 180;
  let coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop';
  let isLossless = false;

  // Fallback title / artist parsing from filename "Artist - Title"
  const nameParts = cleanFilename.split(' - ');
  if (nameParts.length > 1) {
    artist = nameParts[0].trim();
    title = nameParts.slice(1).join(' - ').trim();
  }

  try {
    const metadata = await mm.parseBlob(file, { duration: true });
    if (metadata.common) {
      if (metadata.common.title) title = metadata.common.title.trim();
      if (metadata.common.artist) artist = metadata.common.artist.trim();
      else if (metadata.common.albumartist) artist = metadata.common.albumartist.trim();

      if (metadata.common.album) album = metadata.common.album.trim();
      if (metadata.common.genre && metadata.common.genre.length > 0) {
        genre = metadata.common.genre.join(', ');
      }
      if (metadata.common.year) releaseYear = metadata.common.year;

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        coverUrl = extractCoverArtUrl(metadata.common.picture);
      }
    }

    if (metadata.format) {
      if (metadata.format.duration && metadata.format.duration > 0) {
        duration = Math.round(metadata.format.duration);
      }
      if (metadata.format.lossless) {
        isLossless = true;
      }
    }
  } catch (err) {
    console.warn(`Tag extraction notice for ${file.name}: fallback to filename tags.`, err);
  }

  const track: Track = {
    id: fileId,
    title,
    artist,
    album,
    coverUrl,
    audioUrl: objectUrl,
    duration,
    genre,
    releaseYear,
    isLossless,
    isLocal: true,
    colorHex: '#3b82f6',
    lyrics: [
      { time: 0, text: `(Playing local track: ${title} by ${artist})` },
      { time: 5, text: `File: ${file.name}` },
    ],
  };

  // Asynchronously save to IndexedDB
  try {
    await saveTrackDB(track);
    await saveAudioBlobDB(fileId, file, file.name);
  } catch (dbErr) {
    console.warn('IndexedDB save warning:', dbErr);
  }

  return track;
}

// Recursively scan FileSystemDirectoryHandle (File System Access API)
export async function recursivelyScanDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle
): Promise<File[]> {
  const files: File[] = [];

  async function walk(handle: FileSystemDirectoryHandle) {
    // @ts-expect-error entries() exists on FileSystemDirectoryHandle
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle;
        if (VALID_AUDIO_EXTENSIONS.test(fileHandle.name)) {
          const file = await fileHandle.getFile();
          files.push(file);
        }
      } else if (entry.kind === 'directory') {
        const subDirHandle = entry as FileSystemDirectoryHandle;
        await walk(subDirHandle);
      }
    }
  }

  await walk(dirHandle);
  return files;
}

// Process files in batch with yielding for smooth UI performance
export async function processAudioFilesBatch(
  files: File[],
  onProgress?: (progress: DirectoryScanProgress) => void
): Promise<Track[]> {
  const total = files.length;
  const tracks: Track[] = [];

  // Batch size 4 for responsive tag processing
  const BATCH_SIZE = 4;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const chunk = files.slice(i, i + BATCH_SIZE);

    const chunkTracks = await Promise.all(
      chunk.map(async (file) => {
        if (onProgress) {
          onProgress({
            totalFilesFound: total,
            processedCount: i + 1,
            currentFileName: file.name,
            isScanningDirectory: false,
            isExtractingTags: true,
          });
        }
        return await extractFileTags(file);
      })
    );

    tracks.push(...chunkTracks);

    // Yield control to UI thread
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  return tracks;
}

// Main Directory Import Handler with File System Access API + HTML5 Fallback
export async function importDirectoryWithPicker(
  onProgress?: (progress: DirectoryScanProgress) => void
): Promise<Track[]> {
  // Check File System Access API
  if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
    try {
      if (onProgress) {
        onProgress({
          totalFilesFound: 0,
          processedCount: 0,
          currentFileName: 'Selecting directory...',
          isScanningDirectory: true,
          isExtractingTags: false,
        });
      }

      // @ts-expect-error showDirectoryPicker exists in modern browsers
      const dirHandle = await window.showDirectoryPicker();
      const files = await recursivelyScanDirectoryHandle(dirHandle);

      if (files.length === 0) {
        return [];
      }

      return await processAudioFilesBatch(files, onProgress);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return [];
      }
      console.warn('showDirectoryPicker error, using fallback:', err);
    }
  }

  return [];
}
