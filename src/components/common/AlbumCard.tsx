import React from 'react';
import { Play, Music } from 'lucide-react';
import { Track } from '../../types/music';
import { useAudio } from '../../context/AudioContext';

interface AlbumCardProps {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  tracks: Track[];
  type?: 'album' | 'playlist' | 'artist';
  badge?: string;
  onClick?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  title,
  subtitle,
  coverUrl,
  tracks,
  type = 'album',
  badge,
  onClick
}) => {
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  const isCurrentPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaying) {
      togglePlayPause();
    } else if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col p-3 rounded-2xl transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer backdrop-blur-sm border border-transparent hover:border-zinc-200/50 dark:hover:border-white/10"
    >
      {/* Cover Image Container */}
      <div className={`relative w-full aspect-square overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow ${
        type === 'artist' ? 'rounded-full' : 'rounded-xl'
      }`}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-400">
            <Music className="w-12 h-12" />
          </div>
        )}

        {/* Dynamic Overlay Gradient */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Badge */}
        {badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white bg-black/60 backdrop-blur-md rounded-full border border-white/20">
            {badge}
          </span>
        )}

        {/* Play Button Overlay */}
        {tracks.length > 0 && (
          <button
            onClick={handlePlayClick}
            className={`absolute bottom-3 right-3 w-11 h-11 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center transform transition-all duration-300 ${
              isCurrentPlaying
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:scale-105'
            }`}
          >
            <Play className={`w-5 h-5 fill-current ${isCurrentPlaying ? '' : 'ml-0.5'}`} />
          </button>
        )}
      </div>

      {/* Info Details */}
      <div className="mt-3 flex flex-col">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-500 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
