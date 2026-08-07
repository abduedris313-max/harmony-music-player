export interface LyricsLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  genre: string;
  releaseYear?: number;
  isExplicit?: boolean;
  isLossless?: boolean;
  isLocal?: boolean;
  lyrics?: LyricsLine[];
  colorHex?: string; // Accent color for dynamic ambient backdrop
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  isCustom?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  releaseYear: number;
  genre: string;
  tracks: Track[];
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  bio: string;
  genres: string[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export type ActiveTab = 
  | 'browse' 
  | 'library' 
  | 'search' 
  | 'local' 
  | 'playlists' 
  | 'favorites' 
  | 'artists' 
  | 'albums' 
  | 'playlist-detail'
  | 'settings'
  | 'recently-played'
  | 'most-played'
  | 'offline';

export type ThemeMode = 'dark' | 'light' | 'system';
