import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Disc, User, Music, Tag, Calendar, Hash } from 'lucide-react';
import { Track } from '../../types/music';

interface TrackEditModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (trackId: string, updates: Partial<Track>) => Promise<void>;
}

export const TrackEditModal: React.FC<TrackEditModalProps> = ({
  track,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setAlbum(track.album || '');
      setGenre(track.genre || '');
      setYear(track.releaseYear ? String(track.releaseYear) : '');
    }
  }, [track]);

  if (!isOpen || !track) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(track.id, {
        title,
        artist,
        album,
        genre,
        releaseYear: year ? parseInt(year, 10) : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error saving metadata tags:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full bg-zinc-100 dark:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
              Edit Metadata Tags
            </h3>
            <p className="text-xs text-zinc-500">
              Update Title, Artist, and Album tags in your IndexedDB local library.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-rose-500" /> Track Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Track Title"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" /> Artist Name
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Artist Name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-rose-500" /> Album Name
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Album Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-500" /> Genre
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. Pop, Jazz, Electronic"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" /> Release Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. 2024"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Tag Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
