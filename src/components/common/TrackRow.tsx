import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus, Music, HardDrive, Sparkles, Share2 } from 'lucide-react';
import { Track } from '../../types/music';
import { useAudio } from '../../context/AudioContext';

interface TrackRowProps {
  track: Track;
  index: number;
  queueList?: Track[];
  showAlbum?: boolean;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  queueList,
  showAlbum = true
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    favoriteTrackIds,
    toggleFavorite,
    customPlaylists,
    addTrackToPlaylist,
    shareTrack
  } = useAudio();

  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isFavorite = favoriteTrackIds.includes(track.id);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTrackClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, queueList);
    }
  };

  return (
    <div
      id={`track-row-${track.id}`}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
        isCurrent
          ? 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-medium'
          : 'hover:bg-black/5 dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200'
      }`}
    >
      {/* Left section: Number/Play icon, Cover, Title, Artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1" onClick={handleTrackClick}>
        <div className="w-6 text-center text-xs text-zinc-400 font-medium flex-shrink-0">
          {isCurrent ? (
            <div className="flex items-end justify-center gap-0.5 h-3">
              <span className={`w-0.5 bg-rose-500 rounded-full ${isPlaying ? 'animate-bounce h-3' : 'h-1.5'}`} />
              <span className={`w-0.5 bg-rose-500 rounded-full ${isPlaying ? 'animate-bounce h-2 delay-75' : 'h-2'}`} />
              <span className={`w-0.5 bg-rose-500 rounded-full ${isPlaying ? 'animate-bounce h-3.5 delay-150' : 'h-1'}`} />
            </div>
          ) : (
            <span className="group-hover:hidden">{index + 1}</span>
          )}
          {!isCurrent && (
            <button
              id={`play-btn-${track.id}`}
              className="hidden group-hover:flex items-center justify-center w-6 h-6 text-zinc-700 dark:text-zinc-200 hover:text-rose-500 transition-colors"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          )}
        </div>

        {/* Cover thumbnail */}
        <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 shadow-sm">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
              <Music className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Title, Badges & Artist */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`text-sm truncate ${isCurrent ? 'font-semibold text-rose-500 dark:text-rose-400' : 'font-medium'}`}>
              {track.title}
            </span>
            {track.isExplicit && (
              <span className="px-1 py-0.2 bg-zinc-200 dark:bg-zinc-700 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 rounded leading-none">
                E
              </span>
            )}
            {track.isLossless && (
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.2 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-semibold rounded leading-none">
                <Sparkles className="w-2.5 h-2.5" />
                LOSSLESS
              </span>
            )}
            {track.isLocal && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-semibold rounded leading-none">
                <HardDrive className="w-2.5 h-2.5" />
                LOCAL
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {track.artist}
          </p>
        </div>
      </div>

      {/* Album Title (Desktop view) */}
      {showAlbum && (
        <div className="hidden md:block w-1/3 text-xs text-zinc-500 dark:text-zinc-400 truncate px-2">
          {track.album}
        </div>
      )}

      {/* Right controls: Favorite, Share, Duration, Menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          id={`fav-btn-${track.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isFavorite
              ? 'text-rose-500 fill-rose-500'
              : 'text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <button
          id={`share-btn-${track.id}`}
          onClick={(e) => {
            e.stopPropagation();
            shareTrack(track);
          }}
          className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
          title="Share Track metadata & link via Web Share API"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <span className="text-xs text-zinc-400 font-mono w-10 text-right">
          {formatDuration(track.duration)}
        </span>

        {/* Options dropdown menu */}
        <div className="relative">
          <button
            id={`menu-btn-${track.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 z-30 w-48 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl text-xs backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  shareTrack(track);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Track (Web Share)
              </button>

              <button
                onClick={() => {
                  toggleFavorite(track.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Heart className="w-3.5 h-3.5" />
                {isFavorite ? 'Remove from Loved' : 'Add to Loved'}
              </button>

              <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-400">Add to Playlist</div>
              {customPlaylists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => {
                    addTrackToPlaylist(pl.id, track);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 truncate"
                >
                  <Plus className="w-3 h-3 text-zinc-400" />
                  <span className="truncate">{pl.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
