import React from 'react';
import { Compass, Music, Search, Heart, Settings } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { ActiveTab } from '../../types/music';
import { triggerHaptic } from '../../utils/haptics';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useAudio();

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'browse', label: 'Listen Now', icon: <Compass className="w-5 h-5" /> },
    { id: 'library', label: 'Library', icon: <Music className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'favorites', label: 'Loved', icon: <Heart className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <nav
      id="mobile-bottom-nav-bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-200/60 dark:border-white/10 shadow-2xl flex items-center justify-around px-2 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`mobile-nav-${tab.id}`}
            onClick={() => {
              triggerHaptic(12);
              setActiveTab(tab.id);
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-90 ${
              isActive
                ? 'text-rose-500 font-bold scale-105'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
