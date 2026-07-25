import React from 'react';
import { History, Flame, Heart, HardDrive, Play, Music, Sparkles } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { TrackRow } from '../common/TrackRow';

interface SmartPlaylistViewProps {
  type: 'recently-played' | 'most-played';
}

export const SmartPlaylistView: React.FC<SmartPlaylistViewProps> = ({ type }) => {
  const { recentlyPlayed, mostPlayedTracks, playTrack } = useAudio();

  const isRecent = type === 'recently-played';
  const tracks = isRecent ? recentlyPlayed : mostPlayedTracks;

  const title = isRecent ? 'Recently Played' : 'Most Played Tracks';
  const subtitle = isRecent
    ? 'Songs you listened to recently across all sessions'
    : 'Your top played songs based on listening history';

  const icon = isRecent ? (
    <History className="w-6 h-6 text-rose-500" />
  ) : (
    <Flame className="w-6 h-6 text-amber-500" />
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/60 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-md">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              {title}
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                SMART PLAYLIST
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {tracks.length > 0 && (
          <button
            onClick={() => playTrack(tracks[0], tracks)}
            className="px-6 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            Play All ({tracks.length})
          </button>
        )}
      </div>

      {/* Track List */}
      {tracks.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No history yet
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Start listening to songs across the app to automatically build your {title.toLowerCase()} list.
          </p>
        </div>
      ) : (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {tracks.map((track, idx) => (
            <TrackRow
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              queueList={tracks}
            />
          ))}
        </div>
      )}
    </div>
  );
};
