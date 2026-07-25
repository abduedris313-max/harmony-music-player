import React, { useState, useRef } from 'react';
import {
  Play,
  Shuffle,
  ListMusic,
  Trash2,
  Plus,
  Edit2,
  Copy,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Share2,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { TrackRow } from '../common/TrackRow';

export const PlaylistDetailView: React.FC = () => {
  const {
    selectedPlaylistId,
    customPlaylists,
    playTrack,
    toggleShuffle,
    removeTrackFromPlaylist,
    renamePlaylist,
    deletePlaylist,
    duplicatePlaylist,
    reorderPlaylistTracks,
    bulkRemoveTracksFromPlaylist,
    exportPlaylistM3U,
    exportPlaylistJSON,
    importPlaylistFile,
    openShareModal
  } = useAudio();

  const playlist = customPlaylists.find(p => p.id === selectedPlaylistId) || customPlaylists[0];

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Multi-select state
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  if (!playlist) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <p>No playlist selected</p>
      </div>
    );
  }

  const totalDurationSeconds = playlist.tracks.reduce((acc, t) => acc + t.duration, 0);
  const totalMins = Math.floor(totalDurationSeconds / 60);

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleShufflePlay = () => {
    if (playlist.tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.tracks.length);
      toggleShuffle();
      playTrack(playlist.tracks[randomIndex], playlist.tracks);
    }
  };

  const handleStartRename = () => {
    setEditName(playlist.name);
    setEditDesc(playlist.description || '');
    setIsEditing(true);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    renamePlaylist(playlist.id, editName.trim(), editDesc.trim());
    setIsEditing(false);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importPlaylistFile(e.target.files[0]);
    }
  };

  const toggleSelectTrack = (trackId: string) => {
    setSelectedTrackIds(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedTrackIds.length === 0) return;
    bulkRemoveTracksFromPlaylist(playlist.id, selectedTrackIds);
    setSelectedTrackIds([]);
    setIsMultiSelectMode(false);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Hidden File Input for M3U / JSON Import */}
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportFileChange}
        accept=".m3u,.m3u8,.json"
        className="hidden"
      />

      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-200/50 dark:border-white/10">
        <div className="w-44 h-44 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex-shrink-0 flex items-center justify-center text-white border border-white/20">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <ListMusic className="w-20 h-20" />
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2 w-full">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
              CUSTOM PLAYLIST
            </span>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveRename} className="space-y-2 max-w-md pt-1">
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-zinc-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-lg mt-1">
                  {playlist.description}
                </p>
              )}
            </div>
          )}

          <p className="text-xs font-semibold text-zinc-400">
            {playlist.tracks.length} Songs • ~{totalMins} Minutes
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3">
            <button
              onClick={handlePlayAll}
              disabled={playlist.tracks.length === 0}
              className="px-6 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 hover:bg-rose-600 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Play
            </button>

            <button
              onClick={handleShufflePlay}
              disabled={playlist.tracks.length === 0}
              className="px-5 py-2.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 border border-zinc-200 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-50 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>

            <button
              onClick={handleStartRename}
              className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 border border-zinc-200 dark:border-white/10 transition-colors"
              title="Rename Playlist"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => duplicatePlaylist(playlist.id)}
              className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 border border-zinc-200 dark:border-white/10 transition-colors"
              title="Duplicate Playlist"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => exportPlaylistM3U(playlist.id)}
              className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 border border-zinc-200 dark:border-white/10 transition-colors"
              title="Export as M3U Playlist File"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 border border-zinc-200 dark:border-white/10 transition-colors"
              title="Import Playlist (M3U / JSON)"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert */}
      {showDeleteConfirm && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            Are you sure you want to delete "{playlist.name}"?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 rounded-lg text-xs font-bold text-zinc-500 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              onClick={() => deletePlaylist(playlist.id)}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-md"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {/* Song Multi-Select Toolbar & Songs Count */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
          Tracks In Playlist ({playlist.tracks.length})
        </h3>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              setSelectedTrackIds([]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              isMultiSelectMode
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {isMultiSelectMode ? 'Cancel Selection' : 'Multi-Select'}
          </button>

          {isMultiSelectMode && selectedTrackIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Selected ({selectedTrackIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Playlist Tracks List */}
      <div>
        {playlist.tracks.length > 0 ? (
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {playlist.tracks.map((track, idx) => (
              <div key={`${track.id}-${idx}`} className="flex items-center gap-2 group">
                {/* Multi-select checkbox */}
                {isMultiSelectMode && (
                  <button
                    onClick={() => toggleSelectTrack(track.id)}
                    className="p-1 text-zinc-400 hover:text-rose-500"
                  >
                    {selectedTrackIds.includes(track.id) ? (
                      <CheckSquare className="w-5 h-5 text-rose-500" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                )}

                {/* Track Row */}
                <div className="flex-1 min-w-0">
                  <TrackRow
                    track={track}
                    index={idx}
                    queueList={playlist.tracks}
                  />
                </div>

                {/* Reorder Buttons (Up / Down) */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled={idx === 0}
                    onClick={() => reorderPlaylistTracks(playlist.id, idx, idx - 1)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === playlist.tracks.length - 1}
                    onClick={() => reorderPlaylistTracks(playlist.id, idx, idx + 1)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeTrackFromPlaylist(playlist.id, track.id)}
                    className="p-1 text-zinc-400 hover:text-rose-500"
                    title="Remove from Playlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-400 space-y-2">
            <ListMusic className="w-12 h-12 mx-auto stroke-1 text-zinc-500" />
            <p className="text-base font-semibold">This playlist is empty</p>
            <p className="text-xs">Browse songs and click the option menu (...) on any song to add it to this playlist.</p>
          </div>
        )}
      </div>
    </div>
  );
};
