import React, { useRef } from 'react';
import { Search, Sun, Moon, Upload, ChevronLeft, ChevronRight, HardDrive, Music2, Smartphone, Download } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    setActiveTab,
    theme,
    toggleTheme,
    importLocalFiles,
    localTracks,
    isInstallable,
    installApp,
    openMobileInstallModal
  } = useAudio();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importLocalFiles(e.target.files);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-white/10 transition-colors">
      {/* Navigation History & Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => window.history.back()}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Go Forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search songs, artists, albums, or local files..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length > 0) {
                setActiveTab('search');
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-full text-xs sm:text-sm border border-transparent focus:border-rose-500/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right Controls: Local Audio Importer & Theme Switch */}
      <div className="flex items-center gap-3">
        {/* Mobile / PWA App Guide Button */}
        <button
          onClick={openMobileInstallModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
          title="Install Harmony as a Native Mobile or Desktop App"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobile App</span>
        </button>

        {/* Local file import button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*,.mp3,.flac,.m4a,.wav,.aac,.ogg"
          multiple
          className="hidden"
          id="audio-file-input-element"
        />

        <button
          id="import-local-audio-btn"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all hover:scale-[1.02] active:scale-95"
          title="Import MP3/FLAC audio files from your device"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Import Local Audio</span>
          <span className="md:hidden">Import</span>
        </button>

        {/* Local Files Tab Quick Link if local files exist */}
        {localTracks.length > 0 && (
          <button
            onClick={() => setActiveTab('local')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{localTracks.length} Local</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
        </button>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20">
          <Music2 className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
