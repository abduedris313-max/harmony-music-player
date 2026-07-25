import React, { useState, useEffect } from 'react';
import { FolderPlus, Folder, Trash2, Edit2, Music, Plus, Check, FolderGit2 } from 'lucide-react';
import { VirtualFolder, getAllVirtualFoldersDB, saveVirtualFolderDB, deleteVirtualFolderDB } from '../../lib/db';
import { useAudio } from '../../context/AudioContext';
import { TrackRow } from '../common/TrackRow';

export const VirtualFolderManager: React.FC = () => {
  const { localTracks, showToast } = useAudio();
  const [folders, setFolders] = useState<VirtualFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchFolders = async () => {
    try {
      const stored = await getAllVirtualFoldersDB();
      setFolders(stored);
    } catch (err) {
      console.warn('Error reading virtual folders:', err);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: VirtualFolder = {
      id: `vfolder-${Date.now()}`,
      name: newFolderName.trim(),
      trackIds: [],
      createdAt: Date.now(),
    };

    try {
      await saveVirtualFolderDB(newFolder);
      setNewFolderName('');
      setShowCreateModal(false);
      await fetchFolders();
      showToast(`Created virtual folder "${newFolder.name}"`, 'success');
    } catch (err) {
      console.error('Error creating virtual folder:', err);
      showToast('Failed to create virtual folder', 'error');
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    try {
      await deleteVirtualFolderDB(folderId);
      if (activeFolderId === folderId) setActiveFolderId(null);
      await fetchFolders();
      showToast(`Deleted folder "${folderName}"`, 'info');
    } catch (err) {
      console.error('Error deleting virtual folder:', err);
    }
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const activeFolderTracks = activeFolder
    ? localTracks.filter((t) => activeFolder.trackIds.includes(t.id))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-500" /> Virtual Folders
          </h3>
          <p className="text-xs text-zinc-500">
            Organize imported local tracks into custom virtual folders.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:bg-blue-700 transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          New Virtual Folder
        </button>
      </div>

      {/* Folders Grid */}
      {folders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {folders.map((folder) => {
            const isSelected = folder.id === activeFolderId;
            return (
              <div
                key={folder.id}
                onClick={() => setActiveFolderId(isSelected ? null : folder.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30'
                    : 'border-zinc-200/60 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {folder.name}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {folder.trackIds.length} {folder.trackIds.length === 1 ? 'track' : 'tracks'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id, folder.name);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-full hover:bg-rose-500/10 transition-colors"
                    title="Delete folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-zinc-400">
          <Folder className="w-8 h-8 mx-auto stroke-1 mb-2 text-zinc-500" />
          <p className="text-xs font-semibold">No custom virtual folders created yet.</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Click "New Virtual Folder" to categorize your offline tracks.
          </p>
        </div>
      )}

      {/* Selected Folder Tracks */}
      {activeFolder && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-500" /> Folder: {activeFolder.name} ({activeFolderTracks.length})
            </h4>
          </div>

          {activeFolderTracks.length > 0 ? (
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-200/50 dark:border-white/10 p-2 divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {activeFolderTracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  queueList={activeFolderTracks}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 py-4 text-center">
              No tracks assigned to this virtual folder yet.
            </p>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
              Create Virtual Folder
            </h4>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder Name (e.g. Acoustic & Unplugged)"
                required
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
