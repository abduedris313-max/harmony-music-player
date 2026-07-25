import React, { useEffect, useState } from 'react';
import { Database, HardDrive, Trash2, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getStorageEstimateDB, clearAllMediaCacheDB, StorageEstimateInfo } from '../../lib/db';
import { useAudio } from '../../context/AudioContext';

export const StorageUsageCard: React.FC = () => {
  const { showToast, setLocalTracks } = useAudio();
  const [estimate, setEstimate] = useState<StorageEstimateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchStorageInfo = async () => {
    setLoading(true);
    try {
      const info = await getStorageEstimateDB();
      setEstimate(info);
    } catch (err) {
      console.warn('Failed to fetch storage estimate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAllMediaCacheDB();
      setLocalTracks([]);
      showToast('Local cached media and tracks cleared successfully.', 'success');
      await fetchStorageInfo();
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Error clearing media cache:', err);
      showToast('Failed to clear media cache.', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/60 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
              Browser IndexedDB Storage
            </h3>
            <p className="text-xs text-zinc-500">
              Persistent storage for imported local audio files and metadata tags.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStorageInfo}
          disabled={loading}
          className="p-2 text-zinc-400 hover:text-blue-500 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Refresh storage estimate"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Storage Estimate Metrics & Progress Bar */}
      {estimate ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              {estimate.usageFormatted} used of {estimate.quotaFormatted}
            </span>
            <span className="text-blue-500 font-mono">{estimate.percentUsed}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${Math.max(2, estimate.percentUsed)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      )}

      {/* Clear Cache Trigger */}
      <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
        <p className="text-xs text-zinc-400">
          Free up browser memory by removing offline cached audio blobs.
        </p>
        <button
          onClick={() => setShowConfirmModal(true)}
          className="px-4 py-2 rounded-full border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cached Media
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                Clear All Local Media?
              </h4>
              <p className="text-xs text-zinc-500">
                This will delete all stored audio files and custom tags from IndexedDB. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md transition-all"
              >
                {isClearing ? 'Clearing...' : 'Yes, Clear Storage'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
