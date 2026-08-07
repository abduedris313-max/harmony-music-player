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

export interface OfflineQueueRecord {
  trackId: string;
  track: Track;
  queuedAt: number;
  downloadStatus: 'queued' | 'downloading' | 'ready' | 'error';
  blobSize?: number;
  errorMessage?: string;
}

/**
 * HarmonyDexieDB: High-performance IndexedDB wrapper powered by Dexie.js
 * Manages local track metadata, audio files/blobs, playlists, custom tags, virtual folders, and offline queue.
 */
export class HarmonyDexieDB extends Dexie {
  tracks!: Table<Track, string>;
  audioBlobs!: Table<AudioBlobRecord, string>;
  playlists!: Table<Playlist, string>;
  virtualFolders!: Table<VirtualFolder, string>;
  customTags!: Table<CustomTagEdit, string>;
  offlineQueue!: Table<OfflineQueueRecord, string>;

  constructor() {
    super('harmony_music_player_dexie_db');
    
    // Schema definition for IndexedDB object stores & indexes
    this.version(1).stores({
      tracks: 'id, title, artist, album, genre, isLocal',
      audioBlobs: 'id, name, updatedAt',
      playlists: 'id, name',
      virtualFolders: 'id, name',
      customTags: 'trackId, title, artist, album',
      offlineQueue: 'trackId, queuedAt, downloadStatus',
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
  await dexieDb.transaction('rw', [dexieDb.tracks, dexieDb.audioBlobs, dexieDb.virtualFolders, dexieDb.customTags, dexieDb.offlineQueue], async () => {
    await dexieDb.tracks.clear();
    await dexieDb.audioBlobs.clear();
    await dexieDb.virtualFolders.clear();
    await dexieDb.customTags.clear();
    await dexieDb.offlineQueue.clear();
  });
}

// --- Offline Queue API (Dexie.js) ---
export async function queueTrackForOfflineDB(track: Track, audioBlob?: Blob): Promise<OfflineQueueRecord> {
  // 1. Ensure track metadata is saved in Dexie tracks store
  await dexieDb.tracks.put(track);

  // 2. Fetch or save audio Blob for offline playback
  let blobToSave = audioBlob;
  if (!blobToSave) {
    const existingBlob = await dexieDb.audioBlobs.get(track.id);
    if (existingBlob) {
      blobToSave = existingBlob.blob;
    } else if (track.audioUrl) {
      try {
        const response = await fetch(track.audioUrl);
        if (response.ok) {
          blobToSave = await response.blob();
        }
      } catch (e) {
        console.warn('Network fetch failed for offline track caching:', e);
      }
    }
  }

  if (blobToSave) {
    await saveAudioBlobDB(track.id, blobToSave, track.title);
  }

  const record: OfflineQueueRecord = {
    trackId: track.id,
    track,
    queuedAt: Date.now(),
    downloadStatus: blobToSave ? 'ready' : 'queued',
    blobSize: blobToSave?.size || 0,
  };

  await dexieDb.offlineQueue.put(record);
  return record;
}

export async function removeTrackFromOfflineDB(trackId: string): Promise<void> {
  await dexieDb.transaction('rw', [dexieDb.offlineQueue, dexieDb.audioBlobs, dexieDb.tracks], async () => {
    await dexieDb.offlineQueue.delete(trackId);
    const trk = await dexieDb.tracks.get(trackId);
    if (!trk?.isLocal) {
      await dexieDb.audioBlobs.delete(trackId);
    }
  });
}

export async function getAllOfflineQueueDB(): Promise<OfflineQueueRecord[]> {
  return dexieDb.offlineQueue.orderBy('queuedAt').reverse().toArray();
}

export async function isTrackQueuedOfflineDB(trackId: string): Promise<boolean> {
  const item = await dexieDb.offlineQueue.get(trackId);
  return !!item;
}

export async function clearOfflineQueueDB(): Promise<void> {
  await dexieDb.transaction('rw', [dexieDb.offlineQueue, dexieDb.audioBlobs, dexieDb.tracks], async () => {
    const items = await dexieDb.offlineQueue.toArray();
    for (const item of items) {
      const trk = await dexieDb.tracks.get(item.trackId);
      if (!trk?.isLocal) {
        await dexieDb.audioBlobs.delete(item.trackId);
      }
    }
    await dexieDb.offlineQueue.clear();
  });
}

