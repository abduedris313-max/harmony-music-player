import React from 'react';
import { Search, Music, Disc, User, HardDrive } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { MOCK_TRACKS, MOCK_ALBUMS, MOCK_ARTISTS } from '../../data/mockTracks';
import { TrackRow } from '../common/TrackRow';
import { AlbumCard } from '../common/AlbumCard';

export const SearchView: React.FC = () => {
  const { searchQuery, setSearchQuery, localTracks } = useAudio();

  const query = searchQuery.trim().toLowerCase();

  const allTracks = [...localTracks, ...MOCK_TRACKS];

  const matchedTracks = query
    ? allTracks.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query) ||
          t.album.toLowerCase().includes(query) ||
          t.genre.toLowerCase().includes(query)
      )
    : [];

  const matchedAlbums = query
    ? MOCK_ALBUMS.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.artist.toLowerCase().includes(query)
      )
    : [];

  const matchedArtists = query
    ? MOCK_ARTISTS.filter(a => a.name.toLowerCase().includes(query))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-rose-500" />
          Search
        </h1>
        {query ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Results for <span className="font-semibold text-rose-500">"{searchQuery}"</span>
          </p>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Type in the search bar above to search songs, artists, albums, or local files.
          </p>
        )}
      </div>

      {/* Results Content */}
      {query ? (
        <div className="space-y-8">
          {/* Matched Songs */}
          {matchedTracks.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <Music className="w-5 h-5 text-rose-500" />
                Songs ({matchedTracks.length})
              </h2>
              <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {matchedTracks.map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={idx}
                    queueList={matchedTracks}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Matched Albums */}
          {matchedAlbums.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <Disc className="w-5 h-5 text-rose-500" />
                Albums ({matchedAlbums.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {matchedAlbums.map(album => (
                  <AlbumCard
                    key={album.id}
                    id={album.id}
                    title={album.title}
                    subtitle={album.artist}
                    coverUrl={album.coverUrl}
                    tracks={album.tracks}
                    type="album"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Matched Artists */}
          {matchedArtists.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-500" />
                Artists ({matchedArtists.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {matchedArtists.map(artist => (
                  <div
                    key={artist.id}
                    className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 flex items-center gap-4"
                  >
                    <img
                      src={artist.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover shadow"
                    />
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{artist.name}</p>
                      <p className="text-xs text-zinc-500">{artist.genres.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No matches */}
          {matchedTracks.length === 0 && matchedAlbums.length === 0 && matchedArtists.length === 0 && (
            <div className="py-16 text-center text-zinc-400 space-y-2">
              <Search className="w-12 h-12 mx-auto stroke-1" />
              <p className="text-base font-semibold">No results found for "{searchQuery}"</p>
              <p className="text-xs">Check spelling or try searching for another artist or song title.</p>
            </div>
          )}
        </div>
      ) : (
        /* Default Search Discovery Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setSearchQuery('Lo-Fi')}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-lg text-left shadow-lg hover:scale-105 transition-transform"
          >
            Lo-Fi & Chill
          </button>
          <button
            onClick={() => setSearchQuery('Acoustic')}
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-lg text-left shadow-lg hover:scale-105 transition-transform"
          >
            Acoustic Morning
          </button>
          <button
            onClick={() => setSearchQuery('Synthwave')}
            className="p-6 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 text-white font-bold text-lg text-left shadow-lg hover:scale-105 transition-transform"
          >
            Synthwave 80s
          </button>
          <button
            onClick={() => setSearchQuery('Classical')}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold text-lg text-left shadow-lg hover:scale-105 transition-transform"
          >
            Classical & Piano
          </button>
          <button
            onClick={() => setSearchQuery('Focus')}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-lg text-left shadow-lg hover:scale-105 transition-transform"
          >
            Deep Focus
          </button>
          <button
            onClick={() => setSearchQuery('Cinematic')}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 text-white font-bold text-lg text-left shadow-lg hover:scale-105 transition-transform"
          >
            Cinematic Scores
          </button>
        </div>
      )}
    </div>
  );
};
