import React, { useState } from 'react';
import {
  Compass,
  Search,
  HardDrive,
  Heart,
  Plus,
  Music,
  Disc,
  User,
  ListMusic,
  Sparkles,
  History,
  Flame,
  Settings,
  Sliders
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { ActiveTab } from '../../types/music';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    customPlaylists,
    createPlaylist,
    setSelectedPlaylistId,
    selectedPlaylistId,
    favoriteTrackIds,
    localTracks,
    recentlyPlayed,
    mostPlayedTracks
  } = useAudio();

  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowNewPlaylistModal(false);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'browse', label: 'Browse', icon: <Compass className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'library', label: 'Songs', icon: <Music className="w-4 h-4" /> },
    { id: 'albums', label: 'Albums', icon: <Disc className="w-4 h-4" /> },
    { id: 'artists', label: 'Artists', icon: <User className="w-4 h-4" /> },
    { id: 'favorites', label: 'Loved Songs', icon: <Heart className="w-4 h-4 text-rose-500" />, badge: favoriteTrackIds.length },
    { id: 'local', label: 'Downloaded / Local', icon: <HardDrive className="w-4 h-4 text-blue-500" />, badge: localTracks.length }
  ];

  const smartItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'recently-played', label: 'Recently Played', icon: <History className="w-4 h-4 text-rose-400" />, badge: recentlyPlayed.length },
    { id: 'most-played', label: 'Most Played', icon: <Flame className="w-4 h-4 text-amber-500" />, badge: mostPlayedTracks.length }
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 h-full bg-zinc-100/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-r border-zinc-200/50 dark:border-white/10 select-none flex-shrink-0 transition-colors">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
          <Sparkles className="w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white leading-none">
            Harmony
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-rose-500 dark:text-rose-400 mt-0.5">
            Music Player
          </span>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 pb-6">
        {/* Core Tabs */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
            Discover
          </div>
          <div className="space-y-0.5">
            {navItems.slice(0, 2).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Library Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
            Library
          </div>
          <div className="space-y-0.5">
            {navItems.slice(2).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Playlists Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
            Smart Playlists
          </div>
          <div className="space-y-0.5">
            {smartItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Playlists */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">
              Playlists
            </span>
            <button
              id="new-playlist-btn"
              onClick={() => setShowNewPlaylistModal(true)}
              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Create New Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-0.5">
            {customPlaylists.map((pl) => {
              const isSelected = activeTab === 'playlist-detail' && selectedPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  id={`playlist-item-${pl.id}`}
                  onClick={() => {
                    setSelectedPlaylistId(pl.id);
                    setActiveTab('playlist-detail');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium truncate transition-all ${
                    isSelected
                      ? 'bg-rose-500/10 text-rose-500 font-bold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <ListMusic className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Tab Quick Button */}
        <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
          <button
            id="nav-item-settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* New Playlist Modal */}
      {showNewPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
              New Playlist
            </h3>
            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="My Chill Hits"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Songs for late night study sessions..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 h-20 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPlaylistModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
