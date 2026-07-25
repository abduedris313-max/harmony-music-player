import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Playlist, ActiveTab, RepeatMode, ThemeMode } from '../types/music';
import { MOCK_TRACKS, MOCK_PLAYLISTS } from '../data/mockTracks';
import { triggerHaptic } from '../utils/haptics';
import { getAllTracksDB, updateTrackMetadataDB, deleteTrackDB, getAudioBlobDB } from '../lib/db';

export interface CustomEqPreset {

  name: string;
  bands: number[];
  preamp: number;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface AudioContextType {
  // Network & Global Toast State
  isOnline: boolean;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  removeToast: (id: string) => void;
  shareTrack: (track: Track) => Promise<void>;

  // PWA & Notification State
  isInstallable: boolean;
  isAppInstalled: boolean;
  installApp: () => Promise<void>;
  notificationPermission: NotificationPermission;
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  toggleNotifications: (enabled: boolean) => void;
  sendTrackNotification: (track: Track, customTitle?: string, customBody?: string) => void;

  // Playback state
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  
  // UI state
  activeTab: ActiveTab;
  selectedPlaylistId: string | null;
  isNowPlayingExpanded: boolean;
  showLyrics: boolean;
  theme: ThemeMode;
  searchQuery: string;
  
  // Audio Settings & Equalizer
  isEqEnabled: boolean;
  eqPreset: string;
  eqBands: number[];
  eqPreamp: number;
  customPresets: CustomEqPreset[];
  crossfadeDuration: number;
  isLosslessEnabled: boolean;
  normalizeVolume: boolean;

  // Equalizer & Mobile Modals State
  isEqualizerOpen: boolean;
  openEqualizer: () => void;
  closeEqualizer: () => void;
  isMobileInstallModalOpen: boolean;
  openMobileInstallModal: () => void;
  closeMobileInstallModal: () => void;

  // Share Modal State
  shareModalTrack: Track | null;
  
  // Collections
  favoriteTrackIds: string[];
  localTracks: Track[];
  customPlaylists: Playlist[];
  recentlyPlayed: Track[];
  mostPlayedTracks: Track[];
  playCounts: Record<string, number>;
  
  // Audio node for visualizer
  audioAnalyser: AnalyserNode | null;
  
  // Playback Controls
  playTrack: (track: Track, customQueue?: Track[]) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Audio Settings Actions
  setEqEnabled: (enabled: boolean) => void;
  setEqPreset: (presetName: string) => void;
  setEqBandGain: (bandIndex: number, gainDb: number) => void;
  setEqPreampGain: (gainDb: number) => void;
  saveCustomEqPreset: (name: string) => void;
  resetEqToDefault: () => void;
  setCrossfadeDuration: (secs: number) => void;
  setLosslessEnabled: (enabled: boolean) => void;
  setNormalizeVolume: (enabled: boolean) => void;
  restoreDefaults: () => void;

  // Share Actions
  openShareModal: (track: Track) => void;
  closeShareModal: () => void;

  // Collection Actions
  toggleFavorite: (trackId: string) => void;
  importLocalFiles: (files: FileList | File[]) => void;
  updateLocalTrackMetadata: (trackId: string, updates: Partial<Track>) => Promise<void>;
  deleteLocalTrack: (trackId: string) => Promise<void>;
  setLocalTracks: React.Dispatch<React.SetStateAction<Track[]>>;

  // Playlist Management Actions
  createPlaylist: (name: string, description?: string) => void;
  renamePlaylist: (playlistId: string, name: string, description?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  duplicatePlaylist: (playlistId: string) => void;
  reorderPlaylists: (newPlaylists: Playlist[]) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => void;
  moveTrackBetweenPlaylists: (fromPlaylistId: string, toPlaylistId: string, trackId: string) => void;
  bulkRemoveTracksFromPlaylist: (playlistId: string, trackIds: string[]) => void;
  bulkAddTracksToPlaylist: (playlistId: string, tracks: Track[]) => void;
  exportPlaylistM3U: (playlistId: string) => void;
  exportPlaylistJSON: (playlistId: string) => void;
  importPlaylistFile: (file: File) => void;
  
  // Navigation & UI Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedPlaylistId: (id: string | null) => void;
  setNowPlayingExpanded: (expanded: boolean) => void;
  setShowLyrics: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// EQ Preset Matrix (60Hz, 230Hz, 910Hz, 4kHz, 14kHz)
const PRESET_GAINS: Record<string, number[]> = {
  Normal: [0, 0, 0, 0, 0],
  Pop: [1.5, 3, 0, 2, 4],
  Rock: [4.5, 3, -1, 3, 5],
  Jazz: [3, 2, 0, 2.5, 3.5],
  Classical: [4, 2.5, 0, 2, 3],
  'Bass Boost': [7, 5, 1, 0, 0],
  Vocal: [-2, 2, 5, 3, -1]
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent initial values from localStorage
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('harmony_favorites');
      return saved ? JSON.parse(saved) : ['track-1', 'track-3'];
    } catch {
      return ['track-1', 'track-3'];
    }
  });

  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('harmony_playlists');
      return saved ? JSON.parse(saved) : MOCK_PLAYLISTS;
    } catch {
      return MOCK_PLAYLISTS;
    }
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('harmony_theme') as ThemeMode;
      return saved || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Equalizer & Audio DSP state
  const [isEqEnabled, setEqEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('harmony_eq_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [eqPreset, setEqPresetState] = useState<string>('Normal');
  const [eqBands, setEqBands] = useState<number[]>([0, 0, 0, 0, 0]);
  const [eqPreamp, setEqPreamp] = useState<number>(0);
  const [customPresets, setCustomPresets] = useState<CustomEqPreset[]>(() => {
    try {
      const saved = localStorage.getItem('harmony_custom_eq_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Audio Settings
  const [crossfadeDuration, setCrossfadeDuration] = useState<number>(3);
  const [isLosslessEnabled, setLosslessEnabled] = useState<boolean>(true);
  const [normalizeVolume, setNormalizeVolume] = useState<boolean>(true);

  // Smart Playlists History
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('harmony_recently_played');
      return saved ? JSON.parse(saved) : MOCK_TRACKS.slice(0, 3);
    } catch {
      return MOCK_TRACKS.slice(0, 3);
    }
  });

  const [playCounts, setPlayCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('harmony_play_counts');
      return saved ? JSON.parse(saved) : { 'track-1': 12, 'track-2': 8, 'track-3': 15 };
    } catch {
      return {};
    }
  });

  // Share Modal, Equalizer Modal & Mobile Install Modal State
  const [shareModalTrack, setShareModalTrack] = useState<Track | null>(null);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isMobileInstallModalOpen, setIsMobileInstallModalOpen] = useState<boolean>(false);

  const openEqualizer = () => { triggerHaptic(10); setIsEqualizerOpen(true); };
  const closeEqualizer = () => { triggerHaptic(10); setIsEqualizerOpen(false); };
  const openMobileInstallModal = () => { triggerHaptic(15); setIsMobileInstallModalOpen(true); };
  const closeMobileInstallModal = () => { triggerHaptic(10); setIsMobileInstallModalOpen(false); };

  // PWA Install & Notification State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });

  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('harmony_notifications');
      return saved !== null ? saved === 'true' : ('Notification' in window && Notification.permission === 'granted');
    } catch {
      return false;
    }
  });

  // Network Status & Toast State
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Network State Listener for offline/online changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network connection restored. Back online!', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode: Network connection lost. Playing cached local tracks.', 'warning', 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Registration & Install Event Listeners
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then((reg) => {
        console.log('Harmony Workbox Service Worker registered:', reg);
      }).catch((err) => {
        console.warn('Fallback registering /sw.js:', err);
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredInstallPrompt) {
      alert('Harmony is already installed or your browser does not support web installation prompts directly.');
      return;
    }
    try {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
        setIsAppInstalled(true);
        setDeferredInstallPrompt(null);
      }
    } catch (err) {
      console.warn('Install prompt warning:', err);
    }
  };

  const sendTrackNotification = (track: Track, customTitle?: string, customBody?: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !notificationsEnabled) {
      return;
    }

    const title = customTitle || `Now Playing: ${track.title}`;
    const body = customBody || `${track.artist} — ${track.album}`;

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body: body,
            icon: track.coverUrl || '/icon.svg',
            badge: '/icon.svg',
            tag: 'harmony-now-playing',
            silent: true
          } as NotificationOptions);
        });
      } else {
        new Notification(title, {
          body: body,
          icon: track.coverUrl || '/icon.svg',
          tag: 'harmony-now-playing'
        });
      }
    } catch (e) {
      console.warn('Notification trigger notice:', e);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setNotificationsEnabledState(true);
        localStorage.setItem('harmony_notifications', 'true');
        if (currentTrack) {
          sendTrackNotification(currentTrack, 'Notifications Active', 'You will receive notifications on track changes!');
        }
        return true;
      } else {
        setNotificationsEnabledState(false);
        localStorage.setItem('harmony_notifications', 'false');
        return false;
      }
    } catch (err) {
      console.error('Notification permission error:', err);
      return false;
    }
  };

  const toggleNotifications = (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      requestNotificationPermission();
    } else {
      setNotificationsEnabledState(enabled);
      localStorage.setItem('harmony_notifications', String(enabled));
    }
  };

  // Playback state
  const [queue, setQueue] = useState<Track[]>(MOCK_TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(MOCK_TRACKS[0].duration);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('browse');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isNowPlayingExpanded, setNowPlayingExpanded] = useState<boolean>(false);
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [localTracks, setLocalTracks] = useState<Track[]>([]);

  // Load IndexedDB Local Tracks on initial mount
  useEffect(() => {
    async function loadStoredTracks() {
      try {
        const stored = await getAllTracksDB();
        if (stored && stored.length > 0) {
          const rehydrated = await Promise.all(
            stored.map(async (t) => {
              const blob = await getAudioBlobDB(t.id);
              if (blob) {
                return { ...t, audioUrl: URL.createObjectURL(blob) };
              }
              return t;
            })
          );
          setLocalTracks(rehydrated);
        }
      } catch (err) {
        console.warn('IndexedDB initial load notice:', err);
      }
    }
    loadStoredTracks();
  }, []);

  // HTML Audio element & Web Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const eqPreampNodeRef = useRef<GainNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);

  // Initialize HTML Audio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleAutoAdvance();
    };

    const handleError = (e: Event) => {
      console.warn('Audio playback notice:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Theme synchronization
  useEffect(() => {
    localStorage.setItem('harmony_theme', theme);

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme === 'dark';
      }

      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Sync Equalizer Settings to localStorage
  useEffect(() => {
    localStorage.setItem('harmony_eq_enabled', String(isEqEnabled));
  }, [isEqEnabled]);

  useEffect(() => {
    localStorage.setItem('harmony_custom_eq_presets', JSON.stringify(customPresets));
  }, [customPresets]);

  useEffect(() => {
    localStorage.setItem('harmony_favorites', JSON.stringify(favoriteTrackIds));
  }, [favoriteTrackIds]);

  useEffect(() => {
    localStorage.setItem('harmony_playlists', JSON.stringify(customPlaylists));
  }, [customPlaylists]);

  useEffect(() => {
    localStorage.setItem('harmony_recently_played', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    localStorage.setItem('harmony_play_counts', JSON.stringify(playCounts));
  }, [playCounts]);

  // Web Audio Equalizer DSP initialization
  const initWebAudio = () => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaElementSource(audioRef.current);

        const preamp = ctx.createGain();
        eqPreampNodeRef.current = preamp;

        const frequencies = [60, 230, 910, 4000, 14000];
        const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

        const filters = frequencies.map((freq, i) => {
          const f = ctx.createBiquadFilter();
          f.type = types[i];
          f.frequency.value = freq;
          f.Q.value = 1.0;
          f.gain.value = 0;
          return f;
        });

        eqFiltersRef.current = filters;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;

        source.connect(preamp);
        let lastNode: AudioNode = preamp;
        filters.forEach(f => {
          lastNode.connect(f);
          lastNode = f;
        });
        lastNode.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        setAudioAnalyser(analyser);
      } catch (e) {
        console.warn('Web Audio API setup skipped:', e);
      }
    }
  };

  // Sync Equalizer gains to Web Audio DSP
  useEffect(() => {
    if (!eqPreampNodeRef.current || eqFiltersRef.current.length === 0) return;

    const ctx = audioContextRef.current;
    const now = ctx ? ctx.currentTime : 0;

    if (isEqEnabled) {
      const preampLinear = Math.pow(10, eqPreamp / 20);
      eqPreampNodeRef.current.gain.setTargetAtTime(preampLinear, now, 0.05);

      eqFiltersRef.current.forEach((filter, i) => {
        const dbGain = eqBands[i] || 0;
        filter.gain.setTargetAtTime(dbGain, now, 0.05);
      });
    } else {
      eqPreampNodeRef.current.gain.setTargetAtTime(1.0, now, 0.05);
      eqFiltersRef.current.forEach((filter) => {
        filter.gain.setTargetAtTime(0, now, 0.05);
      });
    }
  }, [isEqEnabled, eqBands, eqPreamp]);

  // Sync track URL change to audio element
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const audio = audioRef.current;
    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.currentTime = 0;
      setCurrentTime(0);
      setDuration(currentTrack.duration);

      if (isPlaying) {
        audio.play().catch(err => {
          console.warn('Playback notice:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack]);

  const seekTo = (seconds: number) => {
    triggerHaptic(8);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const nextTrack = () => {
    triggerHaptic(20);
    if (queue.length === 0) return;
    let nextTrk: Track;
    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * queue.length);
      setQueueIndex(randomIdx);
      nextTrk = queue[randomIdx];
    } else {
      const nextIdx = (queueIndex + 1) % queue.length;
      setQueueIndex(nextIdx);
      nextTrk = queue[nextIdx];
    }
    setCurrentTrack(nextTrk);
    setIsPlaying(true);
    recordTrackPlay(nextTrk);
  };

  const previousTrack = () => {
    triggerHaptic(20);
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    const prevTrk = queue[prevIdx];
    setCurrentTrack(prevTrk);
    setIsPlaying(true);
    recordTrackPlay(prevTrk);
  };

  // Media Session API Setup & Actions
  const nextTrackRef = useRef(nextTrack);
  const previousTrackRef = useRef(previousTrack);
  const seekToRef = useRef(seekTo);

  useEffect(() => {
    nextTrackRef.current = nextTrack;
    previousTrackRef.current = previousTrack;
    seekToRef.current = seekTo;
  });

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'Harmony Music Player',
        artwork: currentTrack.coverUrl ? [
          { src: currentTrack.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.coverUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.coverUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ] : [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      });

      const setHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (e) {
          console.warn(`MediaSession action ${action} not supported:`, e);
        }
      };

      setHandler('play', () => {
        setIsPlaying(true);
      });
      setHandler('pause', () => {
        setIsPlaying(false);
      });
      setHandler('nexttrack', () => {
        nextTrackRef.current();
      });
      setHandler('previoustrack', () => {
        previousTrackRef.current();
      });
      setHandler('stop', () => {
        setIsPlaying(false);
        seekToRef.current(0);
      });
      setHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          seekToRef.current(details.seekTime);
        }
      });
      setHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        if (audioRef.current) {
          seekToRef.current(Math.max(0, audioRef.current.currentTime - skipTime));
        }
      });
      setHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        if (audioRef.current) {
          seekToRef.current(Math.min(duration, audioRef.current.currentTime + skipTime));
        }
      });
    } catch (e) {
      console.warn('MediaSession handler setup warning:', e);
    }
  }, [currentTrack, duration]);

  // Sync Media Session Playback State
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Sync Media Session Position State
  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0 && !isNaN(currentTime)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1.0,
          position: Math.min(currentTime, duration)
        });
      } catch (e) {
        // Ignore edge position boundary warning
      }
    }
  }, [currentTime, duration]);

  // Play / Pause audio state sync
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;

    if (isPlaying) {
      initWebAudio();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume & Mute state sync
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Auto Advance Logic when track ends
  const handleAutoAdvance = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    if (isShuffle && queue.length > 1) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      setQueueIndex(randomIndex);
      setCurrentTrack(queue[randomIndex]);
      setIsPlaying(true);
      return;
    }

    if (queueIndex < queue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      setCurrentTrack(queue[nextIdx]);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      setCurrentTrack(queue[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Record Played Track into History & Play Counts
  const recordTrackPlay = (track: Track) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 50);
    });

    setPlayCounts(prev => ({
      ...prev,
      [track.id]: (prev[track.id] || 0) + 1
    }));
  };

  // Derive Most Played Tracks
  const mostPlayedTracks: Track[] = React.useMemo(() => {
    const allKnownTracks = [...MOCK_TRACKS, ...localTracks];
    const uniqueMap = new Map<string, Track>();
    allKnownTracks.forEach(t => uniqueMap.set(t.id, t));

    return Array.from(uniqueMap.values())
      .map(track => ({ track, count: playCounts[track.id] || 0 }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .map(item => item.track);
  }, [playCounts, localTracks]);

  // User Play Actions
  const playTrack = (track: Track, customQueue?: Track[]) => {
    triggerHaptic(18);
    recordTrackPlay(track);

    if (customQueue && customQueue.length > 0) {
      setQueue(customQueue);
      const idx = customQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setQueueIndex(idx);
      } else {
        setQueue(prev => [track, ...prev]);
        setQueueIndex(0);
      }
    }
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    triggerHaptic(15);
    if (!currentTrack && queue.length > 0) {
      setCurrentTrack(queue[0]);
      setQueueIndex(0);
      setIsPlaying(true);
      recordTrackPlay(queue[0]);
      return;
    }
    setIsPlaying(prev => !prev);
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    triggerHaptic(10);
    setIsMuted(prev => !prev);
  };

  const toggleShuffle = () => {
    triggerHaptic(12);
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    triggerHaptic(12);
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleFavorite = (trackId: string) => {
    triggerHaptic([10, 30, 15]);
    setFavoriteTrackIds(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId) 
        : [...prev, trackId]
    );
  };

  // Equalizer Actions
  const setEqPreset = (presetName: string) => {
    setEqPresetState(presetName);
    const customMatch = customPresets.find(p => p.name === presetName);
    if (customMatch) {
      setEqBands([...customMatch.bands]);
      setEqPreamp(customMatch.preamp);
    } else if (PRESET_GAINS[presetName]) {
      setEqBands([...PRESET_GAINS[presetName]]);
      setEqPreamp(0);
    }
  };

  const setEqBandGain = (bandIndex: number, gainDb: number) => {
    setEqPresetState('Custom');
    setEqBands(prev => {
      const updated = [...prev];
      updated[bandIndex] = gainDb;
      return updated;
    });
  };

  const setEqPreampGain = (gainDb: number) => {
    setEqPreamp(gainDb);
  };

  const saveCustomEqPreset = (name: string) => {
    const newPreset: CustomEqPreset = {
      name,
      bands: [...eqBands],
      preamp: eqPreamp
    };
    setCustomPresets(prev => [...prev.filter(p => p.name !== name), newPreset]);
    setEqPresetState(name);
  };

  const resetEqToDefault = () => {
    setEqPresetState('Normal');
    setEqBands([0, 0, 0, 0, 0]);
    setEqPreamp(0);
  };

  const restoreDefaults = () => {
    setThemeState('dark');
    setEqEnabled(false);
    resetEqToDefault();
    setCrossfadeDuration(3);
    setLosslessEnabled(true);
    setNormalizeVolume(true);
    setCustomPlaylists(MOCK_PLAYLISTS);
    setFavoriteTrackIds(['track-1', 'track-3']);
  };

  // Share Actions
  const shareTrack = async (track: Track) => {
    triggerHaptic(12);
    const trackShareUrl = `${window.location.origin}${window.location.pathname}?track=${track.id}`;
    const shareData = {
      title: track.title,
      text: `Listen to "${track.title}" by ${track.artist} on Harmony Music Player!`,
      url: trackShareUrl,
    };

    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        showToast(`Shared "${track.title}"`, 'success');
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.warn('Web Share API call failed or cancelled:', err);
      }
    }

    // Fallback if navigator.share is unavailable or failed
    try {
      await navigator.clipboard.writeText(trackShareUrl);
      showToast(`Link for "${track.title}" copied to clipboard!`, 'info');
    } catch {
      openShareModal(track);
    }
  };

  const openShareModal = (track: Track) => {
    setShareModalTrack(track);
  };

  const closeShareModal = () => {
    setShareModalTrack(null);
  };

  // Local File Scanner & Reader
  const importLocalFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTracks: Track[] = [];

    fileArray.forEach((file, index) => {
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|flac|wav|m4a|aac|ogg)$/i)) {
        const objectUrl = URL.createObjectURL(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const nameParts = cleanName.split(' - ');
        
        let artist = 'Local Artist';
        let title = cleanName;

        if (nameParts.length > 1) {
          artist = nameParts[0].trim();
          title = nameParts.slice(1).join(' - ').trim();
        }

        const track: Track = {
          id: `local-${Date.now()}-${index}`,
          title: title,
          artist: artist,
          album: 'Downloaded / Local Music',
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
          audioUrl: objectUrl,
          duration: 180,
          genre: 'Local File',
          isLocal: true,
          colorHex: '#3b82f6',
          lyrics: [
            { time: 0, text: `(Playing local audio file: ${file.name})` },
            { time: 5, text: 'Local audio playback active.' }
          ]
        };

        newTracks.push(track);
      }
    });

    if (newTracks.length > 0) {
      setLocalTracks(prev => [...newTracks, ...prev]);
      setQueue(prev => [...newTracks, ...prev]);
      setActiveTab('local');
      playTrack(newTracks[0]);
    }
  };

  // Local Track Management Actions
  const updateLocalTrackMetadata = async (trackId: string, updates: Partial<Track>) => {
    try {
      await updateTrackMetadataDB(trackId, updates);
      setLocalTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, ...updates } : t))
      );
      setQueue((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, ...updates } : t))
      );
      if (currentTrack && currentTrack.id === trackId) {
        setCurrentTrack((prev) => (prev ? { ...prev, ...updates } : null));
      }
      showToast('Track metadata updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update track metadata:', err);
    }
  };

  const deleteLocalTrack = async (trackId: string) => {
    try {
      await deleteTrackDB(trackId);
      setLocalTracks((prev) => prev.filter((t) => t.id !== trackId));
      setQueue((prev) => prev.filter((t) => t.id !== trackId));
      if (currentTrack && currentTrack.id === trackId) {
        nextTrack();
      }
      showToast('Track deleted from library', 'info');
    } catch (err) {
      console.error('Failed to delete track:', err);
    }
  };

  // Playlist Management Actions
  const createPlaylist = (name: string, description: string = '') => {
    const newPl: Playlist = {
      id: `pl-custom-${Date.now()}`,
      name,
      description,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      tracks: [],
      isCustom: true
    };
    setCustomPlaylists(prev => [...prev, newPl]);
  };

  const renamePlaylist = (playlistId: string, name: string, description: string = '') => {
    setCustomPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, name, description };
      }
      return pl;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setCustomPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(null);
      setActiveTab('browse');
    }
  };

  const duplicatePlaylist = (playlistId: string) => {
    const target = customPlaylists.find(p => p.id === playlistId);
    if (!target) return;

    const dup: Playlist = {
      ...target,
      id: `pl-custom-${Date.now()}`,
      name: `${target.name} (Copy)`,
      isCustom: true
    };
    setCustomPlaylists(prev => [...prev, dup]);
  };

  const reorderPlaylists = (newPlaylists: Playlist[]) => {
    setCustomPlaylists(newPlaylists);
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setCustomPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.tracks.some(t => t.id === track.id)) return pl;
        return { ...pl, tracks: [...pl.tracks, track] };
      }
      return pl;
    }));
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setCustomPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
      }
      return pl;
    }));
  };

  const reorderPlaylistTracks = (playlistId: string, fromIndex: number, toIndex: number) => {
    setCustomPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        const tracksCopy = [...pl.tracks];
        const [moved] = tracksCopy.splice(fromIndex, 1);
        tracksCopy.splice(toIndex, 0, moved);
        return { ...pl, tracks: tracksCopy };
      }
      return pl;
    }));
  };

  const moveTrackBetweenPlaylists = (fromPlaylistId: string, toPlaylistId: string, trackId: string) => {
    const targetTrack = customPlaylists.find(p => p.id === fromPlaylistId)?.tracks.find(t => t.id === trackId);
    if (!targetTrack) return;

    removeTrackFromPlaylist(fromPlaylistId, trackId);
    addTrackToPlaylist(toPlaylistId, targetTrack);
  };

  const bulkRemoveTracksFromPlaylist = (playlistId: string, trackIds: string[]) => {
    setCustomPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(t => !trackIds.includes(t.id)) };
      }
      return pl;
    }));
  };

  const bulkAddTracksToPlaylist = (playlistId: string, tracks: Track[]) => {
    setCustomPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        const existingIds = new Set(pl.tracks.map(t => t.id));
        const newTracks = tracks.filter(t => !existingIds.has(t.id));
        return { ...pl, tracks: [...pl.tracks, ...newTracks] };
      }
      return pl;
    }));
  };

  // M3U Export / Import
  const exportPlaylistM3U = (playlistId: string) => {
    const playlist = customPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    let m3uContent = '#EXTM3U\n';
    playlist.tracks.forEach(track => {
      m3uContent += `#EXTINF:${Math.round(track.duration)},${track.artist} - ${track.title}\n${track.audioUrl}\n`;
    });

    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name.replace(/[^a-z0-9]/gi, '_')}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportPlaylistJSON = (playlistId: string) => {
    const playlist = customPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlist, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${playlist.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importPlaylistFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content) as Playlist;
          if (parsed.name && Array.isArray(parsed.tracks)) {
            const newPl: Playlist = {
              ...parsed,
              id: `pl-imported-${Date.now()}`,
              isCustom: true
            };
            setCustomPlaylists(prev => [...prev, newPl]);
          }
        } catch (err) {
          console.warn('JSON playlist parse failed:', err);
        }
      } else if (file.name.endsWith('.m3u') || file.name.endsWith('.m3u8')) {
        const lines = content.split('\n');
        const tracks: Track[] = [];
        let currentTitle = 'Imported Track';
        let currentArtist = 'Unknown Artist';

        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('#EXTINF:')) {
            const infoParts = trimmed.split(',');
            if (infoParts.length > 1) {
              const fullTitle = infoParts[1];
              const titleParts = fullTitle.split(' - ');
              if (titleParts.length > 1) {
                currentArtist = titleParts[0].trim();
                currentTitle = titleParts.slice(1).join(' - ').trim();
              } else {
                currentTitle = fullTitle.trim();
              }
            }
          } else if (trimmed && !trimmed.startsWith('#')) {
            tracks.push({
              id: `imported-${Date.now()}-${idx}`,
              title: currentTitle,
              artist: currentArtist,
              album: 'Imported Playlist',
              coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
              audioUrl: trimmed,
              duration: 180,
              genre: 'M3U Import'
            });
          }
        });

        const newPl: Playlist = {
          id: `pl-imported-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          description: `Imported from ${file.name}`,
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
          tracks: tracks,
          isCustom: true
        };
        setCustomPlaylists(prev => [...prev, newPl]);
      }
    };
    reader.readAsText(file);
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekTo(currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekTo(Math.max(0, currentTime - 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.05));
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        setNowPlayingExpanded(!isNowPlayingExpanded);
      } else if (e.key === 'l' || e.key === 'L') {
        setShowLyrics(!showLyrics);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, volume, isNowPlayingExpanded, showLyrics, currentTrack, isPlaying]);

  return (
    <AudioContext.Provider
      value={{
        isOnline,
        toasts,
        showToast,
        removeToast,
        shareTrack,
        currentTrack,
        queue,
        queueIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        isInstallable,
        isAppInstalled,
        installApp,
        notificationPermission,
        notificationsEnabled,
        requestNotificationPermission,
        toggleNotifications,
        sendTrackNotification,
        activeTab,
        selectedPlaylistId,
        isNowPlayingExpanded,
        showLyrics,
        theme,
        searchQuery,
        isEqEnabled,
        eqPreset,
        eqBands,
        eqPreamp,
        customPresets,
        crossfadeDuration,
        isLosslessEnabled,
        normalizeVolume,
        isEqualizerOpen,
        openEqualizer,
        closeEqualizer,
        isMobileInstallModalOpen,
        openMobileInstallModal,
        closeMobileInstallModal,
        shareModalTrack,
        favoriteTrackIds,
        localTracks,
        setLocalTracks,
        updateLocalTrackMetadata,
        deleteLocalTrack,
        customPlaylists,
        recentlyPlayed,
        mostPlayedTracks,
        playCounts,
        audioAnalyser,
        playTrack,
        togglePlayPause,
        seekTo,
        setVolume,
        toggleMute,
        nextTrack,
        previousTrack,
        toggleShuffle,
        toggleRepeat,
        setEqEnabled,
        setEqPreset,
        setEqBandGain,
        setEqPreampGain,
        saveCustomEqPreset,
        resetEqToDefault,
        setCrossfadeDuration,
        setLosslessEnabled,
        setNormalizeVolume,
        restoreDefaults,
        openShareModal,
        closeShareModal,
        toggleFavorite,
        importLocalFiles,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        duplicatePlaylist,
        reorderPlaylists,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        reorderPlaylistTracks,
        moveTrackBetweenPlaylists,
        bulkRemoveTracksFromPlaylist,
        bulkAddTracksToPlaylist,
        exportPlaylistM3U,
        exportPlaylistJSON,
        importPlaylistFile,
        setActiveTab,
        setSelectedPlaylistId,
        setNowPlayingExpanded,
        setShowLyrics,
        setSearchQuery,
        setTheme,
        toggleTheme
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
