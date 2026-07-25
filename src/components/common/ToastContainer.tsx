import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { WifiOff, Wifi, CheckCircle2, AlertTriangle, AlertCircle, Info, X, Share2 } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAudio();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type: string, message: string) => {
    if (message.toLowerCase().includes('offline')) return <WifiOff className="w-4 h-4 text-amber-500" />;
    if (message.toLowerCase().includes('online') || message.toLowerCase().includes('restored')) return <Wifi className="w-4 h-4 text-emerald-500" />;
    if (message.toLowerCase().includes('share') || message.toLowerCase().includes('copied')) return <Share2 className="w-4 h-4 text-rose-500" />;

    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200';
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200';
      case 'error':
        return 'border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200';
      default:
        return 'border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100';
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none max-w-md w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 w-full ${getTypeStyle(
            toast.type
          )}`}
        >
          <div className="flex-shrink-0">{getIcon(toast.type, toast.message)}</div>
          <p className="text-xs font-semibold leading-snug flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
