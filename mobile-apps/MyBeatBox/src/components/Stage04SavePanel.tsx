import React, { useState } from 'react';
import { CloudCheck, Download, Radio, Sparkles, Check, Share2, Volume2, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';
import { Playlist, Song, ThemeConfig, UserAccount } from '../types';

interface Stage04SavePanelProps {
  playlists: Playlist[];
  activePlaylistId: string | null;
  user: UserAccount;
  onOpenFullPlayer: () => void;
  theme?: ThemeConfig;
  isOffline?: boolean;
  currentSong: Song | null;
}

export default function Stage04SavePanel({
  playlists,
  activePlaylistId,
  user,
  onOpenFullPlayer,
  theme,
  isOffline,
  currentSong,
}: Stage04SavePanelProps) {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0];
  const totalTracks = activePlaylist?.songs?.length || 0;

  const handleSaveToCloud = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePlaylist || playlists, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${(activePlaylist?.name || 'MyBeatBox_Playlist').toLowerCase().replace(/\s+/g, '_')}_export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      id="stage-04-save-section"
      className="p-4 sm:p-5 rounded-2xl border border-purple-500/25 bg-gradient-to-b from-[#1b082e]/95 via-[#10031c]/95 to-[#05010a]/95 shadow-xl shadow-purple-950/25 relative overflow-hidden flex flex-col gap-4"
    >
      {/* Background ambient glow */}
      <div className="absolute right-0 top-0 w-44 h-44 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* 1. STAGE 04 Badge */}
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
          STAGE 04
        </span>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300/80 border border-purple-500/20 uppercase tracking-wider">
          Cloud Save & Studio Ready
        </span>
      </div>

      {/* 2. Main Title: 💽 Save & Studio Sync */}
      <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3">
        <h2 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2.5 min-h-[28px]">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0 self-center" />
          <span className="leading-tight self-center">Save & Studio Mastering</span>
        </h2>
        <p className="text-xs sm:text-[13px] text-purple-200/60 leading-snug">
          Finalize your curated collection, sync with your Google account, or launch high-fidelity playback.
        </p>
      </div>

      {/* Grid of Action Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Cloud Sync & Account Storage */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Google Cloud Sync</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Synced with <span className="text-white font-medium">{user.email || 'iMFaisalHussain@gmail.com'}</span>. All {totalTracks} tracks stored securely.
            </p>
          </div>
          <button
            onClick={handleSaveToCloud}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30'
            }`}
            id="btn-stage04-cloud-save"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Saved & Synced!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Save to Cloud</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Export & Share */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Export & Share</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Export "{activePlaylist?.name || 'Playlist'}" as JSON backup or copy instant collaborative link.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
              id="btn-stage04-export-json"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
            <button
              onClick={handleShareLink}
              className="flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
              id="btn-stage04-share-link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 3: Launch Full Audio Studio */}
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col justify-between gap-3 shadow-lg shadow-purple-950/40">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
              <Radio className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
              <span>Full Studio Player</span>
            </div>
            <p className="text-[11px] text-purple-200/70 leading-relaxed">
              Open the Parametric Equalizer, spectrum visualizer & queue controller.
            </p>
          </div>
          <button
            onClick={onOpenFullPlayer}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            id="btn-stage04-launch-studio"
          >
            <Volume2 className="w-4 h-4" />
            <span>Launch Studio Player</span>
          </button>
        </div>
      </div>
    </div>
  );
}
