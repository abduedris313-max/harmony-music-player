import React, { useState } from 'react';
import { Download, Play, Shuffle, Trash2, Wifi, WifiOff, HardDrive, ShieldCheck, Music } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { TrackRow } from '../common/TrackRow';
import { formatBytes } from '../../lib/db';

export const OfflineQueueView: React.FC = () => {
  const {
    offlineQueueRecords,
    clearOfflineQueue,
    playTrack,
    toggleShuffle,
    isOnline
  } = useAudio();

  const [searchFilter, setSearchFilter] = useState('');

  const offlineTracks = offlineQueueRecords.map(r => r.track);

  const filteredRecords = offlineQueueRecords.filter(r =>
    r.track.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.track.artist.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.track.album.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalBytes = offlineQueueRecords.reduce((acc, r) => acc + (r.blobSize || 0), 0);

  const handlePlayAllOffline = () => {
    if (offlineTracks.length > 0) {
      playTrack(offlineTracks[0], offlineTracks);
    }
  };

  const handleShuffleOffline = () => {
    if (offlineTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * offlineTracks.length);
      toggleShuffle();
      playTrack(offlineTracks[randomIndex], offlineTracks);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/50 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Download className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Offline Queue
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-2">
            <span>Powered by Dexie.js IndexedDB</span>
            <span>•</span>
            <span>{offlineQueueRecords.length} Tracks Cached</span>
            <span>•</span>
            <span>{formatBytes(totalBytes)} Storage Used</span>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          {offlineTracks.length > 0 && (
            <>
              <button
                id="play-all-offline-btn"
                onClick={handlePlayAllOffline}
                className="px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Offline
              </button>
              <button
                id="shuffle-offline-btn"
                onClick={handleShuffleOffline}
                className="px-4 py-2.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center gap-2 border border-zinc-200 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
              <button
                id="clear-offline-queue-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all offline cached tracks?')) {
                    clearOfflineQueue();
                  }
                }}
                className="px-3 py-2.5 rounded-full text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Clear Offline Listening Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Network Status & Info Card */}
      <div className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isOnline
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-950 dark:text-emerald-200'
          : 'bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isOnline ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              {isOnline ? 'Connected to Network' : 'Offline Mode Active'}
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {isOnline
                ? 'Tracks queued here are downloaded to Dexie.js storage so they remain playable if you lose internet connection.'
                : 'You are currently offline. All queued tracks below are stored locally in IndexedDB and ready for playback.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Dexie.js Offline Storage</span>
        </div>
      </div>

      {/* Track List Section */}
      {offlineQueueRecords.length > 0 ? (
        <div className="space-y-4">
          {/* Search filter within offline queue */}
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Filter offline tracks by title, artist, or album..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-xs text-zinc-400 font-mono flex-shrink-0">
              Showing {filteredRecords.length} of {offlineQueueRecords.length}
            </span>
          </div>

          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {filteredRecords.map((record, idx) => (
              <TrackRow
                key={record.trackId}
                track={record.track}
                index={idx}
                queueList={offlineTracks}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-400 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <Download className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              No tracks queued for offline listening
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Click the download button (<Download className="w-3 h-3 inline mx-0.5 text-emerald-500" />) on any song in Browse or Library to save it to Dexie.js for offline playback.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
