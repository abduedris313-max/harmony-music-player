import Dexie, { Table } from 'dexie';
import { Track, Playlist } from '../types/music';

export interface CustomTagEdit {
  trackId: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
}

export interface VirtualFolder {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: number;
}

export interface AudioBlobRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  name: string;
  updatedAt: number;
}

/**
 * HarmonyDexieDB: High-performance IndexedDB wrapper powered by Dexie.js
 * Manages local track metadata, audio files/blobs, playlists, custom tags, and virtual folders.
 */
export class HarmonyDexieDB extends Dexie {
  tracks!: Table<Track, string>;
  audioBlobs!: Table<AudioBlobRecord, string>;
  playlists!: Table<Playlist, string>;
  virtualFolders!: Table<VirtualFolder, string>;
  customTags!: Table<CustomTagEdit, string>;

  constructor() {
    super('harmony_music_player_dexie_db');
    
    // Schema definition for IndexedDB object stores & indexes
    this.version(1).stores({
      tracks: 'id, title, artist, album, genre, isLocal',
      audioBlobs: 'id, name, updatedAt',
      playlists: 'id, name',
      virtualFolders: 'id, name',
      customTags: 'trackId, title, artist, album',
    });
  }
}

// Singleton database instance
export const dexieDb = new HarmonyDexieDB();

// --- Migration helper from legacy IDB if needed ---
let migrationAttempted = false;
async function checkAndMigrateLegacyData(): Promise<void> {
  if (migrationAttempted) return;
  migrationAttempted = true;

  try {
    const dexieTracksCount = await dexieDb.tracks.count();
    if (dexieTracksCount > 0) return; // Dexie DB already populated

    // Attempt legacy IDB read if IndexedDB exists
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const req = indexedDB.open('harmony_music_player_db');
      req.onsuccess = (event) => {
        const legacyDb = (event.target as IDBOpenDBRequest).result;
        if (legacyDb.objectStoreNames.contains('tracks')) {
          const tx = legacyDb.transaction('tracks', 'readonly');
          const store = tx.objectStore('tracks');
          const getAllReq = store.getAll();
          getAllReq.onsuccess = async () => {
            const oldTracks = getAllReq.result as Track[];
            if (oldTracks && oldTracks.length > 0) {
              await dexieDb.tracks.bulkPut(oldTracks);
            }
          };
        }
      };
    }
  } catch (err) {
    console.warn('Legacy IDB migration notice:', err);
  }
}

// --- Tracks API ---
export async function saveTrackDB(track: Track): Promise<void> {
  await dexieDb.tracks.put(track);
}

export async function saveTrackBatchDB(tracks: Track[]): Promise<void> {
  await dexieDb.tracks.bulkPut(tracks);
}

export async function getAllTracksDB(): Promise<Track[]> {
  await checkAndMigrateLegacyData();
  return dexieDb.tracks.toArray();
}

export async function getTrackDB(id: string): Promise<Track | undefined> {
  return dexieDb.tracks.get(id);
}

export async function deleteTrackDB(id: string): Promise<void> {
  await dexieDb.transaction('rw', [dexieDb.tracks, dexieDb.audioBlobs, dexieDb.customTags], async () => {
    await dexieDb.tracks.delete(id);
    await dexieDb.audioBlobs.delete(id);
    await dexieDb.customTags.delete(id);
  });
}

export async function updateTrackMetadataDB(id: string, updates: Partial<Track>): Promise<Track | null> {
  const existing = await dexieDb.tracks.get(id);
  if (!existing) return null;

  const updatedTrack: Track = { ...existing, ...updates };
  await dexieDb.tracks.put(updatedTrack);

  await dexieDb.customTags.put({
    trackId: id,
    title: updates.title,
    artist: updates.artist,
    album: updates.album,
    genre: updates.genre,
    year: updates.releaseYear,
  });

  return updatedTrack;
}

// --- Audio Blobs API ---
export async function saveAudioBlobDB(id: string, blob: Blob, name: string): Promise<void> {
  await dexieDb.audioBlobs.put({
    id,
    blob,
    mimeType: blob.type || 'audio/mpeg',
    name,
    updatedAt: Date.now(),
  });
}

export async function getAudioBlobDB(id: string): Promise<Blob | null> {
  const entry = await dexieDb.audioBlobs.get(id);
  return entry ? entry.blob : null;
}

// --- Playlists & Virtual Folders API ---
export async function savePlaylistDB(playlist: Playlist): Promise<void> {
  await dexieDb.playlists.put(playlist);
}

export async function getAllPlaylistsDB(): Promise<Playlist[]> {
  return dexieDb.playlists.toArray();
}

export async function deletePlaylistDB(id: string): Promise<void> {
  await dexieDb.playlists.delete(id);
}

export async function saveVirtualFolderDB(folder: VirtualFolder): Promise<void> {
  await dexieDb.virtualFolders.put(folder);
}

export async function getAllVirtualFoldersDB(): Promise<VirtualFolder[]> {
  return dexieDb.virtualFolders.toArray();
}

export async function deleteVirtualFolderDB(id: string): Promise<void> {
  await dexieDb.virtualFolders.delete(id);
}

// --- Storage Status & Maintenance ---
export interface StorageEstimateInfo {
  usage: number; // Bytes
  quota: number; // Bytes
  usageFormatted: string;
  quotaFormatted: string;
  percentUsed: number;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function getStorageEstimateDB(): Promise<StorageEstimateInfo> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 1024 * 1024 * 1024; // Default 1GB estimate fallback
    const percentUsed = Math.min(100, Math.round((usage / quota) * 100));

    return {
      usage,
      quota,
      usageFormatted: formatBytes(usage),
      quotaFormatted: formatBytes(quota),
      percentUsed,
    };
  }

  return {
    usage: 0,
    quota: 0,
    usageFormatted: '0 MB',
    quotaFormatted: 'Unknown',
    percentUsed: 0,
  };
}

export async function clearAllMediaCacheDB(): Promise<void> {
  await dexieDb.transaction('rw', [dexieDb.tracks, dexieDb.audioBlobs, dexieDb.virtualFolders, dexieDb.customTags], async () => {
    await dexieDb.tracks.clear();
    await dexieDb.audioBlobs.clear();
    await dexieDb.virtualFolders.clear();
    await dexieDb.customTags.clear();
  });
}
