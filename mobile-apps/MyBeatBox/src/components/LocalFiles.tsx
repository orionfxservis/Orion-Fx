import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileMusic, Trash2, FolderSync, Plus, Check } from 'lucide-react';
import { Song, Playlist, ThemeConfig } from '../types';

interface LocalFilesProps {
  playlists: Playlist[];
  onSelectSong: (song: Song) => void;
  onAddLocalSongToPlaylist: (pId: string, song: Song) => void;
  theme: ThemeConfig;
  onAddLocalSongToCoreList: (song: Song) => void;
}

// Open and Manage IndexedDB for Offline Audio File Blobs
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncBeatLocalFilesDB', 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(request.error);
  });
};

export default function LocalFiles({
  playlists,
  onSelectSong,
  onAddLocalSongToPlaylist,
  theme,
  onAddLocalSongToCoreList,
}: LocalFilesProps) {
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load persistent files from IndexedDB on startup
  useEffect(() => {
    loadLocalFilesFromDB();
  }, []);

  const loadLocalFilesFromDB = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction('files', 'readonly');
      const store = transaction.objectStore('files');
      const request = store.getAll();

      request.onsuccess = () => {
        const storedFiles = request.result || [];
        const loadedSongs: Song[] = storedFiles.map((item: any) => {
          // Recreate Object URL from binary blob
          const url = URL.createObjectURL(item.fileBlob);
          return {
            id: item.id,
            title: item.title,
            artist: item.artist,
            album: 'Local Synced Storage',
            duration: item.duration,
            durationSec: item.durationSec || 180,
            url,
            coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=250&auto=format&fit=crop',
            genre: 'Local Audio',
            isLocal: true,
          };
        });

        setLocalSongs(loadedSongs);
        loadedSongs.forEach((song) => onAddLocalSongToCoreList(song));
      };
    } catch (err) {
      console.error('Failed to load local audio files from IndexedDB:', err);
    }
  };

  const handleFileDrop = async (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const processFiles = async (files: FileList) => {
    setLoading(true);
    const db = await openDB();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/')) {
        alert('Invalid file format. Please drop valid audio files.');
        continue;
      }

      // Read audio duration using offline audio element parsing
      const durationStr = await parseAudioDuration(file);

      const songId = 'local-' + Math.random().toString(36).substring(2, 9);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, ''); // Strip extension

      const fileRecord = {
        id: songId,
        title: cleanTitle,
        artist: 'My Local Archive',
        duration: durationStr,
        durationSec: 200,
        fileBlob: file,
        uploadedAt: Date.now(),
      };

      // Put record in IndexedDB
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('files', 'readwrite');
        const store = transaction.objectStore('files');
        const request = store.put(fileRecord);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    setLoading(false);
    await loadLocalFilesFromDB(); // Reload list
  };

  const parseAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        URL.revokeObjectURL(audio.src);
        resolve(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      };
      audio.onerror = () => {
        resolve('3:00'); // fallback
      };
    });
  };

  const handleDeleteLocalSong = async (id: string) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('files', 'readwrite');
      const store = transaction.objectStore('files');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Revoke any existing object URL to release browser memory
      const songToDelete = localSongs.find(s => s.id === id);
      if (songToDelete) {
        URL.revokeObjectURL(songToDelete.url);
      }

      await loadLocalFilesFromDB();
    } catch (err) {
      console.error('Failed to delete local record:', err);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="local-files-workspace" className={`p-6 rounded-2xl border ${theme.cardClass} ${theme.borderClass} shadow-lg relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div>
          <h2 className={`font-bold text-lg flex items-center gap-2 ${theme.textClass}`}>
            <FolderSync className="w-5 h-5 text-emerald-400" />
            Local Music Library Sync
          </h2>
          <p className={`text-xs ${theme.mutedTextClass}`}>Sync local .mp3 or .wav files securely to your persistent browser cache.</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/5 uppercase">
          IndexedDB Sync
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sync Dropzone Area */}
        <div className="flex flex-col gap-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleFileDrop}
            onClick={triggerFileSelect}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all duration-200 ${
              dragging
                ? 'border-emerald-400 bg-emerald-500/5'
                : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="audio/*"
              className="hidden"
            />
            <Upload className="w-10 h-10 text-emerald-400/70 mb-3 animate-bounce" />
            <h3 className={`font-semibold text-sm ${theme.textClass}`}>Drag and Drop Local Audio</h3>
            <p className={`text-xs ${theme.mutedTextClass} mt-1 max-w-xs`}>
              Supports MP3, WAV, or AAC. Files are securely copied to your device's persistent browser storage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-[11px] text-white/50 space-y-2">
            <h4 className="font-semibold text-white/70">Offline Access Enabled</h4>
            <p>
              Tracks uploaded here operate entirely within the browser's sandbox database. No network required, providing persistent audio enjoyment without data constraints.
            </p>
          </div>
        </div>

        {/* Local Synced Tracks Listing */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-mono tracking-wider text-white/40">Synced Local Tracks ({localSongs.length})</h3>

          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {localSongs.map((song) => (
              <div
                key={song.id}
                className="group p-3 rounded-xl bg-black/25 border border-white/5 hover:border-white/10 flex items-center justify-between transition"
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => onSelectSong(song)}
                >
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 border border-emerald-500/10">
                    <FileMusic className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-xs truncate ${theme.textClass}`}>{song.title}</p>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-white/40">{song.duration}</span>

                  {/* Add to Playlist button */}
                  {playlists.length > 0 && (
                    <div className="relative group/playlist">
                      <button className="p-1.5 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-white/5 transition">
                        <Plus className="w-4 h-4" />
                      </button>
                      {/* Dropdown for playlists */}
                      <div className="absolute right-0 bottom-full mb-1 w-40 bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden hidden group-hover/playlist:block z-20">
                        <div className="p-1.5 text-[9px] font-mono text-white/30 uppercase border-b border-white/5">Add to playlist</div>
                        <div className="max-h-28 overflow-y-auto">
                          {playlists.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                onAddLocalSongToPlaylist(p.id, song);
                                alert(`Synced track added to "${p.name}"`);
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-[11px] text-white/80 hover:bg-emerald-500 hover:text-black transition"
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleDeleteLocalSong(song.id)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {localSongs.length === 0 && (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-6 text-white/30">
                <FileMusic className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-xs">No local synced tracks yet.</p>
                <p className="text-[10px] mt-0.5">Drop files on the left to initialize persistent offline catalog.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
