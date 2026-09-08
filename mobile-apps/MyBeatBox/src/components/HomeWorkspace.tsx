import React, { useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Compass, 
  Library, 
  Sparkles, 
  Search, 
  Music, 
  ArrowRight, 
  Radio, 
  Zap, 
  FolderPlus, 
  Layers,
  Volume2,
  Clock
} from 'lucide-react';
import { Song, Playlist, UserAccount, ThemeConfig } from '../types';
import WelcomeOfferCard from './WelcomeOfferCard';

interface HomeWorkspaceProps {
  user: UserAccount & { bio?: string };
  playlists: Playlist[];
  activePlaylistId: string | null;
  allSongs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSelectSong: (song: Song) => void;
  onPlayPause: (playing: boolean) => void;
  onNavigateToTab: (tab: 'home' | 'discover' | 'library' | 'studio' | 'ai') => void;
  onOpenStage?: (stageId: string) => void;
  onOpenThemeModal?: () => void;
  onUpdateUser?: (updated: UserAccount & { bio?: string }) => void;
  onOpenProfile?: () => void;
  theme?: ThemeConfig;
  isOffline?: boolean;
}

export default function HomeWorkspace({
  user,
  playlists,
  activePlaylistId,
  allSongs,
  currentSong,
  isPlaying,
  onSelectSong,
  onPlayPause,
  onNavigateToTab,
  onOpenStage,
  onOpenThemeModal,
  onUpdateUser,
  onOpenProfile,
  theme,
  isOffline
}: HomeWorkspaceProps) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Faisal';
  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || playlists[0];

  // Quick picks (4-6 handpicked diverse tracks)
  const quickPicks = useMemo(() => {
    return allSongs.slice(0, 5);
  }, [allSongs]);

  // Vibe suggestions that can launch direct discovery searches
  const vibePrompts = [
    { title: 'Cyberpunk Focus', mood: 'Electronic & Synthwave', icon: '⚡' },
    { title: 'Late Night Chill', mood: 'Lo-Fi & Ambient Beats', icon: '🌙' },
    { title: 'Acoustic Sunset', mood: 'Indie & Warm Melodies', icon: '🌅' },
    { title: 'High Octane Run', mood: 'Bass & Adrenaline Workout', icon: '🔥' },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-7 animate-fade-in text-white pb-6" id="home-workspace-container">
      {/* 1. Header Hero Card: AUDIO WORKSPACE & Welcome Note */}
      <div 
        id="home-hero-greeting-card"
        className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0e1628]/95 to-black border border-white/10 shadow-2xl relative overflow-hidden flex flex-col gap-5"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 z-10">
          {/* Audio Workspace Pill */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AUDIO WORKSPACE
            </span>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline">
              MYBEATBOX VIBE ENGINE
            </span>
          </div>

          {/* User Greeting & Welcome Note */}
          <div className="mt-1 flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome Back, {firstName} 👋
            </h1>
            <p className="text-sm sm:text-base font-semibold text-cyan-200/90">
              What do you want to create today ?
            </p>
          </div>

          <p className="text-xs sm:text-[13px] text-white/70 max-w-xl leading-relaxed mt-0.5">
            Discover music, build playlists, explore AI-powered recommendations, and bring your audio ideas to life, all in one intelligent workspace.
          </p>
        </div>

        {/* 🎁 EXCLUSIVE GLOWING LIMITED-TIME DISCOUNT OFFER ON HOME WELCOME NOTE */}
        <div className="z-10 w-full">
          <WelcomeOfferCard
            currentUser={user}
            onUpdateUser={onUpdateUser}
            theme={theme}
            onOpenProfile={onOpenProfile}
          />
        </div>

        {/* 2. Primary 4-Stage Launchpad Banner */}
        <div className="mt-1 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/20 shrink-0">
              <Compass className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">4-Stage Music Pipeline</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  01 → 04
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Search • Build • Review • Save
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('discover')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 hover:from-amber-300 hover:to-purple-400 text-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
            id="btn-home-launch-discover-pipeline"
          >
            <span>Start Discovery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. "What can I do right now?" Action Grid */}
      <div className="flex flex-col gap-3" id="home-actions-section">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/90 font-mono">
              Quick Actions • Right Now
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card 1: Resume / Instant Play */}
          <div 
            onClick={() => {
              if (currentSong) {
                onPlayPause(!isPlaying);
              } else if (allSongs.length > 0) {
                onSelectSong(allSongs[0]);
              }
            }}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-3 shadow-lg shadow-black/20"
            id="action-card-play-now"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {isPlaying ? 'Playing' : 'Resume'}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                {currentSong ? currentSong.title : 'Play Daily Mix'}
              </h3>
              <p className="text-[11px] text-white/50 truncate">
                {currentSong ? `by ${currentSong.artist}` : `${allSongs.length} available tracks`}
              </p>
            </div>
          </div>

          {/* Card 2: Grounded Music Search & Pipeline */}
          <div 
            onClick={() => onNavigateToTab('discover')}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-3 shadow-lg shadow-black/20"
            id="action-card-grounded-search"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                🔎 Discover
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Google Grounding & 4 Stages
              </h3>
              <p className="text-[11px] text-white/50">
                Search, build, review & cloud save
              </p>
            </div>
          </div>

          {/* Card 3: Open Library & Playlists */}
          <div 
            onClick={() => onNavigateToTab('library')}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-3 shadow-lg shadow-black/20"
            id="action-card-open-library"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                <Library className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                📚 Library
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Playlists & Local Audio
              </h3>
              <p className="text-[11px] text-white/50 truncate">
                {playlists.length} Lists • {allSongs.length} Stored Tracks
              </p>
            </div>
          </div>

          {/* Card 4: Audio Studio & Equalizer */}
          <div 
            onClick={() => onNavigateToTab('studio')}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-3 shadow-lg shadow-black/20"
            id="action-card-open-studio"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                🎛️ Studio
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                7-Band EQ & Stem Recorder
              </h3>
              <p className="text-[11px] text-white/50">
                Audio mixing, DJ soundboard & vocal takes
              </p>
            </div>
          </div>

          {/* Card 5: MyBeatBox AI Assistant */}
          <div 
            onClick={() => onNavigateToTab('ai')}
            className="p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-3 shadow-lg shadow-black/20"
            id="action-card-open-ai"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                🤖 AI Assistant
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Intelligent Music Intelligence
              </h3>
              <p className="text-[11px] text-white/50">
                Custom prompts, lyric insights & track advice
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Picks & Instant Tracks */}
      <div className="flex flex-col gap-3" id="home-quick-picks-section">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-emerald-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/90 font-mono">
              Quick Picks • Tap to Play
            </h2>
          </div>
          <button
            onClick={() => onNavigateToTab('discover')}
            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View all {allSongs.length}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {quickPicks.map((song) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            const isThisSelected = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => {
                  if (isThisSelected) {
                    onPlayPause(!isPlaying);
                  } else {
                    onSelectSong(song);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all duration-150 flex items-center gap-3 cursor-pointer group ${
                  isThisSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                    : 'bg-black/30 hover:bg-black/50 border-white/5 hover:border-white/15 text-white'
                }`}
              >
                {/* Cover art with hover play button */}
                <div className="w-11 h-11 rounded-lg overflow-hidden relative shrink-0 bg-slate-800 border border-white/10">
                  <img
                    src={song.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop"}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                    isThisSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-semibold truncate ${
                    isThisSelected ? 'text-emerald-300 font-bold' : 'text-white'
                  }`}>
                    {song.title}
                  </h4>
                  <p className="text-[11px] text-white/50 truncate">
                    {song.artist}
                  </p>
                </div>

                {/* Duration */}
                <div className="text-[10px] font-mono text-white/40 shrink-0">
                  {song.duration || '3:30'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Vibe Synthesizer Prompt Pills */}
      <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-blue-950/30 border border-purple-500/20" id="home-vibes-strip">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs font-bold text-purple-200">Instant AI Soundscape Moods</span>
          </div>
          <span className="text-[10px] font-mono text-purple-300/60">One-Tap Grounding</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {vibePrompts.map((vibe, idx) => (
            <button
              key={idx}
              onClick={() => {
                onNavigateToTab('discover');
              }}
              className="p-2.5 rounded-xl bg-black/40 hover:bg-purple-500/15 border border-purple-500/20 hover:border-purple-400/40 text-left transition-all group cursor-pointer flex flex-col gap-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{vibe.icon}</span>
                <ArrowRight className="w-3 h-3 text-purple-400/50 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">
                {vibe.title}
              </span>
              <span className="text-[10px] text-white/40 truncate">
                {vibe.mood}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
