import React, { useRef, useState } from 'react';
import { HardDrive, Upload, FolderPlus, FolderSearch, Music, Play, Edit3, Trash2, Loader2, Database, FolderGit2, Cast } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { TrackRow } from '../common/TrackRow';
import { TrackEditModal } from '../modals/TrackEditModal';
import { StorageUsageCard } from '../local/StorageUsageCard';
import { VirtualFolderManager } from '../local/VirtualFolderManager';
import { DLNADeviceSelector } from '../dlna/DLNADeviceSelector';
import { importDirectoryWithPicker, processAudioFilesBatch, DirectoryScanProgress } from '../../lib/directoryScanner';
import { Track } from '../../types/music';

export const LocalFilesView: React.FC = () => {
  const { localTracks, setLocalTracks, playTrack, updateLocalTrackMetadata, deleteLocalTrack, showToast } = useAudio();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [scanProgress, setScanProgress] = useState<DirectoryScanProgress | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Track Edit Modal State
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'tracks' | 'folders' | 'storage'>('tracks');

  // Directory Picker import using File System Access API
  const handleDirectoryPickerImport = async () => {
    setIsScanning(true);
    try {
      const newTracks = await importDirectoryWithPicker((prog) => {
        setScanProgress(prog);
      });

      if (newTracks.length > 0) {
        setLocalTracks((prev) => [...newTracks, ...prev]);
        showToast(`Imported ${newTracks.length} local audio tracks with metadata!`, 'success');
      }
    } catch (err) {
      console.error('Directory scan error:', err);
      showToast('Error scanning directory', 'error');
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  // Folder input fallback handler (<input webkitdirectory />)
  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileArray = (Array.from(e.target.files) as File[]).filter((file) =>
      file.name.match(/\.(mp3|flac|wav|m4a|aac|ogg)$/i)
    );

    if (fileArray.length === 0) {
      showToast('No valid audio files found in selected folder.', 'warning');
      return;
    }

    setIsScanning(true);
    try {
      const newTracks = await processAudioFilesBatch(fileArray, (prog) => {
        setScanProgress(prog);
      });

      if (newTracks.length > 0) {
        setLocalTracks((prev) => [...newTracks, ...prev]);
        showToast(`Successfully extracted ${newTracks.length} tracks with tags!`, 'success');
      }
    } catch (err) {
      console.error('Folder batch scan failed:', err);
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  // Individual file input handler
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileArray = Array.from(e.target.files) as File[];

    setIsScanning(true);
    try {
      const newTracks = await processAudioFilesBatch(fileArray, (prog) => {
        setScanProgress(prog);
      });

      if (newTracks.length > 0) {
        setLocalTracks((prev) => [...newTracks, ...prev]);
        showToast(`Added ${newTracks.length} local tracks to library!`, 'success');
      }
    } catch (err) {
      console.error('File scan failed:', err);
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const files = (Array.from(e.dataTransfer.files) as File[]).filter((file) =>
      file.name.match(/\.(mp3|flac|wav|m4a|aac|ogg)$/i)
    );

    if (files.length === 0) return;

    setIsScanning(true);
    try {
      const newTracks = await processAudioFilesBatch(files, (prog) => {
        setScanProgress(prog);
      });

      if (newTracks.length > 0) {
        setLocalTracks((prev) => [...newTracks, ...prev]);
        showToast(`Imported ${newTracks.length} dropped audio files!`, 'success');
      }
    } catch (err) {
      console.error('Drop import error:', err);
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200/50 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-blue-500" />
            Local Music & Directory Manager
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Scan local directories, extract embedded tags, organize virtual folders, and cast via DLNA.
          </p>
        </div>

        {/* Header Action Buttons & DLNA Cast */}
        <div className="flex flex-wrap items-center gap-3">
          <DLNADeviceSelector />

          {/* Directory Picker Action */}
          <button
            onClick={handleDirectoryPickerImport}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <FolderSearch className="w-4 h-4" />
            Scan Directory
          </button>

          {/* Fallback Folder Input */}
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderInputChange}
            {...({ webkitdirectory: 'true', directory: '' } as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
            multiple
            className="hidden"
          />

          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold text-xs flex items-center gap-2 border border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            Select Folder
          </button>

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="audio/*,.mp3,.flac,.m4a,.wav,.aac,.ogg"
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* Progress Indicator for Directory Scanning & Tag Extraction */}
      {isScanning && scanProgress && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-6 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-blue-500">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {scanProgress.isScanningDirectory
                ? 'Scanning directory tree...'
                : `Extracting metadata tags... (${scanProgress.processedCount} of ${scanProgress.totalFilesFound})`}
            </span>
            <span>
              {scanProgress.totalFilesFound > 0
                ? `${Math.round((scanProgress.processedCount / scanProgress.totalFilesFound) * 100)}%`
                : '0%'}
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-mono truncate">
            Current File: {scanProgress.currentFileName}
          </p>

          <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${
                  scanProgress.totalFilesFound > 0
                    ? (scanProgress.processedCount / scanProgress.totalFilesFound) * 100
                    : 10
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Sub Tabs: Tracks, Virtual Folders, Storage Status */}
      <div className="flex items-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-2">
        <button
          onClick={() => setActiveSubTab('tracks')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'tracks'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Local Tracks ({localTracks.length})
        </button>

        <button
          onClick={() => setActiveSubTab('folders')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'folders'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          Virtual Folders
        </button>

        <button
          onClick={() => setActiveSubTab('storage')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'storage'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Storage Status
        </button>
      </div>

      {/* Sub Tab 1: Local Tracks List & Drag-and-Drop */}
      {activeSubTab === 'tracks' && (
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                : 'border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 hover:border-blue-500/50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                Drag and drop audio files or folders here
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Supports .mp3, .flac, .wav, .m4a, .aac, .ogg with embedded tag extraction
              </p>
            </div>
          </div>

          {/* Local Tracks List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                IndexedDB Local Library ({localTracks.length})
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
                  <div key={track.id} className="group relative flex items-center justify-between pr-2">
                    <div className="flex-grow min-w-0">
                      <TrackRow
                        track={track}
                        index={idx}
                        queueList={localTracks}
                      />
                    </div>

                    {/* Track Actions: Edit Metadata & Delete */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pl-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTrack(track);
                        }}
                        className="p-2 text-zinc-400 hover:text-rose-500 rounded-full hover:bg-rose-500/10 transition-colors"
                        title="Edit metadata tags"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLocalTrack(track.id);
                        }}
                        className="p-2 text-zinc-400 hover:text-rose-500 rounded-full hover:bg-rose-500/10 transition-colors"
                        title="Delete from local library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <Music className="w-10 h-10 mx-auto stroke-1 text-zinc-500" />
                <p className="text-sm font-semibold">No local files imported yet</p>
                <p className="text-xs">
                  Scan a directory or select audio files above to populate your offline IndexedDB library.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub Tab 2: Virtual Folders Manager */}
      {activeSubTab === 'folders' && <VirtualFolderManager />}

      {/* Sub Tab 3: Storage Status Card */}
      {activeSubTab === 'storage' && <StorageUsageCard />}

      {/* Track Metadata Edit Modal */}
      <TrackEditModal
        track={editingTrack}
        isOpen={Boolean(editingTrack)}
        onClose={() => setEditingTrack(null)}
        onSave={async (trackId, updates) => {
          await updateLocalTrackMetadata(trackId, updates);
        }}
      />
    </div>
  );
};
