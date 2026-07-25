import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  Music,
  AlignLeft,
  Sparkles,
  Share2
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { AudioVisualizer } from './AudioVisualizer';
import { triggerHaptic } from '../../utils/haptics';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    seekTo,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    nextTrack,
    previousTrack,
    favoriteTrackIds,
    toggleFavorite,
    setNowPlayingExpanded,
    showLyrics,
    setShowLyrics,
    audioAnalyser,
    openShareModal
  } = useAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  if (!currentTrack) return null;

  const isFavorite = favoriteTrackIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < -45) {
        triggerHaptic(20);
        nextTrack();
      } else if (deltaX > 45) {
        triggerHaptic(20);
        previousTrack();
      }
    } else {
      if (deltaY < -45) {
        triggerHaptic(15);
        setNowPlayingExpanded(true);
      }
    }
  };

  return (
    <div
      id="persistent-mini-player"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 h-16 md:h-20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-200/60 dark:border-white/10 shadow-2xl flex flex-col justify-between transition-all"
    >
      {/* Top Scrubber Progress Bar */}
      <div className="relative w-full h-1 group cursor-pointer bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-rose-500 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleScrubberChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Seek Position"
        />
      </div>

      {/* Main Content Bar */}
      <div className="flex-1 flex items-center justify-between px-3 sm:px-6">
        {/* Left Section: Track Cover & Details */}
        <div
          onClick={() => setNowPlayingExpanded(true)}
          className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-2/5 sm:w-1/3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-zinc-800 group-hover:scale-105 transition-transform">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400">
                <Music className="w-5 h-5" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
              <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-500 transition-colors">
                {currentTrack.title}
              </span>
              {currentTrack.isLossless && (
                <span className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.2 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[8px] font-bold rounded">
                  <Sparkles className="w-2 h-2" />
                  LOSSLESS
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {currentTrack.artist} — {currentTrack.album}
            </p>
          </div>
        </div>

        {/* Center Section: Playback Controls & Time */}
        <div className="flex flex-col items-center justify-center gap-0.5">
          <div className="flex items-center gap-1.5 sm:gap-4">
            <button
              id="mini-player-prev-btn"
              onClick={previousTrack}
              className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-full"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            <button
              id="mini-player-play-btn"
              onClick={togglePlayPause}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              id="mini-player-next-btn"
              onClick={nextTrack}
              className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-full"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section: Volume, Share, Lyrics, Visualizer, Expand */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 w-1/3">
          {/* Audio Visualizer Wave */}
          <div className="hidden lg:block">
            <AudioVisualizer analyser={audioAnalyser} isPlaying={isPlaying} />
          </div>

          {/* Share Button */}
          <button
            id="mini-player-share-btn"
            onClick={() => openShareModal(currentTrack)}
            className="p-1.5 sm:p-2 text-zinc-400 hover:text-rose-500 transition-colors rounded-full"
            title="Share Audio & Track Details"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Favorite button */}
          <button
            id="mini-player-fav-btn"
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`p-1.5 sm:p-2 rounded-full transition-colors ${
              isFavorite
                ? 'text-rose-500 fill-rose-500'
                : 'text-zinc-400 hover:text-rose-500'
            }`}
            title="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Lyrics Toggle */}
          <button
            id="mini-player-lyrics-btn"
            onClick={() => {
              setShowLyrics(!showLyrics);
              setNowPlayingExpanded(true);
            }}
            className={`hidden sm:flex p-2 rounded-full transition-colors ${
              showLyrics
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Toggle Synchronized Lyrics"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          {/* Volume Popup Control */}
          <div className="relative hidden sm:block">
            <button
              id="mini-player-volume-btn"
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 transition-colors rounded-full"
              title="Volume Control"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {showVolumeSlider && (
              <div
                onMouseLeave={() => setShowVolumeSlider(false)}
                className="absolute bottom-10 -right-8 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-xl"
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-zinc-400 w-6">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Expand Fullscreen Button */}
          <button
            id="expand-now-playing-btn"
            onClick={() => setNowPlayingExpanded(true)}
            className="p-1.5 sm:p-2 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            title="Expand Full Screen View (Press F)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
