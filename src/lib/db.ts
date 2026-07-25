import { openDB, DBSchema, IDBPDatabase } from 'idb';
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

interface HarmonyDBSchema extends DBSchema {
  tracks: {
    key: string;
    value: Track;
    indexes: {
      'by-artist': string;
      'by-album': string;
      'by-local': number;
    };
  };
  audioBlobs: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      mimeType: string;
      name: string;
      updatedAt: number;
    };
  };
  playlists: {
    key: string;
    value: Playlist;
  };
  virtualFolders: {
    key: string;
    value: VirtualFolder;
  };
  customTags: {
    key: string;
    value: CustomTagEdit;
  };
}

const DB_NAME = 'harmony_music_player_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HarmonyDBSchema>> | null = null;

export const getDB = (): Promise<IDBPDatabase<HarmonyDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<HarmonyDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tracks Store
        if (!db.objectStoreNames.contains('tracks')) {
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('by-artist', 'artist');
          trackStore.createIndex('by-album', 'album');
          trackStore.createIndex('by-local', 'isLocal');
        }

        // Audio Blobs Store
        if (!db.objectStoreNames.contains('audioBlobs')) {
          db.createObjectStore('audioBlobs', { keyPath: 'id' });
        }

        // Playlists Store
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }

        // Virtual Folders Store
        if (!db.objectStoreNames.contains('virtualFolders')) {
          db.createObjectStore('virtualFolders', { keyPath: 'id' });
        }

        // Custom Tags Store
        if (!db.objectStoreNames.contains('customTags')) {
          db.createObjectStore('customTags', { keyPath: 'trackId' });
        }
      },
    });
  }
  return dbPromise;
};

// --- Tracks API ---
export async function saveTrackDB(track: Track): Promise<void> {
  const db = await getDB();
  await db.put('tracks', track);
}

export async function saveTrackBatchDB(tracks: Track[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tracks', 'readwrite');
  await Promise.all(tracks.map(t => tx.store.put(t)));
  await tx.done;
}

export async function getAllTracksDB(): Promise<Track[]> {
  const db = await getDB();
  return db.getAll('tracks');
}

export async function getTrackDB(id: string): Promise<Track | undefined> {
  const db = await getDB();
  return db.get('tracks', id);
}

export async function deleteTrackDB(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['tracks', 'audioBlobs', 'customTags'], 'readwrite');
  await tx.objectStore('tracks').delete(id);
  await tx.objectStore('audioBlobs').delete(id);
  await tx.objectStore('customTags').delete(id);
  await tx.done;
}

export async function updateTrackMetadataDB(id: string, updates: Partial<Track>): Promise<Track | null> {
  const db = await getDB();
  const existing = await db.get('tracks', id);
  if (!existing) return null;

  const updatedTrack: Track = { ...existing, ...updates };
  await db.put('tracks', updatedTrack);

  // Save custom tag edits
  await db.put('customTags', {
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
  const db = await getDB();
  await db.put('audioBlobs', {
    id,
    blob,
    mimeType: blob.type || 'audio/mpeg',
    name,
    updatedAt: Date.now(),
  });
}

export async function getAudioBlobDB(id: string): Promise<Blob | null> {
  const db = await getDB();
  const entry = await db.get('audioBlobs', id);
  return entry ? entry.blob : null;
}

// --- Playlists & Virtual Folders API ---
export async function savePlaylistDB(playlist: Playlist): Promise<void> {
  const db = await getDB();
  await db.put('playlists', playlist);
}

export async function getAllPlaylistsDB(): Promise<Playlist[]> {
  const db = await getDB();
  return db.getAll('playlists');
}

export async function deletePlaylistDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('playlists', id);
}

export async function saveVirtualFolderDB(folder: VirtualFolder): Promise<void> {
  const db = await getDB();
  await db.put('virtualFolders', folder);
}

export async function getAllVirtualFoldersDB(): Promise<VirtualFolder[]> {
  const db = await getDB();
  return db.getAll('virtualFolders');
}

export async function deleteVirtualFolderDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('virtualFolders', id);
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
  const db = await getDB();
  const tx = db.transaction(['tracks', 'audioBlobs', 'virtualFolders', 'customTags'], 'readwrite');
  await tx.objectStore('tracks').clear();
  await tx.objectStore('audioBlobs').clear();
  await tx.objectStore('virtualFolders').clear();
  await tx.objectStore('customTags').clear();
  await tx.done;
}
