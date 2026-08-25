import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Radio, Sparkles, Music, Volume2, User, Home, Library, Compass, Sliders, X, Maximize2, RotateCw, Check, Palette, Search } from 'lucide-react';
import { Song, Playlist, UserAccount, ThemeId, ThemeConfig } from './types';
import AudioPlayer from './components/AudioPlayer';
import PlaylistWorkspace from './components/PlaylistWorkspace';
import Recommendations from './components/Recommendations';
import LocalFiles from './components/LocalFiles';
import ThemeSelector from './components/ThemeSelector';
import UserProfile from './components/UserProfile';
import GoogleSearchPanel from './components/GoogleSearchPanel';
import SelectSongsCatalog from './components/SelectSongsCatalog';
import MiniPlayer from './components/MiniPlayer';
import WorkflowProgress from './components/WorkflowProgress';

const THEME_CONFIGS: { [key in ThemeId]?: ThemeConfig } = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Emerald',
    bgClass: 'bg-[#030611] text-gray-100',
    cardClass: 'glass-panel shadow-2xl shadow-emerald-950/10 hover:shadow-emerald-500/5 hover:border-emerald-500/15 duration-300',
    accentClass: 'bg-emerald-500/5 border-emerald-500/15',
    textClass: 'text-white',
    mutedTextClass: 'text-gray-400',
    borderClass: 'border-white/[0.06]',
    primaryButtonClass: 'bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 text-[#022c22] font-semibold',
    sliderAccentColor: 'emerald',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    bgClass: 'bg-[#030308] text-gray-100',
    cardClass: 'glass-panel shadow-2xl shadow-pink-950/10 hover:shadow-pink-500/5 hover:border-pink-500/15 duration-300',
    accentClass: 'bg-pink-500/5 border-pink-500/15',
    textClass: 'text-white',
    mutedTextClass: 'text-zinc-400',
    borderClass: 'border-white/[0.06]',
    primaryButtonClass: 'bg-pink-500 hover:bg-pink-400 shadow-md shadow-pink-500/20 text-[#3f071e] font-semibold',
    sliderAccentColor: 'pink',
  },
  'midnight-gold': {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    bgClass: 'bg-[#020617] text-gray-100',
    cardClass: 'glass-panel shadow-2xl shadow-amber-950/10 hover:shadow-amber-500/5 hover:border-amber-500/15 duration-300',
    accentClass: 'bg-amber-500/5 border-amber-500/15',
    textClass: 'text-white',
    mutedTextClass: 'text-slate-400',
    borderClass: 'border-white/[0.06]',
    primaryButtonClass: 'bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 text-[#451a03] font-semibold',
    sliderAccentColor: 'amber',
  },
  vaporwave: {
    id: 'vaporwave',
    name: 'Vaporwave Violet',
    bgClass: 'bg-[#09031a] text-gray-100',
    cardClass: 'glass-panel shadow-2xl shadow-purple-950/10 hover:shadow-purple-500/5 hover:border-purple-500/15 duration-300',
    accentClass: 'bg-purple-500/5 border-purple-500/15',
    textClass: 'text-white',
    mutedTextClass: 'text-purple-300/65',
    borderClass: 'border-white/[0.06]',
    primaryButtonClass: 'bg-purple-500 hover:bg-purple-400 shadow-md shadow-purple-500/20 text-[#1e1b4b] font-semibold',
    sliderAccentColor: 'purple',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Velocity',
    bgClass: 'bg-[#0f0204] text-gray-100',
    cardClass: 'glass-panel shadow-2xl shadow-red-950/10 hover:shadow-red-500/5 hover:border-red-500/15 duration-300',
    accentClass: 'bg-red-500/5 border-red-500/15',
    textClass: 'text-white',
    mutedTextClass: 'text-red-200/60',
    borderClass: 'border-white/[0.06]',
    primaryButtonClass: 'bg-red-500 hover:bg-red-400 shadow-md shadow-red-500/20 text-[#2b0005] font-semibold',
    sliderAccentColor: 'red',
  },
  'arctic-azure': {
    id: 'arctic-azure',
    name: 'Arctic Azure',
    bgClass: 'bg-[#020b14] text-gray-100',
    cardClass: 'glass-panel shadow-2xl shadow-cyan-950/10 hover:shadow-cyan-500/5 hover:border-cyan-500/15 duration-300',
    accentClass: 'bg-cyan-500/5 border-cyan-500/15',
    textClass: 'text-white',
    mutedTextClass: 'text-cyan-200/60',
    borderClass: 'border-white/[0.06]',
    primaryButtonClass: 'bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 text-[#00222b] font-semibold',
    sliderAccentColor: 'cyan',
  },
  'solar-sunset': {
    id: 'solar-sunset',
    name: 'Solar Sunset',
    bgClass: 'bg-[#120601] text-gray-100',
    cardClass: 'glass-panel shadow-2xl shadow-orange-950/10 hover:shadow-orange-500/5 hover:border-orange-500/15 duration-300',
    accentClass: 'bg-orange-500/5 border-orange-500/15',
    textClass: 'text-white',
    mutedTextClass: 'text-orange-200/60',
    borderClass: 'border-white/[0.06]',
    primaryButtonClass: 'bg-orange-400 hover:bg-orange-300 shadow-md shadow-orange-500/20 text-[#2b0b00] font-semibold',
    sliderAccentColor: 'amber',
  },
  custom: {
    id: 'custom',
    name: 'Personal Custom Theme',
    bgClass: 'bg-[#030611] text-gray-100',
    cardClass: 'glass-panel shadow-2xl duration-300',
    accentClass: 'bg-white/5 border-white/15',
    textClass: 'text-white',
    mutedTextClass: 'text-zinc-400',
    borderClass: 'border-white/[0.08]',
    primaryButtonClass: 'bg-emerald-400 text-black font-semibold',
    sliderAccentColor: 'emerald',
    customAccentHex: '#10b981',
  },
};

