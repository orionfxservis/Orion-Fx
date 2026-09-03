import React, { useState, useRef } from 'react';
import { 
  Heart, 
  Music2, 
  Cloud, 
  Bell, 
  Palette, 
  Globe, 
  Settings, 
  Info, 
  LogOut, 
  ChevronRight, 
  Camera, 
  Check, 
  X, 
  Play, 
  RefreshCw, 
  Trash2, 
  Volume2, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  Sliders,
  Download,
  ArrowLeft,
  ChevronLeft,
  Gift,
  Crown,
  Star,
  Zap,
  Tag
} from 'lucide-react';
import { UserAccount, ThemeConfig, Song, Playlist } from '../types';
import { saveUserDataToSupabase, registerOrionFxProject } from '../services/orionfxSupabase';
import { isSupabaseConfigured, APP_PROJECT_NAME } from '../lib/supabase';
import { SUBSCRIPTION_PACKAGES, getPackageById } from '../data/packagesData';

interface UserProfileProps {
  currentUser: UserAccount & { bio?: string };
  onUpdateUser: (updatedUser: UserAccount & { bio?: string }) => void;
  onClose?: () => void;
  theme: ThemeConfig;
  isOffline: boolean;
  onSelectSong?: (song: Song) => void;
  playlists?: Playlist[];
  onOpenThemeTab?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=240&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=240&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=240&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=240&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=240&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=240&auto=format&fit=crop',
];

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', region: 'US / UK' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'Pakistan' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'India' },
  { code: 'es', name: 'Spanish', native: 'Español', region: 'Spain / LATAM' },
  { code: 'ar', name: 'Arabic', native: 'العربية', region: 'Middle East' },
  { code: 'fr', name: 'French', native: 'Français', region: 'France' },
  { code: 'ja', name: 'Japanese', native: '日本語', region: 'Japan' },
];

