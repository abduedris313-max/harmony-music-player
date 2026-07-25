import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Share,
  PlusSquare,
  Download,
  CheckCircle2,
  Code2,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Apple,
  Globe
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { triggerHaptic } from '../../utils/haptics';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isInstallable, installApp, isAppInstalled } = useAudio();
  const [activeTab, setActiveTab] = useState<'pwa' | 'ios' | 'developer'>('pwa');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    triggerHaptic(15);
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Install Harmony App
                {isAppInstalled && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    Installed
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Native mobile & desktop app setup guide
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-1.5 gap-1">
          <button
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('pwa');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            <span>Instant Mobile PWA</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('ios');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
            <span>iOS Safari Setup</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('developer');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'developer'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Capacitor / APK</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {/* TAB 1: Instant PWA Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-zinc-900 dark:text-white">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      PWA Installation Requirements
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Browsers allow one-click PWA installation on <strong>HTTPS</strong> or <strong>localhost</strong>. When accessing via <strong>0.0.0.0</strong> or embedded in an iframe preview, browsers require direct secure navigation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Iframe or Non-Localhost HTTP Notice */}
              {typeof window !== 'undefined' && window.self !== window.top && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      Embedded Preview Detected
                    </span>
                    <button
                      onClick={() => {
                        triggerHaptic(15);
                        window.open(window.location.href, '_blank');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in New Tab
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    Browsers hide the native install prompt inside preview frames. Open in a new tab to trigger the direct PWA install prompt.
                  </p>
                </div>
              )}

              {isInstallable ? (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Ready for One-Click Install
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Supported
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      triggerHaptic(15);
                      await installApp();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Install Harmony App Now
                  </button>
                </div>
              ) : isAppInstalled ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-500" />
                  <div>
                    <h5 className="text-xs font-bold">App Already Running Standalone</h5>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      You are using Harmony as an installed app on your device screen!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-rose-500" /> Installing on 0.0.0.0 / Custom IP Hosts:
                  </h5>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-rose-500">•</span>
                      <span><strong>Using localhost instead of 0.0.0.0:</strong> Open <code className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded text-[11px] font-mono">http://localhost:3000</code> in Chrome/Edge — browsers treat localhost as secure and unlock immediate PWA installation!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-rose-500">•</span>
                      <span><strong>Testing raw IP / 0.0.0.0 in Chrome:</strong> Enable <code className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded text-[11px] font-mono">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code> and add your server IP to bypass browser origin limits.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-rose-500">•</span>
                      <span><strong>Chrome Menu Install:</strong> Click browser menu <strong className="text-zinc-800 dark:text-zinc-200">(⋮) &gt; "Install Harmony"</strong> or "Add to Home Screen".</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: iOS Safari Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Apple className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                  iPhone & iPad Installation:
                </h4>
                
                <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0 font-bold">1</div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                        Open in Safari <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Ensure you are opening this link in Apple Safari on iOS.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0 font-bold">2</div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                        Tap Share Button <Share className="w-3.5 h-3.5 text-blue-500" />
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Tap the blue Share icon at the bottom center of Safari navigation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0 font-bold">3</div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                        Tap "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Scroll down the action list and select "Add to Home Screen".
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Developer Capacitor / Native APK Steps */}
          {activeTab === 'developer' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Want to build a standalone <strong>.APK (Android)</strong> or <strong>.IPA / Xcode Project (iOS)</strong> from this codebase? Use <strong>Capacitor</strong>:
              </p>

              <div className="p-3.5 rounded-2xl bg-zinc-900 text-zinc-100 font-mono text-[11px] space-y-2 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 text-[10px] pb-1 border-b border-zinc-800">
                  <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Capacitor Commands</span>
                  <button
                    onClick={() => copyToClipboard('npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios\nnpx cap init Harmony com.harmony.app --web-dir dist\nnpx cap add android\nnpx cap add ios\nnpx cap sync', 'cap')}
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copiedCmd === 'cap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'cap' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <div className="space-y-1 text-zinc-300 overflow-x-auto">
                  <p className="text-emerald-400"># 1. Install Capacitor CLI & Platforms</p>
                  <p>npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios</p>
                  <p className="text-emerald-400 pt-1"># 2. Initialize Capacitor & Build Project</p>
                  <p>npx cap init Harmony com.harmony.app --web-dir dist</p>
                  <p>npm run build</p>
                  <p className="text-emerald-400 pt-1"># 3. Add Android / iOS Platforms</p>
                  <p>npx cap add android</p>
                  <p>npx cap add ios</p>
                  <p className="text-emerald-400 pt-1"># 4. Open Android Studio or Xcode to compile APK/IPA</p>
                  <p>npx cap open android</p>
                  <p>npx cap open ios</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200/60 dark:border-zinc-800 flex justify-end">
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-transform active:scale-95"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
