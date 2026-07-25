import React, { useState } from 'react';
import { X, ShieldCheck, FileText, MessageSquare, Star, Send, CheckCircle2, Heart } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Privacy Policy
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed scrollbar-thin">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            Last Updated: July 24, 2026
          </p>
          <p>
            Harmony Music Player respects your privacy. All your local tracks, custom playlists, listening history, and audio equalizer settings are stored strictly locally on your device using web browser local storage and IndexedDB.
          </p>
          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">1. Data Collection</h4>
          <p>
            We do not sell, stream, transmit, or record your personal audio files to any external remote servers. All audio file decoding, metadata scanning, and equalizer filtering happen client-side within your browser environment.
          </p>
          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">2. Cookies & Local Storage</h4>
          <p>
            Local storage is utilized exclusively to persist your user choices such as Light/Dark theme preference, custom equalizer presets, favorite track IDs, and user created playlists.
          </p>
          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">3. Analytics & Telemetry</h4>
          <p>
            No external third-party tracking scripts or advertising SDKs are included in Harmony.
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600">
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Terms of Service
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed scrollbar-thin">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            Effective Date: July 2026
          </p>
          <p>
            By accessing or using Harmony Music Player, you agree to comply with and be bound by these Terms of Service.
          </p>
          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">1. Audio File Licensing & Ownership</h4>
          <p>
            You are solely responsible for ensuring that any audio files you import into Harmony Music Player comply with local copyright laws. Harmony does not host or distribute copyrighted music files without authorization.
          </p>
          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">2. Software Usage</h4>
          <p>
            Harmony is provided "as is" without warranties of any kind. Equalizer and Web Audio processing capabilities depend on browser Web Audio API support.
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600">
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export const FeedbackModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      setEmail('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Send Feedback
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              Thank You for Your Feedback!
            </h4>
            <p className="text-xs text-zinc-500">
              We read every message to make Harmony Music Player even better.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Your Email (Optional)</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Feedback or Feature Request</label>
              <textarea
                required
                rows={4}
                placeholder="Let us know what feature or improvement you'd love to see..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 flex items-center gap-1.5 shadow-md shadow-rose-500/20"
              >
                <Send className="w-3.5 h-3.5" /> Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const RateAppModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [rated, setRated] = useState(false);

  if (!isOpen) return null;

  const handleRate = () => {
    setRated(true);
    setTimeout(() => {
      setRated(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Heart className="w-6 h-6 fill-current" />
        </div>

        {rated ? (
          <div className="py-4 space-y-2">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              Thanks for Rating!
            </h4>
            <p className="text-xs text-zinc-500">
              Your review keeps Harmony ad-free & high-quality.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Enjoying Harmony Music Player?
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Tap a star to rate your experience
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800"
              >
                Not Now
              </button>
              <button
                onClick={handleRate}
                className="px-6 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 shadow-md shadow-amber-500/20"
              >
                Submit Rating
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
