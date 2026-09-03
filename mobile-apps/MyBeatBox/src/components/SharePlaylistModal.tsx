import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Smartphone, 
  MessageCircle, 
  Send, 
  Mail, 
  MessageSquare, 
  Globe, 
  ListMusic, 
  QrCode, 
  ExternalLink,
  Music2,
  Sparkles
} from 'lucide-react';
import { Playlist, Song } from '../types';

interface SharePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist | null;
}

export default function SharePlaylistModal({
  isOpen,
  onClose,
  playlist,
}: SharePlaylistModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTracklist, setCopiedTracklist] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [nativeShareSuccess, setNativeShareSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !playlist) return null;

  const totalMinutes = Math.round(
    playlist.songs.reduce((acc, s) => {
      const parts = (s.duration || '3:30').split(':');
      return acc + (parseInt(parts[0] || '3', 10) * 60 + parseInt(parts[1] || '30', 10));
    }, 0) / 60
  );

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/playlist/${playlist.id}`
    : `https://orionfx-music.app/share/playlist/${playlist.id}`;

  const topSongsPreview = playlist.songs
    .slice(0, 5)
    .map((s, i) => `${i + 1}. ${s.title} — ${s.artist}`)
    .join('\n');

  const fullTracklistText = `🎵 Playlist: ${playlist.name}\n${playlist.songs.length} Tracks (${totalMinutes} min)\n\n${playlist.songs
    .map((s, i) => `${i + 1}. ${s.title} — ${s.artist} [${s.duration || '3:30'}]`)
    .join('\n')}\n\nListen on OrionFX Studio: ${shareUrl}`;

  const shortShareText = `Listen to "${playlist.name}" (${playlist.songs.length} tracks) on OrionFX Audio: ${shareUrl}`;

  // Native Web Share API (Triggers system installed apps on Android, iOS, Windows, macOS)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: playlist.name,
          text: `Check out "${playlist.name}" featuring ${playlist.songs.slice(0, 3).map(s => s.artist).join(', ')} on OrionFX Studio!`,
          url: shareUrl,
        });
        setNativeShareSuccess('Shared via device apps!');
        setTimeout(() => setNativeShareSuccess(null), 3000);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Native share failed or dismissed:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyTracklist = () => {
    navigator.clipboard?.writeText(fullTracklistText);
    setCopiedTracklist(true);
    setTimeout(() => setCopiedTracklist(false), 2500);
  };

  // Installed App Targets Configuration with authentic compact mobile icons
  const APP_SHARE_TARGETS = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      category: 'Installed App',
      bgGradient: 'bg-emerald-600/90 text-white',
      borderClass: 'border-emerald-500/40',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.541 1.961.817 2.796.817 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.772zm6.757 5.769c0 3.731-3.033 6.764-6.764 6.764-1.127 0-2.223-.284-3.197-.822l-4.57 1.198 1.223-4.463c-.636-1.042-.98-2.247-.98-3.483 0-3.731 3.033-6.764 6.764-6.764 3.731.001 6.764 3.034 6.764 6.764z"/>
        </svg>
      ),
      getUrl: () => `https://api.whatsapp.com/send?text=${encodeURIComponent(shortShareText)}`,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      category: 'Installed App',
      bgGradient: 'bg-sky-500/90 text-white',
      borderClass: 'border-sky-400/40',
      icon: <Send className="w-3.5 h-3.5 fill-current" />,
      getUrl: () => `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🎵 Playlist: ${playlist.name}\n${playlist.songs.length} Tracks`)}`,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'Installed App',
      bgGradient: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
      borderClass: 'border-pink-500/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      getUrl: () => `https://www.instagram.com/`,
    },
    {
      id: 'twitter',
      name: 'X',
      category: 'Installed App',
      bgGradient: 'bg-zinc-800 text-white',
      borderClass: 'border-zinc-600/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Listening to "${playlist.name}" on OrionFX Studio 🎶`)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      category: 'Installed App',
      bgGradient: 'bg-blue-600 text-white',
      borderClass: 'border-blue-400/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'messenger',
      name: 'Messenger',
      category: 'Installed App',
      bgGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
      borderClass: 'border-indigo-400/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.082.3 2.23.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z"/>
        </svg>
      ),
      getUrl: () => `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'sms',
      name: 'Messages',
      category: 'Installed App',
      bgGradient: 'bg-emerald-500 text-white',
      borderClass: 'border-emerald-300/40',
      icon: <MessageSquare className="w-3.5 h-3.5 fill-current" />,
      getUrl: () => `sms:?&body=${encodeURIComponent(shortShareText)}`,
    },
    {
      id: 'email',
      name: 'Gmail',
      category: 'Installed App',
      bgGradient: 'bg-rose-600 text-white',
      borderClass: 'border-rose-400/40',
      icon: <Mail className="w-3.5 h-3.5" />,
      getUrl: () => `mailto:?subject=${encodeURIComponent(`Check out this playlist: ${playlist.name}`)}&body=${encodeURIComponent(fullTracklistText)}`,
    },
    {
      id: 'reddit',
      name: 'Reddit',
      category: 'Community',
      bgGradient: 'bg-orange-600 text-white',
      borderClass: 'border-orange-400/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
        </svg>
      ),
      getUrl: () => `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`🎵 [Playlist] ${playlist.name} (${playlist.songs.length} Tracks)`)}`,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'Installed App',
      bgGradient: 'bg-blue-700 text-white',
      borderClass: 'border-blue-400/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      getUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      id="share-playlist-modal-overlay"
    >
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#1a120c] via-[#110a06] to-[#080402] border-t sm:border border-amber-500/30 rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        id="share-playlist-modal-content"
      >
        {/* Mobile Pull Bar */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-4 py-3 sm:py-3.5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-white truncate">
                  Share Playlist
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {playlist.songs.length} Tracks
                </span>
              </div>
              <p className="text-[11px] text-white/50 truncate font-medium">
                {playlist.name} • {totalMinutes}m
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close share modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin">
          
          {/* PRIMARY: Native Device Installed Apps Button */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-600/20 border border-amber-500/30 flex items-center justify-between gap-2.5 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-sm">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Device Installed Apps</span>
                </h4>
                <p className="text-[10px] text-amber-200/70 truncate">
                  Open device share sheet (AirDrop, Nearby, Notes)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNativeShare}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-[11px] flex items-center justify-center gap-1 transition active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
              id="btn-trigger-native-share"
            >
              <Share2 className="w-3 h-3 fill-current" />
              <span>Share Sheet</span>
            </button>
          </div>

          {nativeShareSuccess && (
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{nativeShareSuccess}</span>
            </div>
          )}

          {/* SECTION: Installed Apps Compact Grid (Mobile Aspect with small icons) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300/80">
                Installed Apps
              </span>
              <span className="text-[9px] font-mono text-white/40">
                Tap app icon to share
              </span>
            </div>

            {/* Compact 5-column mobile app grid with small app icons */}
            <div className="grid grid-cols-5 gap-2">
              {APP_SHARE_TARGETS.map((app) => (
                <a
                  key={app.id}
                  href={app.getUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center text-center gap-1 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition group cursor-pointer active:scale-90"
                  title={`Share on ${app.name}`}
                  id={`btn-share-app-${app.id}`}
                >
                  <div className={`w-8 h-8 rounded-xl ${app.bgGradient} border ${app.borderClass} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    {app.icon}
                  </div>
                  <span className="text-[10px] font-medium text-white/90 group-hover:text-amber-200 transition-colors truncate max-w-full leading-tight">
                    {app.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* SECTION: Quick Copy Link & Tracklist */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300/80">
                Copy & QR Code
              </span>
            </div>

            {/* Link Input Bar */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
              <div className="flex-1 min-w-0 px-2 py-0.5 text-[11px] font-mono text-white/70 truncate select-all">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                id="btn-modal-copy-link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Tracklist Text Copier & QR Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyTracklist}
                className={`p-2 rounded-xl border text-left flex items-center justify-between gap-1.5 transition active:scale-95 cursor-pointer ${
                  copiedTracklist
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-black/30 hover:bg-white/5 border-white/10 text-white/90'
                }`}
                id="btn-modal-copy-tracklist"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <ListMusic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="min-w-0 text-left">
                    <p className="text-[11px] font-bold truncate">Copy Tracklist</p>
                    <p className="text-[9px] text-white/40 truncate">Formatted text</p>
                  </div>
                </div>
                {copiedTracklist ? (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-white/40 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className={`p-2 rounded-xl border text-left flex items-center justify-between gap-1.5 transition active:scale-95 cursor-pointer ${
                  showQr
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-black/30 hover:bg-white/5 border-white/10 text-white/90'
                }`}
                id="btn-modal-toggle-qr"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="min-w-0 text-left">
                    <p className="text-[11px] font-bold truncate">{showQr ? 'Hide QR' : 'Show QR'}</p>
                    <p className="text-[9px] text-white/40 truncate">Scan with phone</p>
                  </div>
                </div>
              </button>
            </div>

            {/* QR Code display */}
            {showQr && (
              <div className="p-3 rounded-xl bg-white text-neutral-900 flex flex-col items-center justify-center gap-1.5 text-center animate-fade-in">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareUrl)}`}
                  alt="Playlist QR Code"
                  className="w-28 h-28 border border-neutral-200 rounded-lg shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <p className="text-[11px] font-bold text-neutral-800">Scan with any phone camera</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
          <span className="flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            Live sync across all devices
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer text-[11px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