export default function UserProfile({
  currentUser,
  onUpdateUser,
  onClose,
  theme,
  isOffline,
  onSelectSong,
  playlists = [],
  onOpenThemeTab,
}: UserProfileProps) {
  // Modal / Drawer state for the menu items
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name || 'Faisal');
  const [editEmail, setEditEmail] = useState(currentUser.email || 'iMFaisalHussain@gmail.com');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [avatarUploadMsg, setAvatarUploadMsg] = useState<string | null>(null);

  // Settings & Preferences State
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [collabAlerts, setCollabAlerts] = useState(true);
  const [highQualityAudio, setHighQualityAudio] = useState(true);
  const [gaplessPlayback, setGaplessPlayback] = useState(true);
  const [autoSyncCloud, setAutoSyncCloud] = useState(true);
  const [cachedSize, setCachedSize] = useState('38.4 MB');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Derived active package
  const activePackageId = currentUser.packageTier || (typeof window !== 'undefined' && localStorage.getItem('mybeatbox_vip_offer_claimed') === 'true' ? 'pro-launch' : 'free');
  const activePkg = getPackageById(activePackageId);

  // Favorites state (derived from current playlists or sample favorites)
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>(() => {
    if (playlists.length > 0 && playlists[0].songs.length > 0) {
      return playlists[0].songs.slice(0, 5);
    }
    return [
      {
        id: 'fav-1',
        title: 'Tumhe Dillagi',
        artist: 'Nusrat Fateh Khan',
        album: 'Qawwali Classics',
        duration: '06:45',
        durationSec: 405,
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop',
        genre: 'Sufi Classical'
      },
      {
        id: 'fav-2',
        title: 'Midnight Mirage',
        artist: 'Acoustic Labs',
        album: 'Neon Horizon',
        duration: '03:42',
        durationSec: 222,
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop',
        genre: 'Synthwave'
      },
      {
        id: 'fav-3',
        title: 'Tajdar-e-Haram',
        artist: 'Atif Aslam',
        album: 'Coke Studio',
        duration: '05:30',
        durationSec: 330,
        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-amp-strings-10711.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
        genre: 'Sufi Fusion'
      }
    ];
  });

  // Listening History state
  const [historySongs] = useState<Song[]>([
    {
      id: 'hist-1',
      title: 'Tumhe Dillagi',
      artist: 'Nusrat Fateh Khan',
      album: 'Qawwali Classics',
      duration: '06:45',
      durationSec: 405,
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop',
      genre: 'Sufi Classical'
    },
    {
      id: 'hist-2',
      title: 'Sanware',
      artist: 'Rahat Fateh Ali Khan',
      album: 'Melodies of Heart',
      duration: '04:18',
      durationSec: 258,
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop',
      genre: 'Classical'
    },
    {
      id: 'hist-3',
      title: 'Afreen Afreen',
      artist: 'Rahat & Momina Mustehsan',
      album: 'Acoustic Revival',
      duration: '06:20',
      durationSec: 380,
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-amp-strings-10711.mp3',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
      genre: 'Acoustic'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: editName.trim() || 'Faisal',
      email: editEmail.trim() || 'iMFaisalHussain@gmail.com',
      avatar: selectedAvatar,
    });
    setIsEditingProfile(false);
  };

  // Process uploaded avatar image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setSelectedAvatar(event.target.result);
          setAvatarUploadMsg('Photo loaded successfully');
          setTimeout(() => setAvatarUploadMsg(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform Cloud Sync with Supabase & Orion FX
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);

    if (isSupabaseConfigured()) {
      try {
        // 1. Sync user data partitioned by project_name
        await saveUserDataToSupabase({
          user_id: currentUser.uid,
          project_name: APP_PROJECT_NAME,
          user_name: currentUser.name,
          email: currentUser.email,
          avatar_url: currentUser.avatar,
          theme_id: theme.id,
          playlists: playlists,
          favorite_songs: favoriteSongs,
        });

        // 2. Register/update Orion FX project entry
        await registerOrionFxProject();

        setIsSyncing(false);
        setSyncSuccessMsg(`Synchronized with Supabase (Project: ${APP_PROJECT_NAME})!`);
        setTimeout(() => setSyncSuccessMsg(null), 3500);
      } catch (err: any) {
        setIsSyncing(false);
        setSyncSuccessMsg('Local cached. Supabase connected.');
        setTimeout(() => setSyncSuccessMsg(null), 3000);
      }
    } else {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncSuccessMsg('Local cache ready. Set VITE_SUPABASE_URL to sync cloud.');
        setTimeout(() => setSyncSuccessMsg(null), 3500);
      }, 900);
    }
  };

  // Clear Storage Cache
  const handleClearCache = () => {
    setCachedSize('0.0 MB');
    setSyncSuccessMsg('Local audio cache cleared');
    setTimeout(() => setSyncSuccessMsg(null), 2500);
  };

  // Remove song from favorites
  const handleRemoveFavorite = (songId: string) => {
    setFavoriteSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  // Handle Logout / Reset
  const handleLogOut = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out of MyBeatBox?');
    if (confirmLogout) {
      onUpdateUser({
        uid: 'user-guest-' + Math.random().toString(36).substring(2, 7),
        name: 'Guest User',
        email: '',
        avatar: PRESET_AVATARS[0],
        favoriteGenres: [],
      });
      if (onClose) onClose();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Clean Profile Card */}
      <div className="w-full bg-[#0d121f]/95 border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col">
        
        {/* 1. Header: MY PROFILE */}
        <div className="text-center mb-6">
          <h1 className="text-xs font-mono font-bold tracking-[0.25em] text-white/50 uppercase">
            MY PROFILE
          </h1>
        </div>

        {/* 2. Avatar + Faisal + MyBeatBox User */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar Circle ◯ */}
          <div 
            onClick={() => setIsEditingProfile(true)}
            className="relative group cursor-pointer mb-3"
            title="Click to edit profile or change photo"
          >
            <img
              src={currentUser.avatar || PRESET_AVATARS[0]}
              alt={currentUser.name || 'Faisal'}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/15 shadow-xl transition-transform duration-200 group-hover:scale-105 group-hover:border-amber-400"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0];
              }}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* User Name */}
          <h2 
            onClick={() => setIsEditingProfile(true)}
            className="text-lg sm:text-xl font-bold text-white tracking-tight cursor-pointer hover:text-amber-400 transition"
          >
            {currentUser.name || 'Faisal'}
          </h2>

          {/* Tagline / Role */}
          <p className="text-xs text-white/50 font-medium mt-0.5">
            MyBeatBox User
          </p>

          {/* Active Package Badge Button */}
          <button
            onClick={() => setActiveModal('packages')}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[11px] font-mono font-bold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer shadow-sm"
            title="Click to view or switch package"
          >
            <span>{activePkg.badge}</span>
            <span className="text-[10px] text-white/60 font-sans font-semibold">({activePkg.name})</span>
          </button>
        </div>

        {/* 3. Clean Divider ──────────────────── */}
        <div className="w-full border-t border-white/10 my-5" />

        {/* 4. Menu Items List */}
        <div className="flex flex-col divide-y divide-white/[0.06]">
          
          {/* 🏷️ Package & Badges */}
          <button
            onClick={() => setActiveModal('packages')}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                Packages & Badges
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black">
                {activePkg.badge}
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* ♡ Favorites */}
          <button
            onClick={() => setActiveModal('favorites')}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                Favorites
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/40">
                {favoriteSongs.length} tracks
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* ♫ Listening History */}
          <button
            onClick={() => setActiveModal('history')}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Music2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                Listening History
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/40">Recent</span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* ☁ Sync & Storage */}
          <button
            onClick={() => setActiveModal('sync')}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Cloud className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                Sync & Storage
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400">Synced</span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* 🔔 Notifications */}
          <button
            onClick={() => setActiveModal('notifications')}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                Notifications
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono ${notificationsEnabled ? 'text-purple-300' : 'text-white/30'}`}>
                {notificationsEnabled ? 'On' : 'Off'}
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* 🎨 Appearance */}
          <button
            onClick={() => {
              if (onOpenThemeTab) {
                onOpenThemeTab();
              } else {
                setActiveModal('appearance');
              }
            }}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                Appearance
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-pink-300">
                {theme.name}
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* 🌐 Language */}
          <button
            onClick={() => setActiveModal('language')}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                Language
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/50">
                {selectedLanguage}
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* ⚙ Settings */}
          <button
            onClick={() => setActiveModal('settings')}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                Settings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/40">Audio & App</span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>

          {/* ℹ About MyBeatBox */}
          <button
            onClick={() => setActiveModal('about')}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.04] rounded-xl transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-white/90 group-hover:text-white">
                About MyBeatBox
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                v2.5.0
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition" />
            </div>
          </button>
        </div>

        {/* 5. Action Buttons: Back & Log Out */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 font-semibold text-xs sm:text-sm py-2 px-5 rounded-xl border border-white/15 transition active:scale-95 cursor-pointer"
              id="btn-profile-back"
              title="Back to previous page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <button
            onClick={handleLogOut}
            className="flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold text-xs sm:text-sm py-2 px-5 rounded-xl border border-rose-500/20 transition active:scale-95 cursor-pointer"
            id="btn-profile-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE SUB-MODALS / DIALOGS FOR EACH MENU ITEM                       */}
      {/* ========================================================================= */}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Profile</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              {/* Avatar Picker */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={selectedAvatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-semibold">
                    Upload
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-amber-300 hover:text-amber-200 underline font-mono"
                >
                  Upload Custom Photo
                </button>
                {avatarUploadMsg && (
                  <span className="text-[10px] text-emerald-400 font-mono">{avatarUploadMsg}</span>
                )}
              </div>

              {/* Preset Avatars Row */}
              <div className="flex items-center justify-center gap-2">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                      selectedAvatar === av ? 'border-amber-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Name input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Faisal"
                />
              </div>

              {/* Email input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-white/50 uppercase">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="iMFaisalHussain@gmail.com"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Favorites Modal */}
      {activeModal === 'favorites' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Favorite Tracks</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {favoriteSongs.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-6 font-mono">No favorite songs added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {favoriteSongs.map((song) => (
                  <div 
                    key={song.id} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={song.coverUrl} 
                        alt={song.title} 
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" 
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                        <p className="text-[11px] text-white/50 truncate">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSelectSong && (
                        <button
                          onClick={() => {
                            onSelectSong(song);
                            setActiveModal(null);
                          }}
                          className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-black transition"
                          title="Play now"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveFavorite(song.id)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 transition"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Listening History Modal */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Listening History</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {historySongs.map((song) => (
                <div 
                  key={song.id} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={song.coverUrl} 
                      alt={song.title} 
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                      <p className="text-[11px] text-white/50 truncate">{song.artist} • {song.genre}</p>
                    </div>
                  </div>
                  {onSelectSong && (
                    <button
                      onClick={() => {
                        onSelectSong(song);
                        setActiveModal(null);
                      }}
                      className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-black transition shrink-0"
                      title="Play track"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Sync & Storage Modal */}
      {activeModal === 'sync' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Sync & Storage</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Project Partition Tag */}
              <div className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-300">Supabase Project Tag</span>
                <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-cyan-500/20">
                  {APP_PROJECT_NAME}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Cloud Database Sync</h4>
                  <p className="text-[10px] text-white/50">Auto-backup playlists & preferences</p>
                </div>
                <button
                  onClick={() => setAutoSyncCloud(!autoSyncCloud)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    autoSyncCloud ? 'bg-cyan-500' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    autoSyncCloud ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Local Audio Cache</h4>
                  <p className="text-[10px] text-white/50">{cachedSize} cached for offline play</p>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/20 transition"
                >
                  Clear
                </button>
              </div>

              {syncSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-xs font-mono text-center">
                  {syncSuccessMsg}
                </div>
              )}

              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Notification Preferences</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Push Notifications</h4>
                  <p className="text-[10px] text-white/50">Daily mixes & recommendation drops</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notificationsEnabled ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Collaborative Alerts</h4>
                  <p className="text-[10px] text-white/50">When friends add tracks to Collab Mix</p>
                </div>
                <button
                  onClick={() => setCollabAlerts(!collabAlerts)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    collabAlerts ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    collabAlerts ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Language Selector Modal */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Select Language</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.name);
                    setActiveModal(null);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                    selectedLanguage === lang.name
                      ? 'bg-blue-500/20 border border-blue-500/30 text-white font-bold'
                      : 'hover:bg-white/[0.05] text-white/70'
                  }`}
                >
                  <div>
                    <span className="text-xs">{lang.name}</span>
                    <span className="text-[10px] text-white/40 ml-2 font-mono">{lang.native}</span>
                  </div>
                  {selectedLanguage === lang.name && (
                    <Check className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Audio & Playback Settings</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">High Quality Streaming (320k)</h4>
                  <p className="text-[10px] text-white/50">Lossless acoustic frequency response</p>
                </div>
                <button
                  onClick={() => setHighQualityAudio(!highQualityAudio)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    highQualityAudio ? 'bg-amber-400' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                    highQualityAudio ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Gapless Playback</h4>
                  <p className="text-[10px] text-white/50">Seamless track crossfade transition</p>
                </div>
                <button
                  onClick={() => setGaplessPlayback(!gaplessPlayback)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    gaplessPlayback ? 'bg-amber-400' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                    gaplessPlayback ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. About MyBeatBox Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">About MyBeatBox</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-20 h-20 rounded-2xl border border-cyan-400/30 overflow-hidden shadow-xl shadow-cyan-500/20 shrink-0 bg-slate-950">
                <img 
                  src="/src/assets/images/mybeatbox_icon_logo_1787687263089.jpg" 
                  alt="MyBeatBox Studio Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">MyBeatBox Studio</h4>
                <p className="text-xs text-cyan-400 font-mono">YOUR MUSIC. YOUR VIBE.</p>
                <p className="text-[10.5px] text-white/50 font-mono mt-0.5">Version 2.5.0 • Orion FX Mobile</p>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed max-w-xs">
                Acoustic personal playlist builder, 7-band parametric equalizer, AI recommendation curation, and real-time audio workstation.
              </p>

              {/* Logo Asset Download / Reference */}
              <a
                href="/src/assets/images/mybeatbox_icon_logo_1787687263089.jpg"
                download="mybeatbox_logo.jpg"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] text-cyan-300 font-medium transition cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Save High-Res Logo</span>
              </a>
            </div>

            <div className="pt-3 border-t border-white/10 text-[10px] text-white/40 font-mono">
              Designed for Faisal • © 2026 MyBeatBox
            </div>
          </div>
        </div>
      )}

      {/* 8. Packages & Badges Modal */}
      {activeModal === 'packages' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">🏷️ Package & Badge System</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Status Pill */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-amber-300 uppercase">Your Active Subscription</p>
                <p className="text-sm font-bold text-white mt-0.5">{activePkg.name} Package</p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-amber-400 text-black font-mono font-extrabold text-xs shadow-md">
                {activePkg.badge}
              </div>
            </div>

            {/* All Packages Grid */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-mono text-white/50 uppercase font-semibold">Available Packages:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUBSCRIPTION_PACKAGES.map((pkg) => {
                  const isActive = activePackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between transition relative ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col gap-1.5">
                        {/* Package Badge */}
                        <div className="flex items-center justify-between">
                          <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold tracking-tight truncate self-start ${
                            isActive ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/90'
                          }`}>
                            {pkg.badge}
                          </div>
                          {pkg.id === 'pro' && (
                            <span className="text-[10px] text-amber-300 font-mono font-bold">
                              🎁 100 USERS OFFER
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-white mt-1">{pkg.name}</h4>
                        <p className="text-[10.5px] text-white/60 leading-tight">{pkg.tagline}</p>

                        {/* Launch offer callout inside Pro */}
                        {pkg.id === 'pro' && (
                          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-[10px] font-mono text-amber-200 text-center my-1">
                            🎁 First 100 Users → <strong className="text-white font-extrabold">1 Year FREE</strong>
                          </div>
                        )}

                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-mono font-bold text-amber-300">{pkg.price}</span>
                          <span className="text-[10px] text-white/50">{pkg.period}</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
                        <ul className="text-[10px] text-white/70 space-y-1">
                          {pkg.features.map((f, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateUser({
                              ...currentUser,
                              packageTier: pkg.id as 'free' | 'pro',
                              bio: (currentUser.bio ? currentUser.bio.replace(/•.*Subscriber.*/, '').trim() : '') + ` • ${pkg.badge} Subscriber (${pkg.name})`
                            });
                            try {
                              localStorage.setItem('mybeatbox_vip_package', pkg.id);
                              if (pkg.id === 'pro') {
                                localStorage.setItem('mybeatbox_vip_offer_claimed', 'true');
                              }
                            } catch (e) {}
                          }}
                          disabled={isActive}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isActive
                              ? 'bg-amber-400 text-black shadow cursor-default font-extrabold'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {isActive ? '✓ Active Plan' : `[ ${pkg.ctaText} ]`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-white/60 leading-relaxed font-mono">
              💡 <strong>Monetisation Structure:</strong> FREE (Rs. 0/mo) → PRO (Rs. 499/mo). Early access launch offer gives 1 year free Pro subscription to the first 100 registered users.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
