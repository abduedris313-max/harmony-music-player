import React, { useRef, useState } from 'react';
import { HardDrive, Upload, FolderPlus, Music, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { TrackRow } from '../common/TrackRow';

export const LocalFilesView: React.FC = () => {
  const { localTracks, importLocalFiles, playTrack } = useAudio();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      importLocalFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importLocalFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/50 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-blue-500" />
            Local Music & Downloads
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Import and play audio files (.mp3, .flac, .wav, .m4a) directly from your device.
          </p>
        </div>

        {/* Import Action Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="audio/*,.mp3,.flac,.m4a,.wav,.aac,.ogg"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            Select Audio Files
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 hover:border-blue-500/50 hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <p className="text-base font-bold text-zinc-900 dark:text-white">
            Drag and drop your audio files here
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Supports MP3, FLAC, M4A, WAV, AAC, and OGG files from your system
          </p>
        </div>
      </div>

      {/* Local Track List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Imported Local Tracks ({localTracks.length})
          </h2>
          {localTracks.length > 0 && (
            <button
              onClick={() => playTrack(localTracks[0], localTracks)}
              className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play All Local
            </button>
          )}
        </div>

        {localTracks.length > 0 ? (
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {localTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                queueList={localTracks}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-400 space-y-2">
            <Music className="w-10 h-10 mx-auto stroke-1 text-zinc-500" />
            <p className="text-sm font-semibold">No local files imported yet</p>
            <p className="text-xs">Select or drop audio files to build your offline local music library.</p>
          </div>
        )}
      </div>
    </div>
  );
};
