import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Sliders,
  HardDrive,
  Info,
  ShieldCheck,
  FileText,
  MessageSquare,
  Star,
  RotateCcw,
  Sparkles,
  Volume2,
  Trash2,
  CheckCircle2,
  Zap,
  Download,
  Bell,
  Smartphone,
  Check
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { EqualizerModal } from '../modals/EqualizerModal';
import { PrivacyPolicyModal, TermsModal, FeedbackModal, RateAppModal } from '../modals/PolicyModals';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    isEqEnabled,
    setEqEnabled,
    crossfadeDuration,
    setCrossfadeDuration,
    isLosslessEnabled,
    setLosslessEnabled,
    normalizeVolume,
    setNormalizeVolume,
    restoreDefaults,
    isInstallable,
    isAppInstalled,
    installApp,
    notificationPermission,
    notificationsEnabled,
    requestNotificationPermission,
    toggleNotifications,
    sendTrackNotification,
    currentTrack,
    openMobileInstallModal
  } = useAudio();

  const [isEqModalOpen, setEqModalOpen] = useState(false);
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);
  const [isTermsOpen, setTermsOpen] = useState(false);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isRateOpen, setRateOpen] = useState(false);

  const [cacheSize, setCacheSize] = useState('18.4 MB');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearCache = () => {
    setCacheSize('0.0 KB');
    showToast('Cache cleared successfully! 18.4 MB liberated.');
  };

  const handleConfirmRestoreDefaults = () => {
    restoreDefaults();
    setShowRestoreConfirm(false);
    showToast('All app settings restored to factory defaults!');
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Title Banner */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-200/60 dark:border-zinc-800">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Application Settings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Customize audio playback, theme appearance, equalizer, and storage
          </p>
        </div>
      </div>

      {/* 1. Theme Selection */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
          <Sun className="w-4 h-4 text-rose-500" />
          <span>Appearance & Theme Mode</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              theme === 'light'
                ? 'bg-rose-500/10 border-rose-500 text-rose-600 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-rose-500/10 border-rose-500 text-rose-500 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
            }`}
          >
            <Moon className="w-6 h-6 text-indigo-400" />
            <span className="text-xs">Dark Mode</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              theme === 'system'
                ? 'bg-rose-500/10 border-rose-500 text-rose-500 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
            }`}
          >
            <Laptop className="w-6 h-6 text-blue-400" />
            <span className="text-xs">System Default</span>
          </button>
        </div>
      </div>

      {/* Progressive Web App (PWA) & Notification Access */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 shadow-md space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
          <Smartphone className="w-4 h-4 text-rose-500" />
          <span>App Installation & System Notifications</span>
        </div>

        {/* 1. PWA Install Control */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    Install Harmony App
                  </span>
                  {isAppInstalled ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Installed (Standalone)
                    </span>
                  ) : isInstallable ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                      Ready to Install
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold">
                      Web App Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Install Harmony as a native desktop or mobile PWA for full-screen audio playback and offline support.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openMobileInstallModal}
                className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                Setup Guide
              </button>
              {!isAppInstalled && (
                <button
                  onClick={installApp}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isInstallable ? 'Install Now' : 'App Status'}
                </button>
              )}
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-zinc-400" />
            <span>On iOS/Safari: Tap Share icon <span className="font-mono">⎋</span> then select <strong className="text-zinc-700 dark:text-zinc-300">"Add to Home Screen"</strong>.</span>
          </div>
        </div>

        {/* 2. Push Notification Control */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    Now Playing Notifications
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    notificationPermission === 'granted' && notificationsEnabled
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : notificationPermission === 'denied'
                      ? 'bg-rose-500/10 text-rose-500'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {notificationPermission === 'granted' && notificationsEnabled
                      ? 'Enabled'
                      : notificationPermission === 'denied'
                      ? 'Blocked in Browser'
                      : 'Permission Needed'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Receive background notifications when songs change with artwork, artist details, and playback controls.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notificationPermission === 'granted' ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => toggleNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              ) : (
                <button
                  onClick={requestNotificationPermission}
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105 active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5" /> Enable Access
                </button>
              )}
            </div>
          </div>

          {notificationPermission === 'granted' && notificationsEnabled && (
            <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 flex justify-end">
              <button
                onClick={() => {
                  if (currentTrack) {
                    sendTrackNotification(currentTrack, 'Test Notification', `${currentTrack.title} by ${currentTrack.artist}`);
                    showToast('Test notification sent!');
                  }
                }}
                className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> Send Test Notification
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Audio Settings & Equalizer */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
            <Sliders className="w-4 h-4 text-rose-500" />
            <span>Audio & Equalizer DSP</span>
          </div>
          <button
            onClick={() => setEqModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <Sliders className="w-3.5 h-3.5" /> Open Equalizer
          </button>
        </div>

        {/* Equalizer Quick Switch */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">
              Software Equalizer Engine
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {isEqEnabled ? 'Active (5-Band Frequency Response)' : 'Disabled (Flat Bypass)'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEqEnabled}
              onChange={(e) => setEqEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {/* Lossless Audio Mode */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                Lossless Audio Output (FLAC 24-bit/96kHz)
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Preserve uncompressed high fidelity audio
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isLosslessEnabled}
              onChange={(e) => setLosslessEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {/* Crossfade Duration Slider */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-900 dark:text-white">Song Crossfade Transition</span>
            <span className="font-mono text-rose-500">{crossfadeDuration} Seconds</span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={crossfadeDuration}
            onChange={(e) => setCrossfadeDuration(parseInt(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Normalize Volume */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-rose-500" />
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                Normalize Volume Level
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Maintain uniform loudness across all songs
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={normalizeVolume}
              onChange={(e) => setNormalizeVolume(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>
      </div>

      {/* 3. Cache & Storage Management */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
          <HardDrive className="w-4 h-4 text-rose-500" />
          <span>Cache & Storage Management</span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">
              Cached Artwork & Audio Buffers
            </span>
            <span className="text-xs font-mono text-zinc-500">
              Current Usage: {cacheSize}
            </span>
          </div>

          <button
            onClick={handleClearCache}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-500 hover:text-white text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cache
          </button>
        </div>
      </div>

      {/* 4. About & Legal Options */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
            <Info className="w-4 h-4 text-rose-500" />
            <span>About Application</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold font-mono">
            v2.4.0 Harmony
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <p className="font-bold text-zinc-900 dark:text-white">
            Harmony Music Player
          </p>
          <p>
            An advanced, high-performance web audio application with 5-band Web Audio DSP equalizer, custom playlist manager, and local audio importing.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => setPrivacyOpen(true)}
            className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Privacy Policy
          </button>

          <button
            onClick={() => setTermsOpen(true)}
            className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            Terms of Service
          </button>

          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Send Feedback
          </button>

          <button
            onClick={() => setRateOpen(true)}
            className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Rate App
          </button>
        </div>
      </div>

      {/* 5. Restore Factory Defaults */}
      <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Restore Factory Defaults
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Reset theme, audio equalizer, playback settings, and playlists to default
            </p>
          </div>

          <button
            onClick={() => setShowRestoreConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore
          </button>
        </div>

        {showRestoreConfirm && (
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-500/30 space-y-3">
            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              Are you sure you want to restore factory defaults? This will reset all equalizer presets and theme settings.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestoreDefaults}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md"
              >
                Yes, Restore Everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EqualizerModal isOpen={isEqModalOpen} onClose={() => setEqModalOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setTermsOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <RateAppModal isOpen={isRateOpen} onClose={() => setRateOpen(false)} />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};
