import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail, MessageCircle, Send, Bluetooth, Wifi, Download, Music, Sparkles } from 'lucide-react';
import { Track } from '../../types/music';

interface ShareModalProps {
  track: Track | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ track, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!track) return null;

  const trackShareUrl = window.location.href.split('?')[0] + `?track=${track.id}`;
  const shareText = `Check out "${track.title}" by ${track.artist} on Harmony Music Player!`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: shareText,
          url: trackShareUrl,
        });
        showToast('Shared successfully!');
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.warn('Native share failed:', e);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackShareUrl);
    setCopied(true);
    showToast('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + trackShareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(trackShareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(trackShareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    const url = `mailto:?subject=${encodeURIComponent(`Song Recommendation: ${track.title}`)}&body=${encodeURIComponent(shareText + '\n\n' + trackShareUrl)}`;
    window.open(url, '_self');
  };

  const handleDownloadFile = () => {
    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = `${track.artist} - ${track.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Audio file download started');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-rose-500/10 text-rose-500">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Share Audio & Track
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Preview Card */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-white/5">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-zinc-800">
            {track.coverUrl ? (
              <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <Music className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
              {track.title}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {track.artist} — {track.album}
            </p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              {track.genre}
            </span>
          </div>
        </div>

        {/* System Native Share Button */}
        {'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Open System Share Sheet
          </button>
        )}

        {/* Direct Sharing Channels */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Share Via App
          </label>
          <div className="grid grid-cols-4 gap-3 text-center">
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors"
            >
              <Send className="w-5 h-5" />
              <span className="text-[11px] font-semibold">Telegram</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-[11px] font-semibold">X / Twitter</span>
            </button>

            <button
              onClick={handleShareEmail}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span className="text-[11px] font-semibold">Email</span>
            </button>
          </div>
        </div>

        {/* Nearby / Bluetooth / File Download */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Local Transfer & File
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFile}
              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-rose-500" />
              Export Audio File
            </button>
            <button
              onClick={() => showToast('Ensure Bluetooth / AirDrop / Nearby Share is active on target device')}
              className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              title="AirDrop / Nearby Share Instructions"
            >
              <Wifi className="w-4 h-4 text-blue-500" />
              Nearby
            </button>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Track URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={trackShareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold rounded-full shadow-2xl animate-bounce">
            {toastMessage}
          </div>
        )}

      </div>
    </div>
  );
};
