import React from 'react';
import { AudioProvider, useAudio } from './context/AudioContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { MiniPlayer } from './components/player/MiniPlayer';
import { NowPlayingModal } from './components/player/NowPlayingModal';

import { BrowseView } from './components/views/BrowseView';
import { LibraryView } from './components/views/LibraryView';
import { LocalFilesView } from './components/views/LocalFilesView';
import { SearchView } from './components/views/SearchView';
import { PlaylistDetailView } from './components/views/PlaylistDetailView';
import { SettingsView } from './components/views/SettingsView';
import { SmartPlaylistView } from './components/views/SmartPlaylistView';

import { EqualizerModal } from './components/modals/EqualizerModal';
import { ShareModal } from './components/modals/ShareModal';
import { MobileInstallModal } from './components/modals/MobileInstallModal';

const MainContent: React.FC = () => {
  const {
    activeTab,
    isEqualizerOpen,
    closeEqualizer,
    shareModalTrack,
    closeShareModal,
    isMobileInstallModalOpen,
    closeMobileInstallModal
  } = useAudio();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'browse':
        return <BrowseView />;
      case 'library':
      case 'albums':
      case 'artists':
      case 'favorites':
        return <LibraryView />;
      case 'local':
        return <LocalFilesView />;
      case 'search':
        return <SearchView />;
      case 'playlist-detail':
        return <PlaylistDetailView />;
      case 'settings':
        return <SettingsView />;
      case 'recently-played':
        return <SmartPlaylistView type="recently-played" />;
      case 'most-played':
        return <SmartPlaylistView type="most-played" />;
      default:
        return <BrowseView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans select-none">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Sticky Header */}
        <Header />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-36 sm:pb-40 md:pb-28 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* Mobile Navigation Bar (Fixed at bottom) */}
        <MobileNav />

        {/* Persistent Bottom Mini Player (Fixed directly above MobileNav on mobile, bottom on desktop) */}
        <MiniPlayer />

        {/* Fullscreen Expanded Now Playing View */}
        <NowPlayingModal />

        {/* Global Modals */}
        <EqualizerModal isOpen={isEqualizerOpen} onClose={closeEqualizer} />
        <ShareModal track={shareModalTrack} onClose={closeShareModal} />
        <MobileInstallModal isOpen={isMobileInstallModalOpen} onClose={closeMobileInstallModal} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AudioProvider>
      <MainContent />
    </AudioProvider>
  );
}
