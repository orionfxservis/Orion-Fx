import React, { useState } from 'react';
import { Play, Pause, Plus, Check, Music, Disc, Sparkles, Globe, UserSquare2, Music4, Loader2 } from 'lucide-react';
import { Song, Playlist, ThemeConfig } from '../types';

export interface GroundedTrack {
  title: string;
  artist?: string;
  album?: string;
  releaseYear?: string;
  description?: string;
  url?: string;
  coverUrl?: string;
  duration?: string;
  durationSec?: number;
  genre?: string;
}

export interface SearchResult {
  title: string;
  subtitle: string;
  description: string;
  metadata: { label: string; value: string }[];
  topTracksOrAlbums: GroundedTrack[];
  trivia: string;
  sources?: { title: string; uri: string }[];
}

interface SelectSongsCatalogProps {
  allSongs: Song[];
  playlists: Playlist[];
  activePlaylistId?: string | null;
  onSelectSong: (song: Song) => void;
  onPlayPause?: (playing: boolean) => void;
  onPlaylistChange: (updatedPlaylist: Playlist) => void;
  theme: ThemeConfig;
  isOffline: boolean;
  searchResult?: SearchResult | null;
  currentSong?: Song | null;
  isPlaying?: boolean;
  onNavigateToPlaylist?: () => void;
}