export default function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(THEME_CONFIGS.obsidian);
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'synced' | 'offline'>('online');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [googleSearchResult, setGoogleSearchResult] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'library' | 'theme' | 'me'>('home');
  const [showFullPlayerModal, setShowFullPlayerModal] = useState(false);

  // Dynamic user account metadata
  const [currentUser, setCurrentUser] = useState<UserAccount & { bio?: string }>({
    uid: 'user-faisal',
    name: 'Faisal Hussain',
    email: 'iMFaisalHussain@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop',
    favoriteGenres: ['Synthwave', 'Cyberpunk', 'Lofi Jazz'],
    bio: 'Premium acoustic curator. Passionate about retro-futuristic audio architectures and high-fidelity soundscapes.'
  });

  // Fetch initial music catalog & playlists from Server
  useEffect(() => {
    if (isOffline) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    fetch('/api/songs')
      .then((res) => res.json())
      .then((data) => {
        if (data.songs) {
          setAllSongs(data.songs);
          if (data.songs.length > 0) {
            setCurrentSong(data.songs[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load streaming catalog:', err));

    fetchPlaylists();
  }, [isOffline]);

  // Sync user session and listen for popups
  useEffect(() => {
    const cachedUid = localStorage.getItem('syncbeat_uid') || 'user-faisal';
    fetch(`/api/user/${cachedUid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('syncbeat_uid', data.user.uid);
        }
      })
      .catch((err) => console.error('Failed to load user profile on startup:', err));

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'OAUTH_AUTH_SUCCESS') {
        const user = e.data.user;
        setCurrentUser(user);
        localStorage.setItem('syncbeat_uid', user.uid);
        fetchPlaylists();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchPlaylists = async () => {
    if (isOffline) {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      if (data.playlists) {
        setPlaylists(data.playlists);
        if (data.playlists.length > 0 && !activePlaylistId) {
          setActivePlaylistId(data.playlists[0].id);
        }
      }
      setSyncStatus('synced');
      setTimeout(() => {
        setSyncStatus((prev) => (prev === 'synced' ? 'online' : prev));
      }, 2000);
    } catch (err) {
      console.error('Failed to load user playlists:', err);
      setSyncStatus('offline');
    }
  };

  const handleToggleSyncStatus = () => {
    if (isOffline || syncStatus === 'offline') {
      setIsOffline(false);
      setSyncStatus('syncing');
      fetchPlaylists();
    } else {
      // Trigger instant resync
      fetchPlaylists();
    }
  };

  const handlePlaylistChange = (updatedPlaylist: Playlist) => {
    setPlaylists((prev) => {
      const exists = prev.some((p) => p.id === updatedPlaylist.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedPlaylist.id ? updatedPlaylist : p));
      } else {
        return [...prev, updatedPlaylist];
      }
    });
  };

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handlePlayPlaylist = (songs: Song[]) => {
    if (songs.length > 0) {
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    }
  };

  const handleSkipNext = () => {
    if (!currentSong || allSongs.length === 0) return;
    const currentIndex = allSongs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % allSongs.length;
    setCurrentSong(allSongs[nextIndex]);
  };

  const handleSkipPrevious = () => {
    if (!currentSong || allSongs.length === 0) return;
    const currentIndex = allSongs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
    setCurrentSong(allSongs[prevIndex]);
  };

  // Local song support (adds track dynamically to play library)
  const handleAddLocalSongToCoreList = (song: Song) => {
    setAllSongs((prev) => {
      if (prev.some((s) => s.id === song.id)) return prev;
      return [...prev, song];
    });
  };

  const handleAddLocalSongToPlaylist = (pId: string, song: Song) => {
    const playlist = playlists.find((p) => p.id === pId);
    if (!playlist) return;

    const updatedSongs = [...playlist.songs, song];
    const updatedPlaylist = { ...playlist, songs: updatedSongs };

    handlePlaylistChange(updatedPlaylist);

    if (!isOffline) {
      fetch(`/api/playlists/${pId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: updatedSongs }),
      }).catch((err) => console.error('Failed to sync local song add to server:', err));
    }
  };

  // Handle saving Gemini curations to account
  const handleAddPlaylist = async (name: string, description: string, songs: Song[]) => {
    const newPlaylist: Playlist = {
      id: 'playlist-ai-' + Math.random().toString(36).substring(2, 9),
      name,
      description,
      createdBy: currentUser.uid,
      createdByName: currentUser.name,
      isCollaborative: false,
      songs,
      members: [],
      createdAt: Date.now(),
    };

    setPlaylists((prev) => [newPlaylist, ...prev]);
    setActivePlaylistId(newPlaylist.id);
    setActiveTab('library');

    if (!isOffline) {
      try {
        await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPlaylist),
        });
        fetchPlaylists();
      } catch (err) {
        console.error('Failed to save AI mix to REST server:', err);
      }
    }
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    if (THEME_CONFIGS[themeId]) {
      setActiveTheme(THEME_CONFIGS[themeId]!);
    }
  };

  const handleUpdateCustomTheme = (customTheme: ThemeConfig) => {
    THEME_CONFIGS.custom = customTheme;
    setActiveTheme(customTheme);
  };

  return (
    <div className={`min-h-screen ${activeTheme.bgClass} relative overflow-hidden transition-colors duration-500 flex flex-col font-sans`}>
      {/* 🔮 Dynamic Premium Background Ambient Glowing Orbs */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.14] animate-float-1 transition-all duration-1000 pointer-events-none" 
        style={{ 
          backgroundColor: 
            activeTheme.customAccentHex || (
              activeTheme.id === 'obsidian' ? '#10b981' : 
              activeTheme.id === 'cyberpunk' ? '#ec4899' : 
              activeTheme.id === 'midnight-gold' ? '#fbbf24' : 
              activeTheme.id === 'crimson' ? '#ef4444' : 
              activeTheme.id === 'arctic-azure' ? '#06b6d4' : 
              activeTheme.id === 'solar-sunset' ? '#f97316' : '#8b5cf6'
            )
        }} 
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.11] animate-float-2 transition-all duration-1000 pointer-events-none" 
        style={{ 
          backgroundColor: 
            activeTheme.id === 'obsidian' ? '#047857' : 
            activeTheme.id === 'cyberpunk' ? '#be185d' : 
            activeTheme.id === 'midnight-gold' ? '#b45309' : 
            activeTheme.id === 'crimson' ? '#991b1b' : 
            activeTheme.id === 'arctic-azure' ? '#0e7490' : 
            activeTheme.id === 'solar-sunset' ? '#c2410c' : '#6d28d9' 
        }} 
      />

      {/* Subtle grid pattern for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 1. Sleek Top Header (Calibrated for 390px mobile & desktop: 68-74px height, 16px padding) */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 h-[70px] flex items-center justify-between gap-3 shadow-lg shadow-black/40">
        {/* Brand Section: Compact and balanced for mobile */}
        <div className="flex items-center gap-2.5 text-left min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)] relative overflow-hidden group flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <h1 className="font-bold text-[15px] sm:text-[17px] leading-tight tracking-tight text-white flex items-center gap-1.5 truncate">
              MyBeatBox
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping-slow shrink-0" />
            </h1>
            <p className="text-[8.5px] sm:text-[9.5px] font-mono uppercase tracking-wider text-white/45 leading-none mt-0.5 truncate">
              MOBILE AUDIO WORKSPACE
            </p>
          </div>
        </div>

        {/* Right Section: Compact Status Pill (34-38px height) & Profile Button (38-42px) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dynamic Compact Online Sync Status Pill (34-38px height) */}
          <button
            onClick={handleToggleSyncStatus}
            className={`h-[36px] px-2.5 sm:px-3 rounded-full flex items-center justify-center gap-1.5 border transition-all duration-200 active:scale-95 cursor-pointer shadow-sm select-none shrink-0 ${
              syncStatus === 'syncing'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : syncStatus === 'synced'
                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                : syncStatus === 'offline'
                ? 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08]'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
            }`}
            id="btn-sync-status-pill"
            title={
              syncStatus === 'offline'
                ? 'Currently Offline. Tap to reconnect online and sync.'
                : syncStatus === 'syncing'
                ? 'Syncing data with cloud...'
                : syncStatus === 'synced'
                ? 'Synced with cloud. Tap to re-sync.'
                : 'Online & Synced. Tap to re-sync.'
            }
          >
            {syncStatus === 'syncing' ? (
              <>
                <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold tracking-tight">Syncing</span>
              </>
            ) : syncStatus === 'synced' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5] shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold tracking-tight">Synced</span>
              </>
            ) : syncStatus === 'offline' ? (
              <>
                <span className="w-2 h-2 rounded-full border border-zinc-400 bg-transparent shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium tracking-tight">Offline</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold tracking-tight">Online</span>
              </>
            )}
          </button>

          {/* Profile Button (38-42px) */}
          <button
            onClick={() => {
              setActiveTab('me');
              setShowProfileModal(true);
            }}
            className="h-10 min-w-[40px] px-1.5 sm:px-2.5 flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-amber-400/40 rounded-full transition-all duration-150 group cursor-pointer active:scale-95 shadow-sm shrink-0"
            title="Profile & Settings"
            id="btn-header-profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full border border-white/20 object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-semibold text-white/90 max-w-[70px] sm:max-w-[100px] truncate hidden min-[360px]:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </header>

      {/* 2. PAGE CONTENT - Dynamically controlled by Tabs */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-36 sm:pb-40 flex flex-col gap-4 sm:gap-6">
        
        {/* TAB 1: HOME (Full Stages Flow: Stage 01 Search -> Stage 02 Catalog -> Stage 03 Playlist) */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Workflow Stage Progress: Phone-optimized vertical / responsive indicator */}
            <WorkflowProgress
              onOpenSave={() => setShowFullPlayerModal(true)}
              playlistCount={playlists.find((p) => p.id === activePlaylistId)?.songs.length || 12}
            />

            {/* STAGE 01: Google Search Grounding */}
            <section id="step-google-search">
              <GoogleSearchPanel
                playlists={playlists}
                allSongs={allSongs}
                onSelectSong={handleSelectSong}
                onPlaylistChange={handlePlaylistChange}
                onSearchResultChange={(res) => setGoogleSearchResult(res)}
                theme={activeTheme}
                isOffline={isOffline}
                currentSong={currentSong}
                isPlaying={isPlaying}
              />
            </section>

            {/* STAGE 02: Song Catalog */}
            <section id="step-select-songs">
              <SelectSongsCatalog
                allSongs={allSongs}
                playlists={playlists}
                activePlaylistId={activePlaylistId}
                onSelectSong={handleSelectSong}
                onPlayPause={(playing) => setIsPlaying(playing)}
                onPlaylistChange={handlePlaylistChange}
                theme={activeTheme}
                isOffline={isOffline}
                searchResult={googleSearchResult}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onNavigateToPlaylist={() => {
                  const el = document.getElementById('stage-03-playlist-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </section>

            {/* STAGE 03: Build Your Playlist (Directly Rendered on Home) */}
            <section id="stage-03-playlist-section" className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                    <span className="font-mono text-amber-400">Stage03</span>
                    <Music className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Playlist</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                    {playlists.find((p) => p.id === activePlaylistId)?.songs.length || 12} Tracks
                  </span>
                </div>
              </div>
              <PlaylistWorkspace
                playlists={playlists}
                onSelectSong={handleSelectSong}
                onPlaylistChange={handlePlaylistChange}
                onPlayPlaylist={handlePlayPlaylist}
                activePlaylistId={activePlaylistId}
                onSetActivePlaylistId={setActivePlaylistId}
                user={currentUser}
                allSongs={allSongs}
                theme={activeTheme}
                isOffline={isOffline}
                onRefreshPlaylists={fetchPlaylists}
              />
            </section>
          </div>
        )}

        {/* TAB 2: DISCOVER (AI Recommendations & Vibe Synthesizer) */}
        {activeTab === 'discover' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <section id="step-recommendations">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/25 shrink-0">
                    DISCOVERY
                  </span>
                  <h2 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    AI Vibe & Artist Discovery
                  </h2>
                </div>
              </div>
              <Recommendations
                onSelectSong={handleSelectSong}
                onAddPlaylist={handleAddPlaylist}
                allSongs={allSongs}
                theme={activeTheme}
                isOffline={isOffline}
              />
            </section>

            {/* Curated Catalog overview in discover */}
            <section id="step-discover-catalog">
              <SelectSongsCatalog
                allSongs={allSongs}
                playlists={playlists}
                activePlaylistId={activePlaylistId}
                onSelectSong={handleSelectSong}
                onPlayPause={(playing) => setIsPlaying(playing)}
                onPlaylistChange={handlePlaylistChange}
                theme={activeTheme}
                isOffline={isOffline}
                searchResult={googleSearchResult}
                currentSong={currentSong}
                isPlaying={isPlaying}
              />
            </section>
          </div>
        )}

        {/* TAB 3: STAGE 03 PLAYLIST & LIBRARY (Dedicated Full View) */}
        {activeTab === 'library' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <section id="step-playlist-builder">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/25 shrink-0">
                    STAGE 03
                  </span>
                  <h2 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-amber-400 shrink-0" />
                    🎵 Stage 03 Playlist
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[9px] text-white/40 font-mono uppercase tracking-wider">
                  <span>WebSocket Realtime Sync</span>
                </div>
              </div>
              <PlaylistWorkspace
                playlists={playlists}
                onSelectSong={handleSelectSong}
                onPlaylistChange={handlePlaylistChange}
                onPlayPlaylist={handlePlayPlaylist}
                activePlaylistId={activePlaylistId}
                onSetActivePlaylistId={setActivePlaylistId}
                user={currentUser}
                allSongs={allSongs}
                theme={activeTheme}
                isOffline={isOffline}
                onRefreshPlaylists={fetchPlaylists}
              />
            </section>
          </div>
        )}

        {/* TAB 4: THEMES (Studio Theme Customizer) */}
        {activeTab === 'theme' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <section id="step-theme-selector">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider bg-pink-500/15 text-pink-300 border border-pink-500/25 shrink-0">
                    STAGE 05
                  </span>
                  <h2 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-pink-400 shrink-0" />
                    Visual Themes & Studio Customizer
                  </h2>
                </div>
              </div>
              <ThemeSelector
                activeTheme={activeTheme}
                onSelectTheme={handleSelectTheme}
                themeConfigs={THEME_CONFIGS}
                onUpdateCustomTheme={handleUpdateCustomTheme}
              />
            </section>
          </div>
        )}

        {/* TAB 5: ME (Profile / Settings) */}
        {activeTab === 'me' && (
          <div className="flex flex-col gap-6 animate-fade-in py-2">
            <section id="section-me-profile">
              <UserProfile
                currentUser={currentUser}
                onUpdateUser={(updated) => setCurrentUser(updated)}
                onClose={() => {}}
                theme={activeTheme}
                isOffline={isOffline}
                onSelectSong={handleSelectSong}
                playlists={playlists}
                onOpenThemeTab={() => setActiveTab('theme')}
              />
            </section>
          </div>
        )}

        {/* Persistent Background Audio Engine (kept mounted across all tabs so audio never stops) */}
        {!showFullPlayerModal && (
          <div className="hidden">
            <AudioPlayer
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlayPause={setIsPlaying}
              onSkipNext={handleSkipNext}
              onSkipPrevious={handleSkipPrevious}
              theme={activeTheme}
              isOffline={isOffline}
            />
          </div>
        )}
      </main>

      {/* 3. MINI PLAYER (Docked right above bottom navigation bar, hidden on Profile / Me tab) */}
      {activeTab !== 'me' && (
        <MiniPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={setIsPlaying}
          onSkipNext={handleSkipNext}
          onSkipPrevious={handleSkipPrevious}
          onOpenFullPlayer={() => setShowFullPlayerModal(true)}
          theme={activeTheme}
        />
      )}

      {/* 4. BOTTOM NAVIGATION BAR (Home | Discover | Library | Theme | Me) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#090b14]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 sm:px-4 py-1.5 sm:py-2 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] shadow-2xl">
        <div className="max-w-lg sm:max-w-xl mx-auto grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 sm:px-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'home'
                ? 'text-amber-400 bg-amber-400/10 font-bold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            id="tab-btn-home"
            title="Home Catalog & Grounded Search"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 sm:px-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'discover'
                ? 'text-purple-400 bg-purple-400/10 font-bold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            id="tab-btn-discover"
            title="Discover AI & Artists"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs">Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 sm:px-2 rounded-xl transition-all active:scale-95 relative ${
              activeTab === 'library'
                ? 'text-amber-400 bg-amber-400/10 font-bold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            id="tab-btn-library"
            title="Stage 03 — Build Your Playlist & Collaborative Mixes"
          >
            <div className="relative">
              <Music className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-mono bg-amber-500 text-black font-bold">
                03
              </span>
            </div>
            <span className="text-[10px] sm:text-xs">Library</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 sm:px-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'theme'
                ? 'text-pink-400 bg-pink-400/10 font-bold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            id="tab-btn-theme"
            title="Visual Themes & Customizer"
          >
            <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs">Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('me')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 sm:px-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'me'
                ? 'text-cyan-400 bg-cyan-400/10 font-bold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            id="tab-btn-me"
            title="Profile, Equalizer & Settings"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs">Me</span>
          </button>
        </div>
      </nav>

      {/* Expandable Full Audio Studio Modal */}
      {showFullPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="font-bold text-sm sm:text-base text-white">Full Playback Studio</h3>
              </div>
              <button
                onClick={() => setShowFullPlayerModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AudioPlayer
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlayPause={setIsPlaying}
              onSkipNext={handleSkipNext}
              onSkipPrevious={handleSkipPrevious}
              theme={activeTheme}
              isOffline={isOffline}
            />
          </div>
        </div>
      )}

      {/* Floating Modal for Updating User Profile */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md flex flex-col items-center">
            {/* Close button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute -top-3 -right-3 z-10 text-white/70 hover:text-white font-bold font-mono text-xs bg-black/80 border border-white/20 hover:bg-black w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            >
              ✕
            </button>
            <UserProfile
              currentUser={currentUser}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
              }}
              onClose={() => setShowProfileModal(false)}
              theme={activeTheme}
              isOffline={isOffline}
              onSelectSong={handleSelectSong}
              playlists={playlists}
              onOpenThemeTab={() => {
                setShowProfileModal(false);
                setActiveTab('theme');
              }}
            />
          </div>
        </div>
      )}

      {/* Elegant Footer */}
      <footer className="hidden sm:flex border-t border-white/5 py-4 px-6 bg-black/20 text-center text-xs text-white/30 items-center justify-between gap-4 max-w-7xl mx-auto w-full mb-16">
        <p>© 2026 MyBeatBox. All rights reserved.</p>
        <div className="flex gap-4 items-center font-mono text-[10px] uppercase">
          <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Web Audio Parametric Equalizer Enabled</span>
        </div>
      </footer>
    </div>
  );
}
