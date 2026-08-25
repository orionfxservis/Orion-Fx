import React, { useEffect, useRef, useState } from 'react';
import { Play, Plus, Search, Users, MessageSquare, Send, Share2, Music, Trash2, Globe, Sparkles, Check, ChevronRight, ChevronDown, Edit3, X, AlertTriangle, Menu, MoreVertical, ArrowRight, Clock } from 'lucide-react';
import { Song, Playlist, ChatMessage, UserAccount, ThemeConfig } from '../types';

interface PlaylistWorkspaceProps {
  playlists: Playlist[];
  onSelectSong: (song: Song) => void;
  onPlaylistChange: (updatedPlaylist: Playlist) => void;
  onPlayPlaylist: (songs: Song[]) => void;
  activePlaylistId: string | null;
  onSetActivePlaylistId: (id: string | null) => void;
  user: UserAccount;
  allSongs: Song[];
  theme: ThemeConfig;
  isOffline: boolean;
  onRefreshPlaylists: () => void;
}

export default function PlaylistWorkspace({
  playlists,
  onSelectSong,
  onPlaylistChange,
  onPlayPlaylist,
  activePlaylistId,
  onSetActivePlaylistId,
  user,
  allSongs,
  theme,
  isOffline,
  onRefreshPlaylists,
}: PlaylistWorkspaceProps) {
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  
  // Real-time Collaborative States
  const [activeMembers, setActiveMembers] = useState<{ id: string; name: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rename & Delete Group Box States
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);

  // Helper to calculate total playlist duration in minutes
  const calculateTotalMinutes = (songs: Song[]): number => {
    if (!songs || songs.length === 0) return 0;
    let totalSeconds = 0;
    for (const song of songs) {
      if (song.duration) {
        const parts = song.duration.split(':').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          totalSeconds += parts[0] * 60 + parts[1];
        } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else {
          totalSeconds += 240; // fallback 4 mins
        }
      } else {
        totalSeconds += 240;
      }
    }
    return Math.max(1, Math.round(totalSeconds / 60));
  };

  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const activePlaylistRef = useRef<Playlist | null>(null);

  // Keep activePlaylistRef in sync
  useEffect(() => {
    activePlaylistRef.current = activePlaylist;
  }, [activePlaylist]);

  // Load selected playlist and open WebSockets if collaborative
  useEffect(() => {
    if (!activePlaylistId) {
      setActivePlaylist(null);
      closeWebSocket();
      return;
    }

    const playlist = playlists.find((p) => p.id === activePlaylistId);
    if (!playlist) return;

    setActivePlaylist(playlist);
    
    // Fetch initial chat logs from database
    if (playlist.isCollaborative) {
      fetch(`/api/playlists/${playlist.id}/messages`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) {
            setChatMessages(data.messages);
          }
        })
        .catch((err) => console.error('Error fetching chat logs:', err));

      // Connect to WebSocket Server for Real-time Sync
      connectWebSocket(playlist.id);
    } else {
      closeWebSocket();
    }

    return () => {
      closeWebSocket();
    };
  }, [activePlaylistId]); // ONLY depend on activePlaylistId to prevent infinite websocket reconnection loop

  // Keep activePlaylist state in sync when parent playlists prop changes
  useEffect(() => {
    if (!activePlaylistId) return;
    const playlist = playlists.find((p) => p.id === activePlaylistId);
    if (playlist) {
      setActivePlaylist((prev) => {
        // Only update if there is a real change to avoid unnecessary re-renders
        if (!prev || JSON.stringify(prev) !== JSON.stringify(playlist)) {
          return playlist;
        }
        return prev;
      });
    }
  }, [playlists, activePlaylistId]);

  // Scroll chat to bottom
  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  // Polling fallback when WebSocket connection is not active or experiences errors
  useEffect(() => {
    if (!activePlaylistId || isOffline) return;
    
    const currentPlaylist = playlists.find((p) => p.id === activePlaylistId);
    if (!currentPlaylist || !currentPlaylist.isCollaborative) return;

    // Only poll if WebSocket is NOT connected
    if (wsConnected) return;

    console.log(`Starting real-time HTTP polling fallback for collaborative playlist: ${activePlaylistId}`);

    const pollInterval = setInterval(async () => {
      try {
        // 1. Fetch playlist data
        const playlistRes = await fetch(`/api/playlists/${activePlaylistId}`);
        if (playlistRes.ok) {
          const latestPlaylist = await playlistRes.json();
          const activePl = activePlaylistRef.current;
          
          // Only update state if there is a real difference to avoid infinite render loops
          if (
            !activePl ||
            JSON.stringify(latestPlaylist.songs) !== JSON.stringify(activePl.songs) ||
            latestPlaylist.name !== activePl.name ||
            latestPlaylist.description !== activePl.description
          ) {
            setActivePlaylist(latestPlaylist);
            onPlaylistChange(latestPlaylist);
          }

          // Sync members list for presence indicator
          if (latestPlaylist.members) {
            const mappedMembers = latestPlaylist.members.map((m: string) => ({ id: m, name: m }));
            // Add current user if not present
            if (!mappedMembers.some((member: any) => member.id === user.uid || member.name === user.name)) {
              mappedMembers.push({ id: user.uid, name: user.name });
            }
            setActiveMembers(mappedMembers);
          }
        }

        // 2. Fetch chat messages
        const chatRes = await fetch(`/api/playlists/${activePlaylistId}/messages`);
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          if (chatData.messages) {
            setChatMessages((prev) => {
              // Merge lists and preserve uniqueness by ID
              const existingIds = new Set(prev.map((m) => m.id));
              const newMessages = chatData.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
              if (newMessages.length > 0) {
                return [...prev, ...newMessages];
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn('Polling fallback warning (likely offline or network glitch):', err);
      }
    }, 3000);

    return () => {
      console.log(`Clearing polling fallback for collaborative playlist: ${activePlaylistId}`);
      clearInterval(pollInterval);
    };
  }, [activePlaylistId, wsConnected, isOffline, playlists, user]);

  const connectWebSocket = (playlistId: string) => {
    closeWebSocket();

    if (isOffline) {
      console.log('App is offline, skipping real-time WebSocket synchronization.');
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws-collaboration`;
      
      console.log(`Establishing collaboration socket connection to ${wsUrl}...`);
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('Collaboration WebSocket connected successfully!');
        setWsConnected(true);

        // Send Join Room Payload
        socket.send(
          JSON.stringify({
            type: 'join_room',
            playlistId,
            user: { id: user.uid, name: user.name },
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'playlist_sync': {
              console.log('Received playlist sync update from collaborator:', data.playlist);
              setActivePlaylist(data.playlist);
              onPlaylistChange(data.playlist);
              break;
            }
            case 'presence_update': {
              console.log('Received collaborative presence update:', data.users);
              setActiveMembers(data.users);
              break;
            }
            case 'chat_message': {
              setChatMessages((prev) => {
                // Prevent duplicate messages
                if (prev.some((m) => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
              break;
            }
          }
        } catch (err) {
          console.error('Error decoding incoming WebSocket payload:', err);
        }
      };

      socket.onclose = () => {
        console.log('Collaboration WebSocket closed.');
        setWsConnected(false);
      };

      socket.onerror = (error) => {
        console.error('Collaboration WebSocket experienced an error:', error);
        setWsConnected(false);
      };
    } catch (err) {
      console.error('Failed to connect to WS:', err);
      setWsConnected(false);
    }
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setWsConnected(false);
    setActiveMembers([]);
    setChatMessages([]);
  };

  const handleAddSongToPlaylist = async (song: Song) => {
    if (!activePlaylist) return;

    // Check if duplicate
    if (activePlaylist.songs.some((s) => s.id === song.id)) return;

    const updatedSongs = [...activePlaylist.songs, song];
    const updatedPlaylist = { ...activePlaylist, songs: updatedSongs };

    // 1. Optimistic Update locally
    setActivePlaylist(updatedPlaylist);
    onPlaylistChange(updatedPlaylist);

    // 2. Sync via WebSocket to others in real-time
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'playlist_update',
          playlist: updatedPlaylist,
        })
      );
    }

    // 3. Save to Server DB via REST API
    if (!isOffline) {
      try {
        await fetch(`/api/playlists/${activePlaylist.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songs: updatedSongs }),
        });
      } catch (err) {
        console.error('Failed to sync playlist update with REST server:', err);
      }
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!activePlaylist) return;

    const updatedSongs = activePlaylist.songs.filter((s) => s.id !== songId);
    const updatedPlaylist = { ...activePlaylist, songs: updatedSongs };

    // Optimistic Update
    setActivePlaylist(updatedPlaylist);
    onPlaylistChange(updatedPlaylist);

    // Sync via WS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'playlist_update',
          playlist: updatedPlaylist,
        })
      );
    }

    // Save to DB
    if (!isOffline) {
      try {
        await fetch(`/api/playlists/${activePlaylist.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songs: updatedSongs }),
        });
      } catch (err) {
        console.error('Failed to save deleted track:', err);
      }
    }
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim() || !activePlaylist) return;

    const msgPayload = {
      senderId: user.uid,
      senderName: user.name,
      text: newMessageText.trim(),
    };

    // 1. Send via WebSocket for real-time broadcast
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat_message',
          text: msgPayload.text,
        })
      );
    }

    // 2. Persist message in server DB via REST API
    if (!isOffline) {
      fetch(`/api/playlists/${activePlaylist.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgPayload),
      }).catch((err) => console.error('Failed to persist message in database:', err));
    } else {
      // Offline local append mock
      const localMsg: ChatMessage = {
        id: 'msg-local-' + Date.now(),
        playlistId: activePlaylist.id,
        senderId: user.uid,
        senderName: user.name,
        text: msgPayload.text,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, localMsg]);
    }

    setNewMessageText('');
  };

  const handleSocialShare = () => {
    if (!activePlaylist) return;

    // Build real-looking sharing URL
    const shareUrl = `${window.location.origin}/share/playlist/${activePlaylist.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(activePlaylist.id);
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  const handleStartRename = (playlist: Playlist, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPlaylistId(playlist.id);
    setEditingName(playlist.name);
  };

  const handleSaveRename = async (playlistId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditingPlaylistId(null);
      return;
    }

    if (isOffline) {
      const pl = playlists.find((p) => p.id === playlistId);
      if (pl) {
        const updated = { ...pl, name: trimmed };
        onPlaylistChange(updated);
        if (activePlaylist?.id === playlistId) {
          setActivePlaylist(updated);
        }
      }
      setEditingPlaylistId(null);
      onRefreshPlaylists();
      return;
    }

    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const updated = await res.json();
        onPlaylistChange(updated);
        if (activePlaylist?.id === playlistId) {
          setActivePlaylist(updated);
        }
        onRefreshPlaylists();
      }
    } catch (err) {
      console.error('Failed to rename playlist group:', err);
    } finally {
      setEditingPlaylistId(null);
    }
  };

  const createNewPlaylist = async (isCollab: boolean) => {
    const existingSameType = playlists.filter((p) => p.isCollaborative === isCollab).length + 1;
    const name = isCollab ? `Collab Mix #${existingSameType}` : `Personal Mix #${existingSameType}`;
    const desc = isCollab
      ? 'Invite friends using the share button to add and organize tracks together in real-time!'
      : 'My private selection of acoustic high-fidelity tracks.';

    if (isOffline) {
      // Handle offline playlist creation using local store trigger
      const offlineId = 'playlist-offline-' + Math.random().toString(36).substring(2, 9);
      const offlinePlaylist: Playlist = {
        id: offlineId,
        name,
        description: desc,
        createdBy: user.uid,
        createdByName: user.name,
        isCollaborative: isCollab,
        songs: [],
        members: [user.name],
        createdAt: Date.now(),
      };
      onPlaylistChange(offlinePlaylist);
      onSetActivePlaylistId(offlineId);
      setEditingPlaylistId(offlineId);
      setEditingName(name);
      return;
    }

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: desc,
          createdBy: user.uid,
          createdByName: user.name,
          userEmail: user.email || 'iMFaisalHussain@gmail.com',
          isCollaborative: isCollab,
          songs: [],
        }),
      });
      const data = await res.json();
      onRefreshPlaylists();
      onSetActivePlaylistId(data.id);
      setEditingPlaylistId(data.id);
      setEditingName(data.name || name);
    } catch (err) {
      console.error('Failed to create playlist on server:', err);
    }
  };

  const handleDeletePlaylist = async (pId: string) => {
    if (activePlaylistId === pId) {
      onSetActivePlaylistId(null);
    }

    if (isOffline) {
      onRefreshPlaylists();
      return;
    }

    try {
      await fetch(`/api/playlists/${pId}`, { method: 'DELETE' });
      onRefreshPlaylists();
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };

  const handleConfirmDelete = () => {
    if (!playlistToDelete) return;
    const id = playlistToDelete.id;
    setPlaylistToDelete(null);
    handleDeletePlaylist(id);
  };

  const totalTracksCount = playlists.reduce((acc, p) => acc + (p.songs?.length || 0), 0);

  return (
    <div
      id="stage-03-playlist-section-wrapper"
      className="p-4 sm:p-5 rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#241203]/95 via-[#180901]/95 to-[#080200]/95 shadow-xl shadow-amber-950/25 relative overflow-hidden flex flex-col gap-4"
    >
      {/* Background ambient element */}
      <div className="absolute right-0 top-0 w-44 h-44 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* 1. STAGE 03 Badge */}
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
          STAGE 03
        </span>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/80 border border-amber-500/20 uppercase tracking-wider">
          {playlists.length} Lists • {totalTracksCount} Tracks Ready
        </span>
      </div>

      {/* 2. Main Title: 🎵 Playlist */}
      <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3">
        <h2 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2.5 min-h-[28px]">
          <Music className="w-5 h-5 text-amber-400 shrink-0 self-center" />
          <span className="leading-tight self-center">Playlist</span>
        </h2>
        <p className="text-xs sm:text-[13px] text-amber-200/60 leading-snug">
          Organize, customize and collaborate on your personal and shared mixes.
        </p>
      </div>

      {/* Inner Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Playlists Sidebar List */}
        <div id="playlists-sidebar" className="lg:col-span-4 p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-black/40 backdrop-blur-md flex flex-col gap-3.5 shadow-lg relative overflow-hidden">
          {/* Gmail Cloud Account Status Banner */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider font-mono">
                  Saved in Google Account
                </p>
                <p className="text-[11px] font-medium text-white/90 truncate">
                  {user.email || 'iMFaisalHussain@gmail.com'}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-bold">
              SYNCED
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <h2 className="font-bold text-sm sm:text-base flex items-center gap-1.5 text-white">
              <Music className="w-4 h-4 text-amber-400 shrink-0" />
              Playlist Library
            </h2>
            <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
              {playlists.length} Lists
            </span>
          </div>

        {/* Create Playlists Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => createNewPlaylist(false)}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium border border-white/10 hover:border-white/20 hover:bg-white/5 active:scale-95 transition text-white/90"
            id="btn-create-personal-playlist"
            title="Create Private Solo Playlist"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>+ Personal</span>
          </button>
          <button
            onClick={() => createNewPlaylist(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-black transition hover:scale-[1.02] active:scale-95 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20"
            id="btn-create-collab-playlist"
            title="Create Collaborative Live Room"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>Collab Mix</span>
          </button>
        </div>

        {/* Playlist Items */}
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          {playlists.map((playlist) => {
            const isActive = playlist.id === activePlaylistId;
            const isEditingThis = editingPlaylistId === playlist.id;

            if (isEditingThis) {
              return (
                <div
                  key={playlist.id}
                  className="p-2.5 rounded-xl border border-amber-400/60 bg-[#160801] shadow-lg flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(playlist.id);
                      if (e.key === 'Escape') setEditingPlaylistId(null);
                    }}
                    autoFocus
                    className="flex-1 min-w-0 bg-black/60 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                    placeholder="Enter group name..."
                  />
                  <button
                    onClick={() => handleSaveRename(playlist.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-500/30 shrink-0 transition"
                    title="Save Name"
                    aria-label="Save Name"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingPlaylistId(null)}
                    className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 shrink-0 transition"
                    title="Cancel"
                    aria-label="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={playlist.id}
                onClick={() => onSetActivePlaylistId(playlist.id)}
                className={`group p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center justify-between ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-400/60 shadow-lg ring-1 ring-amber-500/40'
                    : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="min-w-0 pr-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-semibold text-xs truncate ${isActive ? 'text-amber-200' : 'text-white'}`}>
                      {playlist.name}
                    </span>
                    {playlist.isCollaborative && (
                      <span className="shrink-0 flex items-center px-1.5 py-0.5 rounded-full text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/20 font-mono">
                        COLLAB
                      </span>
                    )}
                    {isActive && (
                      <span className="shrink-0 flex items-center px-1.5 py-0.2 rounded text-[8px] bg-amber-400 text-black font-bold font-mono">
                        OPEN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] truncate text-white/40 mt-0.5">
                    {playlist.songs.length} track{playlist.songs.length === 1 ? '' : 's'} • by {playlist.createdByName}
                  </p>
                </div>
                {/* Action Buttons: Rename, Dropdown Close & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleStartRename(playlist, e)}
                    className="p-1.5 rounded-lg text-white/60 hover:text-amber-300 hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 transition-all"
                    title="Rename Playlist"
                    aria-label={`Rename ${playlist.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {/* Dropdown Close Playlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isActive) {
                        onSetActivePlaylistId(null);
                      } else {
                        onSetActivePlaylistId(playlist.id);
                      }
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isActive
                        ? 'text-amber-300 hover:text-white bg-amber-500/25 hover:bg-amber-500/40 border-amber-500/40'
                        : 'text-white/50 hover:text-white hover:bg-white/10 border-white/5 hover:border-white/20'
                    }`}
                    title={isActive ? "Close / Collapse this playlist" : "Open playlist"}
                    aria-label={isActive ? `Close ${playlist.name}` : `Open ${playlist.name}`}
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-180 text-amber-300' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaylistToDelete(playlist);
                    }}
                    className="p-1.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/15 border border-white/5 hover:border-red-500/30 transition-all"
                    title="Delete Playlist"
                    aria-label={`Delete ${playlist.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {playlists.length === 0 && (
            <div className="text-center py-6 text-white/40 text-xs">
              No playlists found. Create one above to get started!
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Playlist Details & Workspace */}
      <div id="active-playlist-workspace" className="lg:col-span-8 flex flex-col gap-6">
        {activePlaylist ? (
          <div className="p-4 sm:p-6 rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#2a1503]/95 via-[#1b0a01]/95 to-[#080200]/95 shadow-xl shadow-amber-950/25 relative overflow-hidden">
            {/* Playlist Bio Header - Compact Meta & Quick Actions */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <div className="min-w-0 flex-1">
                {editingPlaylistId === activePlaylist.id ? (
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(activePlaylist.id);
                        if (e.key === 'Escape') setEditingPlaylistId(null);
                      }}
                      autoFocus
                      className="bg-black/70 border border-amber-400 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                      placeholder="Group / Playlist Name"
                    />
                    <button
                      onClick={() => handleSaveRename(activePlaylist.id)}
                      className="flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-500/30 text-xs font-semibold active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setEditingPlaylistId(null)}
                      className="flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 text-xs font-semibold active:scale-95"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                      {activePlaylist.name}
                    </h3>
                    
                    {/* Track counter badge in header */}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activePlaylist.songs.length} Tracks • {calculateTotalMinutes(activePlaylist.songs)} min
                    </span>

                    {/* Rename Button */}
                    <button
                      onClick={() => handleStartRename(activePlaylist)}
                      className="flex items-center gap-1 min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition active:scale-95 cursor-pointer"
                      title="Rename Playlist"
                      id="btn-rename-active-group"
                      aria-label="Rename Playlist"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Rename</span>
                    </button>

                    {/* Dropdown Button to Close the Playlist */}
                    <button
                      onClick={() => onSetActivePlaylistId(null)}
                      className="flex items-center gap-1 min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-500/20 hover:border-amber-400/40 transition active:scale-95 cursor-pointer group/closedropdown"
                      title="Close this Playlist"
                      id="btn-dropdown-close-playlist"
                      aria-label="Close Playlist"
                    >
                      <ChevronDown className="w-3.5 h-3.5 group-hover/closedropdown:translate-y-0.5 transition-transform" />
                      <span>Close</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setPlaylistToDelete(activePlaylist)}
                      className="flex items-center gap-1 min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 transition active:scale-95 cursor-pointer"
                      title="Delete Group"
                      id="btn-delete-active-group"
                      aria-label="Delete Group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>

                    {/* Real-time sync status indicator in natural flex flow */}
                    {activePlaylist.isCollaborative && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono bg-black/40 border border-white/10 shrink-0 shadow-sm">
                        <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : !isOffline ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
                        <span className="text-white/70">
                          {wsConnected ? 'Real-Time Sync Live' : !isOffline ? 'Synced (Polling)' : 'Offline Mode'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-[11px] sm:text-xs mt-1 max-w-lg text-amber-200/60">{activePlaylist.description}</p>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => onPlayPlaylist(activePlaylist.songs)}
                  disabled={activePlaylist.songs.length === 0}
                  className={`flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-black transition hover:scale-105 active:scale-95 cursor-pointer ${
                    activePlaylist.songs.length > 0 ? theme.primaryButtonClass : 'bg-white/10 text-white/25 cursor-not-allowed'
                  }`}
                  id="btn-play-all-playlist"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play All
                </button>

                {activePlaylist.isCollaborative && (
                  <>
                    <button
                      onClick={handleSocialShare}
                      className="flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 hover:border-white/20 hover:bg-white/5 transition text-white/90 active:scale-95 cursor-pointer"
                      id="btn-share-collab"
                    >
                      {copiedId === activePlaylist.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className={`flex items-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 cursor-pointer ${
                        showChat
                          ? `${theme.accentClass} ${theme.borderClass} text-white`
                          : 'bg-black/30 border-white/5 text-white/70 hover:bg-white/5'
                      }`}
                      id="btn-toggle-chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat ({chatMessages.length})</span>
                    </button>
                  </>
                )}

                {/* Close (X) Active Playlist Button */}
                <button
                  onClick={() => onSetActivePlaylistId(null)}
                  className="flex items-center gap-1 min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition active:scale-95 cursor-pointer"
                  title="Close this playlist view"
                  aria-label="Close Playlist View"
                  id="btn-close-active-playlist-view"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Collaborative Active Users Bar */}
            {activePlaylist.isCollaborative && activeMembers.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Collaborating Friends Active:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeMembers.map((member) => (
                    <span
                      key={member.id}
                      className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 font-mono uppercase"
                    >
                      {member.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Main Area Split: Songs List and Chat Sidebar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* SONGS LIST WITH STAGE 03 SPEC */}
              <div className={showChat ? 'md:col-span-7 flex flex-col gap-4' : 'md:col-span-12 flex flex-col gap-4'}>
                
                {/* Stage 03 Track Stack Box */}
                <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden divide-y divide-white/[0.06] shadow-lg">
                  {activePlaylist.songs.map((song, index) => (
                    <div
                      key={song.id + '-' + index}
                      className="group p-3 sm:p-3.5 hover:bg-white/[0.04] flex items-center justify-between transition-colors relative"
                    >
                      {/* Left: Drag Handle ≡ (large touch target min 44x44) + 🖼 Cover + Title/Artist */}
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                        {/* Drag Handle ≡ with Large Touch Target */}
                        <div
                          className="w-11 h-11 min-w-[44px] flex items-center justify-center text-white/40 hover:text-white/80 transition cursor-grab active:cursor-grabbing shrink-0"
                          title="Drag to reorder track"
                          aria-label="Reorder track"
                        >
                          <Menu className="w-5 h-5 stroke-[2.2]" />
                        </div>

                        {/* 🖼 Album Art Cover */}
                        <div
                          className="relative w-12 h-12 min-w-[48px] rounded-xl overflow-hidden border border-white/10 shadow-md shrink-0 cursor-pointer group/art"
                          onClick={() => onSelectSong(song)}
                        >
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover/art:scale-105 transition-transform duration-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/art:opacity-100 flex items-center justify-center transition">
                            <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                        </div>

                        {/* Track Info (Title, Artist · Duration) */}
                        <div
                          className="min-w-0 flex-1 cursor-pointer pr-2"
                          onClick={() => onSelectSong(song)}
                        >
                          <p className="font-semibold text-sm sm:text-[15px] text-white truncate group-hover:text-amber-300 transition-colors">
                            {song.title}
                          </p>
                          <p className="text-xs text-white/50 truncate mt-0.5 font-medium flex items-center gap-1.5">
                            <span>{song.artist}</span>
                            <span>·</span>
                            <span className="font-mono text-white/40">{song.duration}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Large Touch Target Three-Dot Menu (⋮) with Action Popover */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuSongId(activeMenuSongId === song.id ? null : song.id);
                          }}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
                          title="Track Options"
                          aria-label={`Options for ${song.title}`}
                        >
                          <MoreVertical className="w-5 h-5 stroke-[2.2]" />
                        </button>

                        {/* Menu Dropdown on Tap */}
                        {activeMenuSongId === song.id && (
                          <div
                            className="absolute right-0 top-12 z-30 w-44 rounded-xl bg-[#1c0c03] border border-amber-500/30 p-1.5 shadow-2xl flex flex-col gap-1 animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                onSelectSong(song);
                                setActiveMenuSongId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition text-left cursor-pointer"
                            >
                              <Play className="w-4 h-4 text-amber-400 fill-current" />
                              <span>Play Now</span>
                            </button>
                            <button
                              onClick={() => {
                                handleRemoveSong(song.id);
                                setActiveMenuSongId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition text-left cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove Track</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {activePlaylist.songs.length === 0 && (
                    <div className="text-center py-12 flex flex-col items-center justify-center p-6 text-white/40">
                      <Music className="w-10 h-10 text-white/20 mb-2" />
                      <p className="text-sm font-semibold text-white/70">Your playlist is currently empty.</p>
                      <p className="text-xs mt-1 text-white/40">Select songs from the Stage 02 Catalog above to add them here.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CHAT SIDEBAR PANEL */}
              {showChat && (
                <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-white/5 pt-5 md:pt-0 md:pl-5 flex flex-col h-[400px]">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Live Room Chat
                  </h3>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col gap-3 min-h-0">
                    {chatMessages.map((msg) => {
                      const isMe = msg.senderId === user.uid;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-bold text-white/40">{msg.senderName}</span>
                            <span className="text-[8px] text-white/20">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div
                            className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words ${
                              isMe ? 'bg-emerald-500/20 text-white border border-emerald-500/15' : 'bg-white/5 text-white/90 border border-white/5'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Send Input Bar */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Send a real-time message..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      onClick={handleSendMessage}
                      className={`p-2 rounded-xl transition flex items-center justify-center ${theme.primaryButtonClass} text-black`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 bg-black/30 border border-amber-500/20 rounded-2xl flex flex-col items-center text-center shadow-xl shadow-amber-950/20">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
              <Music className="w-7 h-7" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Select a Playlist to Open</h2>
            <p className="text-xs text-white/50 mt-1 max-w-md">
              Click on any listing from the library on the left or choose one below to view, manage, and play its tracks.
            </p>

            {/* Quick Listing Open Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => onSetActivePlaylistId(pl.id)}
                  className="p-3.5 rounded-xl bg-[#1e0d02]/80 hover:bg-[#2a1303] border border-amber-500/20 hover:border-amber-400/50 flex items-center justify-between gap-3 text-left cursor-pointer transition active:scale-98 shadow-md group"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                      {pl.name}
                    </h3>
                    <p className="text-[11px] text-amber-200/60 mt-0.5">
                      {pl.songs.length} track{pl.songs.length === 1 ? '' : 's'} • {calculateTotalMinutes(pl.songs)} min
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-400/15 group-hover:bg-amber-400 text-amber-300 group-hover:text-black transition shrink-0">
                    Open →
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
      </div>

      {/* Group Box Delete Confirmation Modal */}
      {playlistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1e0d02] border border-amber-500/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl shadow-black/80 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Delete Group Box?</h3>
                <p className="text-xs text-white/50 mt-0.5">This action will remove the playlist.</p>
              </div>
            </div>
            <p className="text-xs text-amber-200/80 bg-black/40 p-3 rounded-xl border border-white/5">
              Are you sure you want to delete <strong className="text-white">"{playlistToDelete.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setPlaylistToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/80 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition active:scale-95"
                id="btn-confirm-delete-group"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Group</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
