import React, { useState } from 'react';
import { Music, Play, Shuffle, Heart, Disc, User, ListMusic } from 'lucide-react';
import { MOCK_TRACKS, MOCK_ALBUMS, MOCK_ARTISTS } from '../../data/mockTracks';
import { TrackRow } from '../common/TrackRow';
import { AlbumCard } from '../common/AlbumCard';
import { useAudio } from '../../context/AudioContext';

export const LibraryView: React.FC = () => {
  const {
    activeTab,
    favoriteTrackIds,
    localTracks,
    playTrack,
    toggleShuffle,
    customPlaylists,
    setSelectedPlaylistId,
    setActiveTab
  } = useAudio();

  const [subTab, setSubTab] = useState<'songs' | 'albums' | 'artists' | 'loved'>('songs');

  // Combined tracks (MOCK + Local)
  const allTracks = [...localTracks, ...MOCK_TRACKS];

  const lovedTracks = allTracks.filter(t => favoriteTrackIds.includes(t.id));

  const handlePlayAll = () => {
    const list = subTab === 'loved' ? lovedTracks : allTracks;
    if (list.length > 0) {
      playTrack(list[0], list);
    }
  };

  const handleShufflePlay = () => {
    const list = subTab === 'loved' ? lovedTracks : allTracks;
    if (list.length > 0) {
      const randomIndex = Math.floor(Math.random() * list.length);
      toggleShuffle();
      playTrack(list[randomIndex], list);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/50 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Music Library
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {allTracks.length} Total Tracks • {lovedTracks.length} Loved • {customPlaylists.length} Playlists
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            className="px-5 py-2.5 rounded-full bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Play All
          </button>
          <button
            onClick={handleShufflePlay}
            className="px-5 py-2.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center gap-2 border border-zinc-200 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex items-center gap-2 border-b border-zinc-200/50 dark:border-white/10 pb-3">
        <button
          onClick={() => setSubTab('songs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'songs'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          Songs ({allTracks.length})
        </button>
        <button
          onClick={() => setSubTab('loved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'loved'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          Loved ({lovedTracks.length})
        </button>
        <button
          onClick={() => setSubTab('albums')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'albums'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Disc className="w-4 h-4" />
          Albums ({MOCK_ALBUMS.length})
        </button>
        <button
          onClick={() => setSubTab('artists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'artists'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Artists ({MOCK_ARTISTS.length})
        </button>
      </div>

      {/* Sub Tab Views */}
      {subTab === 'songs' && (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {allTracks.map((track, idx) => (
            <TrackRow key={track.id} track={track} index={idx} queueList={allTracks} />
          ))}
        </div>
      )}

      {subTab === 'loved' && (
        <div>
          {lovedTracks.length > 0 ? (
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {lovedTracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} queueList={lovedTracks} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-400 space-y-3">
              <Heart className="w-12 h-12 mx-auto stroke-1" />
              <p className="text-base font-semibold">No loved songs yet</p>
              <p className="text-xs">Tap the heart icon on any track to add it to your loved collection.</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_ALBUMS.map(album => (
            <AlbumCard
              key={album.id}
              id={album.id}
              title={album.title}
              subtitle={`${album.artist} • ${album.releaseYear}`}
              coverUrl={album.coverUrl}
              tracks={album.tracks}
              type="album"
            />
          ))}
        </div>
      )}

      {subTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_ARTISTS.map(artist => (
            <div
              key={artist.id}
              className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 flex flex-col items-center text-center space-y-3 group hover:scale-105 transition-all"
            >
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-28 h-28 rounded-full object-cover shadow-lg border-2 border-rose-500/20 group-hover:border-rose-500"
              />
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{artist.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">{artist.genres.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
