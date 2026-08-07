import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  AlignLeft,
  ListMusic,
  Share2,
  Sparkles,
  Cast,
  Music,
  Disc,
  Download,
  CheckCircle2
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { Track } from '../../types/music';
import { triggerHaptic } from '../../utils/haptics';

export const NowPlayingModal: React.FC = () => {
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
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    favoriteTrackIds,
    toggleFavorite,
    shareTrack,
    queueTrackForOffline,
    removeTrackFromOffline,
    isTrackQueuedOffline,
    isNowPlayingExpanded,
    setNowPlayingExpanded,
    showLyrics,
    setShowLyrics,
    queue,
    queueIndex,
    playTrack
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue'>('lyrics');
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Find active lyric index safely before early return
  const activeLyricIndex = currentTrack?.lyrics
    ? currentTrack.lyrics.findLastIndex((line) => currentTime >= line.time)
    : -1;

  // Auto scroll active lyric into center
  useEffect(() => {
    if (showLyrics && activeLyricIndex !== -1 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, showLyrics]);

  if (!isNowPlayingExpanded || !currentTrack) return null;

  const isFavorite = favoriteTrackIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
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

    if (deltaY > 60 && Math.abs(deltaY) > Math.abs(deltaX)) {
      // Swipe Down -> Minimize
      triggerHaptic(15);
      setNowPlayingExpanded(false);
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < -50) {
        // Swipe Left -> Next Track
        triggerHaptic(20);
        nextTrack();
      } else if (deltaX > 50) {
        // Swipe Right -> Previous Track
        triggerHaptic(20);
        previousTrack();
      }
    }
  };

  return (
    <div
      id="fullscreen-now-playing-modal"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 bg-zinc-950/95 text-white overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-10"
    >
      {/* Swipe Down Pull Indicator */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/20 z-20 pointer-events-none" />

      {/* Dynamic Ambient Blurred Backdrop Aura */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 blur-3xl scale-125 overflow-hidden">
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt=""
            className="w-full h-full object-cover transform scale-150 transition-all duration-1000"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: currentTrack.colorHex || '#fa2d48' }}
          />
        )}
      </div>

      {/* Top Header Controls */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          id="close-now-playing-btn"
          onClick={() => setNowPlayingExpanded(false)}
          className="p-2 text-white/70 hover:text-white rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md transition-colors"
          title="Minimize View (Esc)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Center Title / Lossless badge */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">
            Playing From Album
          </span>
          <span className="text-xs font-semibold text-white/90">
            {currentTrack.album}
          </span>
          {currentTrack.isLossless && (
            <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[9px] font-bold rounded-full">
              <Sparkles className="w-2.5 h-2.5" />
              LOSSLESS AUDIO
            </span>
          )}
        </div>

        {/* Right Toggle Tabs: Lyrics / Queue */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowLyrics(true);
              setActiveTab('lyrics');
            }}
            className={`p-2.5 rounded-xl transition-all ${
              showLyrics && activeTab === 'lyrics'
                ? 'bg-white text-zinc-950 font-semibold shadow-lg'
                : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
            title="Lyrics View"
          >
            <AlignLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowLyrics(false);
              setActiveTab('queue');
            }}
            className={`p-2.5 rounded-xl transition-all ${
              !showLyrics && activeTab === 'queue'
                ? 'bg-white text-zinc-950 font-semibold shadow-lg'
                : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
            title="Up Next Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body: Large Artwork vs Lyrics/Queue */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 my-6 items-center max-w-6xl mx-auto w-full overflow-hidden">
        {/* Left Side: Glowing Album Cover */}
        <div className="flex flex-col items-center justify-center p-4">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-rose-500/20 border border-white/10 group">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                <Music className="w-20 h-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>

          {/* Title & Artist & Favorite & Share Buttons */}
          <div className="mt-6 flex items-center justify-between w-full max-w-md px-2">
            <div className="min-w-0 flex-1 pr-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                {currentTrack.title}
              </h1>
              <p className="text-sm font-medium text-white/60 truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="nowplaying-offline-btn"
                onClick={() => {
                  if (isTrackQueuedOffline(currentTrack.id)) {
                    removeTrackFromOffline(currentTrack.id);
                  } else {
                    queueTrackForOffline(currentTrack);
                  }
                }}
                className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                  isTrackQueuedOffline(currentTrack.id)
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                title={isTrackQueuedOffline(currentTrack.id) ? 'Queued for Offline Listening (Click to remove)' : 'Queue for Offline Listening'}
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => shareTrack(currentTrack)}
                className="p-2.5 rounded-full bg-white/5 text-white/70 hover:text-white backdrop-blur-md transition-colors"
                title="Share track metadata & URL"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                  isFavorite
                    ? 'bg-rose-500/20 text-rose-500 fill-rose-500'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Lyrics Panel OR Queue Panel */}
        <div className="h-64 sm:h-80 lg:h-96 flex flex-col bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 overflow-hidden">
          {showLyrics ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <span className="text-xs font-bold tracking-wider uppercase text-rose-400 flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4" />
                  Synchronized Lyrics
                </span>
                <span className="text-[10px] text-white/50">Tap line to jump to time</span>
              </div>

              <div
                ref={lyricsContainerRef}
                className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/20"
              >
                {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
                  currentTrack.lyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <p
                        key={idx}
                        onClick={() => seekTo(line.time)}
                        className={`text-lg sm:text-xl font-bold cursor-pointer transition-all duration-300 leading-relaxed ${
                          isActive
                            ? 'text-white scale-105 opacity-100'
                            : 'text-white/40 hover:text-white/70 opacity-50'
                        }`}
                      >
                        {line.text}
                      </p>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/40">
                    <Disc className="w-10 h-10 mb-2 animate-spin-slow" />
                    <p className="text-sm font-medium">No lyrics available for this track</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <span className="text-xs font-bold tracking-wider uppercase text-rose-400 flex items-center gap-1.5">
                  <ListMusic className="w-4 h-4" />
                  Up Next Queue ({queue.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/20">
                {queue.map((track, idx) => {
                  const isCurrent = idx === queueIndex;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track, queue)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'hover:bg-white/5 text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={track.coverUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{track.title}</p>
                          <p className="text-[10px] text-white/50 truncate">{track.artist}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls: Scrubber, Main Buttons, Volume */}
      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-4">
        {/* Scrubber Slider */}
        <div className="space-y-1">
          <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
            <div
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-white/50">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Button Row */}
        <div className="flex items-center justify-between">
          {/* Shuffle button */}
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition-colors ${
              isShuffle ? 'text-rose-500 bg-rose-500/10' : 'text-white/50 hover:text-white'
            }`}
            title="Toggle Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={previousTrack}
            className="p-3 text-white/80 hover:text-white transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          {/* Big Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="p-3 text-white/80 hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          {/* Repeat Mode */}
          <button
            onClick={toggleRepeat}
            className={`p-2.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-rose-500 bg-rose-500/10' : 'text-white/50 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume & Output Row */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
          <div className="flex items-center gap-3 w-48">
            <button onClick={toggleMute} className="text-white/60 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3 text-white/50 text-xs">
            <Cast className="w-4 h-4 text-rose-400" />
            <span>AirPlay / Spatial Audio</span>
          </div>
        </div>
      </div>
    </div>
  );
};