export default function SelectSongsCatalog({
  allSongs,
  playlists,
  activePlaylistId,
  onSelectSong,
  onPlayPause,
  onPlaylistChange,
  theme,
  isOffline,
  searchResult,
  currentSong,
  isPlaying = false,
  onNavigateToPlaylist,
}: SelectSongsCatalogProps) {
  const [addedSongId, setAddedSongId] = useState<string | null>(null);
  const [loadingTrackTitle, setLoadingTrackTitle] = useState<string | null>(null);

  // Helper to trigger Play/Stop toggle for a particular track
  const handleToggleTrackPlay = async (track: GroundedTrack) => {
    const trackTitle = track.title;
    const artistName = track.artist || searchResult?.title || 'Artist';

    const isCurrentTrackPlaying = Boolean(
      isPlaying &&
        currentSong &&
        (currentSong.title.toLowerCase().includes(trackTitle.toLowerCase()) ||
          trackTitle.toLowerCase().includes(currentSong.title.toLowerCase()))
    );

    if (isCurrentTrackPlaying) {
      if (onPlayPause) {
        onPlayPause(false);
      }
      return;
    }

    // If track already has a playable URL from the server
    if (track.url) {
      const songToPlay: Song = {
        id: `play-${Date.now()}-${trackTitle.replace(/\s+/g, '-').toLowerCase()}`,
        title: track.title,
        artist: track.artist || searchResult?.title || 'Featured Artist',
        album: track.album || searchResult?.subtitle || 'Studio Single',
        duration: track.duration || '04:30',
        durationSec: track.durationSec || 270,
        url: track.url,
        coverUrl:
          track.coverUrl ||
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=250&auto=format&fit=crop',
        genre: track.genre || 'Popular / World',
      };

      onSelectSong(songToPlay);
      if (onPlayPause) onPlayPause(true);
      return;
    }

    // Check if song matches existing in allSongs catalog
    const match = allSongs.find(
      (s) =>
        s.title.toLowerCase().includes(trackTitle.toLowerCase()) ||
        trackTitle.toLowerCase().includes(s.title.toLowerCase())
    );

    if (match) {
      onSelectSong(match);
      if (onPlayPause) onPlayPause(true);
      return;
    }

    // Resolve song on demand from backend resolver for accurate audio
    setLoadingTrackTitle(trackTitle);
    try {
      const res = await fetch(
        `/api/audio/resolve?title=${encodeURIComponent(trackTitle)}&artist=${encodeURIComponent(artistName)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.song) {
          const resolvedSong: Song = {
            id: data.song.id || `res-${Date.now()}`,
            title: data.song.title || trackTitle,
            artist: data.song.artist || artistName,
            album: data.song.album || searchResult?.subtitle || 'Studio Master',
            duration: data.song.duration || '04:40',
            durationSec: data.song.durationSec || 280,
            url: data.song.url,
            coverUrl:
              data.song.coverUrl ||
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            genre: data.song.genre || 'World / Pop',
          };
          onSelectSong(resolvedSong);
          if (onPlayPause) onPlayPause(true);
          setLoadingTrackTitle(null);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not resolve audio dynamically:', err);
    } finally {
      setLoadingTrackTitle(null);
    }

    // Direct stream track
    const fallbackSong: Song = {
      id: `google-sim-${Date.now()}`,
      title: trackTitle,
      artist: artistName,
      album: searchResult?.subtitle || 'Studio Audio',
      duration: '04:30',
      durationSec: 270,
      url: `/api/audio/stream`,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=250&auto=format&fit=crop',
      genre: 'Search Discovery',
    };

    onSelectSong(fallbackSong);
    if (onPlayPause) onPlayPause(true);
  };

  const handleAddTrackToPlaylist = async (track: GroundedTrack, customPlaylistId?: string) => {
    const trackTitle = track.title;
    const artistName = track.artist || searchResult?.title || 'Featured Artist';

    let targetPlaylist = customPlaylistId
      ? playlists.find((p) => p.id === customPlaylistId)
      : playlists.find((p) => p.id === activePlaylistId) || playlists[0];

    // Determine playable song object
    let songToAdd: Song;
    if (track.url) {
      songToAdd = {
        id: `grounded-add-${Date.now()}-${trackTitle.replace(/\s+/g, '-').toLowerCase()}`,
        title: track.title,
        artist: artistName,
        album: track.album || searchResult?.subtitle || 'Search Result Track',
        duration: track.duration || '04:30',
        durationSec: track.durationSec || 270,
        url: track.url,
        coverUrl:
          track.coverUrl ||
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=250&auto=format&fit=crop',
        genre: track.genre || 'World / Popular',
      };
    } else {
      let resolvedUrl = `/api/audio/stream`;
      try {
        const res = await fetch(`/api/audio/resolve?title=${encodeURIComponent(trackTitle)}&artist=${encodeURIComponent(artistName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.song?.url) resolvedUrl = data.song.url;
        }
      } catch (e) {}

      songToAdd = {
        id: `grounded-add-${Date.now()}`,
        title: trackTitle,
        artist: artistName,
        album: searchResult?.subtitle || 'Search Result Track',
        duration: '04:30',
        durationSec: 270,
        url: resolvedUrl,
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=250&auto=format&fit=crop',
        genre: 'Search Discovery',
      };
    }

    if (!targetPlaylist) {
      const defaultPlaylist: Playlist = {
        id: 'playlist-default',
        name: 'My Workspace Mix',
        description: 'Your automatically managed queue.',
        createdBy: 'user-faisal',
        createdByName: 'Faisal Hussain',
        userEmail: 'iMFaisalHussain@gmail.com',
        isCollaborative: true,
        songs: [songToAdd],
        members: [],
        createdAt: Date.now(),
      };

      onPlaylistChange(defaultPlaylist);
      setAddedSongId(`add-${trackTitle}`);
      setTimeout(() => setAddedSongId(null), 3000);

      if (!isOffline) {
        try {
          await fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultPlaylist),
          });
        } catch (err) {
          console.error('Failed to create default playlist on server:', err);
        }
      }
      return;
    }

    const playlistId = targetPlaylist.id;

    // Avoid duplicate title if already present
    if (targetPlaylist.songs.some((s) => s.title.toLowerCase() === trackTitle.toLowerCase())) {
      setAddedSongId(`add-${trackTitle}`);
      setTimeout(() => setAddedSongId(null), 3000);
      return;
    }

    const updatedSongs = [...targetPlaylist.songs, songToAdd];
    const updatedPlaylist = { ...targetPlaylist, songs: updatedSongs };

    onPlaylistChange(updatedPlaylist);
    setAddedSongId(`add-${trackTitle}`);
    setTimeout(() => setAddedSongId(null), 3000);

    if (!isOffline) {
      try {
        await fetch(`/api/playlists/${playlistId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songs: updatedSongs }),
        });
      } catch (err) {
        console.error('Failed to save song add to backend:', err);
      }
    }
  };

  // Tracks list to show: if searchResult exists, show search result tracks; else fallback to preloaded songs
  const tracksToDisplay: GroundedTrack[] =
    searchResult?.topTracksOrAlbums && searchResult.topTracksOrAlbums.length > 0
      ? searchResult.topTracksOrAlbums.map((t) => ({
          title: t.title,
          artist: t.artist || searchResult.title,
          album: t.album || searchResult.subtitle,
          releaseYear: t.releaseYear,
          description: t.description,
          url: t.url,
          coverUrl: t.coverUrl,
          duration: t.duration,
          durationSec: t.durationSec,
          genre: t.genre,
        }))
      : allSongs.map((s) => ({
          title: s.title,
          artist: s.artist,
          album: s.album || 'Preloaded Track',
          releaseYear: '2024',
          description: `${s.genre} • HQ Studio Audio`,
          url: s.url,
          coverUrl: s.coverUrl,
          duration: s.duration,
          durationSec: s.durationSec,
          genre: s.genre,
        }));

  return (
    <div
      id="select-songs-catalog"
      className="p-4 sm:p-6 rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-[#04241a]/95 via-[#021711]/95 to-[#020608]/95 shadow-xl shadow-emerald-950/25 relative overflow-hidden"
    >
      {/* Background ambient element */}
      <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Header with requested exact wording: "Your search results are here" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 mb-4 sm:mb-5 gap-2">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0 mt-0.5 sm:mt-0">
            STAGE 02
          </span>
          <div>
            <h2 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-emerald-400 animate-spin-slow shrink-0" />
              Your search results are here
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-200/60 mt-0.5">
              {searchResult
                ? `Showing authentic tracks for "${searchResult.title}". Click Play to start streaming this particular song, or + to add to playlist.`
                : 'Search any singer or song in Stage 01 above to see live grounded tracks here with instant Play / Stop and + Add.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
            {tracksToDisplay.length} Tracks Ready
          </span>
        </div>
      </div>

      {/* Search Result Banner when search result is active */}
      {searchResult && (
        <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                {searchResult.title}
                <span className="text-[9px] font-mono font-normal text-emerald-300/70 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  {searchResult.subtitle}
                </span>
              </p>
              <p className="text-[10px] text-emerald-200/60 line-clamp-1 mt-0.5">
                {searchResult.description}
              </p>
            </div>
          </div>

          {searchResult.topTracksOrAlbums && searchResult.topTracksOrAlbums.length > 0 && (
            <button
              onClick={() => handleToggleTrackPlay(searchResult.topTracksOrAlbums[0])}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Top Hit</span>
            </button>
          )}
        </div>
      )}

      {/* Tracks Listing Grid with Play / Stop and + Add button */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {tracksToDisplay.map((track, idx) => {
          const isCurrentTrackPlaying = Boolean(
            isPlaying &&
              currentSong &&
              (currentSong.title.toLowerCase().includes(track.title.toLowerCase()) ||
                track.title.toLowerCase().includes(currentSong.title.toLowerCase()))
          );

          const isAdded = addedSongId === `add-${track.title}`;
          const isLoadingThis = loadingTrackTitle === track.title;

          return (
            <div
              key={`${track.title}-${idx}`}
              className={`group p-3 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-200 ${
                isCurrentTrackPlaying
                  ? 'bg-emerald-500/15 border-emerald-400/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : 'bg-black/30 hover:bg-black/40 border-white/5 hover:border-emerald-500/20'
              }`}
            >
              {/* Header / Track Metadata */}
              <div className="flex items-start justify-between gap-2.5 min-w-0">
                {/* Artwork Thumbnail */}
                {track.coverUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isCurrentTrackPlaying && (
                      <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                    )}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-xs font-bold truncate ${isCurrentTrackPlaying ? 'text-emerald-300' : 'text-white'}`}>
                      {track.title}
                    </p>
                    {track.releaseYear && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-white/40">
                        {track.releaseYear}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/50 truncate mt-0.5">
                    {track.artist}
                  </p>
                  {track.description && (
                    <p className="text-[10px] text-emerald-200/50 line-clamp-2 mt-1">
                      {track.description}
                    </p>
                  )}
                </div>

                {isCurrentTrackPlaying && (
                  <span className="flex items-center gap-1 text-[8px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    PLAYING
                  </span>
                )}
              </div>

              {/* Action Buttons: Explicit "Play / Stop" button & "+" Add button */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
                {/* Play / Stop Button */}
                <button
                  onClick={() => handleToggleTrackPlay(track)}
                  disabled={isLoadingThis}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    isCurrentTrackPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20'
                  }`}
                  id={`btn-play-stop-${idx}`}
                >
                  {isLoadingThis ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : isCurrentTrackPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                {/* + Add to Playlist button */}
                <div className="relative group/menu">
                  <button
                    onClick={() => handleAddTrackToPlaylist(track)}
                    className={`flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                      isAdded
                        ? 'bg-emerald-500 text-black border-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10 hover:border-white/20'
                    }`}
                    title="Add track to playlist (+)"
                    id={`btn-add-playlist-${idx}`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Add</span>
                      </>
                    )}
                  </button>

                  {/* Playlist choice dropdown if user has multiple playlists */}
                  {playlists.length > 1 && (
                    <div className="absolute right-0 bottom-full mb-1 bg-neutral-900 border border-white/10 rounded-xl py-1 w-44 shadow-2xl hidden group-hover/menu:block z-50">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 px-2.5 py-1 block">
                        Select Playlist:
                      </span>
                      {playlists.map((pl) => (
                        <button
                          key={pl.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTrackToPlaylist(track, pl.id);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-[11px] hover:bg-white/5 transition flex items-center justify-between text-white/80 hover:text-white"
                        >
                          <span className="truncate">{pl.name}</span>
                          <Plus className="w-3 h-3 text-emerald-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Step Action Banner */}
      <div className="mt-4 p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-white/70">
          Selected tracks are automatically synced into your Stage 03 playlist below.
        </p>

        <button
          onClick={() => {
            if (onNavigateToPlaylist) {
              onNavigateToPlaylist();
            } else {
              const el = document.getElementById('stage-03-playlist-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 active:scale-95 text-amber-300 border border-amber-400/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          id="btn-goto-stage-03"
        >
          <span>Continue to Playlist below ↓</span>
        </button>
      </div>
    </div>
  );
}

