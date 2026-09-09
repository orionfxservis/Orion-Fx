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
    <div className="fixed bottom-[60px] sm:bottom-[68px] left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div
          onClick={onOpenFullPlayer}
          className="bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 active:scale-95"
          id="mini-player-bar"
        >
          {/* Left: Icon + Text */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="text-xl shrink-0">🎵</div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <h4 className="font-semibold text-sm text-white truncate leading-tight">
                {currentSong.title}
              </h4>
              <p className="text-xs text-white/60 truncate leading-tight mt-0.5">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Right: Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause(!isPlaying);
            }}
            className="p-2 shrink-0 text-white hover:text-amber-400 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            id="mini-player-toggle-play"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
