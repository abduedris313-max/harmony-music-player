import React, { useState } from 'react';
import { Play, Sparkles, Flame, Radio, Compass, Music, Disc } from 'lucide-react';
import { MOCK_TRACKS, MOCK_PLAYLISTS, MOCK_ALBUMS } from '../../data/mockTracks';
import { AlbumCard } from '../common/AlbumCard';
import { TrackRow } from '../common/TrackRow';
import { useAudio } from '../../context/AudioContext';

export const BrowseView: React.FC = () => {
  const { playTrack } = useAudio();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const featuredHeroTrack = MOCK_TRACKS[0];

  const genres = ['All', 'Lo-Fi / Chill', 'Acoustic / Folk', 'Synthwave / Electronic', 'Classical / Ambient', 'Cinematic / Orchestral'];

  const filteredTracks = selectedGenre === 'All'
    ? MOCK_TRACKS
    : MOCK_TRACKS.filter(t => t.genre === selectedGenre);

  return (
    <div className="space-y-10 pb-12">
      {/* Featured Hero Banner (Apple Music Style) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
        <div className="relative z-10 max-w-lg space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            FEATURED RELEASE
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {featuredHeroTrack.title}
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-medium">
            By {featuredHeroTrack.artist} — {featuredHeroTrack.album}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            <button
              onClick={() => playTrack(featuredHeroTrack, MOCK_TRACKS)}
              className="px-6 py-3 rounded-full bg-white text-zinc-950 font-bold text-sm shadow-xl hover:bg-zinc-100 flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Listen Now
            </button>
          </div>
        </div>

        {/* Hero Artwork Image */}
        <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 flex-shrink-0 group">
          <img
            src={featuredHeroTrack.coverUrl}
            alt={featuredHeroTrack.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Subtle Background Glow Effect */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      </div>

      {/* Genre Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === genre
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Featured Playlists Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-500" />
            Curated Playlists
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_PLAYLISTS.map(playlist => (
            <AlbumCard
              key={playlist.id}
              id={playlist.id}
              title={playlist.name}
              subtitle={playlist.description}
              coverUrl={playlist.coverUrl}
              tracks={playlist.tracks}
              type="playlist"
              badge="FEATURED"
            />
          ))}
        </div>
      </div>

      {/* Top Charts / Recommended Tracks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            Top Charts & Recommendations
          </h2>
        </div>
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {filteredTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              queueList={filteredTracks}
            />
          ))}
        </div>
      </div>

      {/* Popular Albums Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Disc className="w-5 h-5 text-rose-500" />
            Popular Albums
          </h2>
        </div>
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
      </div>
    </div>
  );
};
