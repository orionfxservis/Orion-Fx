import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Maximize2, Music, Volume2 } from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onOpenFullPlayer: () => void;
  theme: ThemeConfig;
}

export default function MiniPlayer({
  currentSong,
  isPlaying,
  onPlayPause,
  onSkipNext,
  onSkipPrevious,
  onOpenFullPlayer,
  theme,
}: MiniPlayerProps) {
  if (!currentSong) return null;

  return (
    <div className="fixed bottom-[60px] sm:bottom-[68px] left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div
          onClick={onOpenFullPlayer}
          className="bg-black/90 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group"
          id="mini-player-bar"
        >
          {/* Left: Artwork + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
              <img
                src={currentSong.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop'}
                alt={currentSong.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : ''}`}
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex items-center gap-0.5">
                    <span className="w-0.5 h-3 bg-emerald-400 animate-pulse" />
                    <span className="w-0.5 h-4 bg-emerald-300 animate-pulse delay-75" />
                    <span className="w-0.5 h-2 bg-emerald-400 animate-pulse delay-150" />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                  {currentSong.title}
                </h4>
                {currentSong.isLocal && (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                    Local
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-white/50 truncate">
                {currentSong.artist} • {currentSong.album || 'Single'}
              </p>
            </div>
          </div>

          {/* Right: Controls & Expand */}
          <div
            className="flex items-center gap-1 sm:gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onSkipPrevious}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition active:scale-95"
              title="Previous Track"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => onPlayPause(!isPlaying)}
              className="p-2 sm:p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-md shadow-amber-500/20 transition active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              id="mini-player-toggle-play"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={onSkipNext}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition active:scale-95"
              title="Next Track"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenFullPlayer}
              className="hidden sm:flex p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition active:scale-95"
              title="Expand Studio View"
              aria-label="Expand Studio View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
