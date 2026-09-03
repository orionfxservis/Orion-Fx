import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Plus, 
  Check, 
  Heart, 
  Share2, 
  Disc, 
  Music, 
  Radio, 
  Sparkles, 
  UserCheck, 
  UserPlus,
  FolderPlus,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Song, Playlist, ThemeConfig } from '../types';

export interface ArtistAlbum {
  id: string;
  title: string;
  year: string;
  coverUrl: string;
  tracksCount: number;
  genre?: string;
  tracks: Song[];
}

export interface ArtistDetailData {
  name: string;
  genre: string;
  origin?: string;
  era?: string;
  description: string;
  avatarUrl: string;
  popularTracks: Song[];
  albums: ArtistAlbum[];
  trivia?: string;
  sources?: { title: string; uri: string }[];
}

interface ArtistDetailViewProps {
  artistData: ArtistDetailData;
  onBack: () => void;
  playlists: Playlist[];
  onPlaylistChange: (updatedPlaylist: Playlist) => void;
  onSelectSong: (song: Song) => void;
  onPlayPause?: (playing: boolean) => void;
  currentSong?: Song | null;
  isPlaying?: boolean;
  theme?: ThemeConfig;
  isOffline?: boolean;
}

export default function ArtistDetailView({
  artistData,
  onBack,
  playlists,
  onPlaylistChange,
  onSelectSong,
  onPlayPause,
  currentSong,
  isPlaying = false,
  theme,
  isOffline
}: ArtistDetailViewProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [addedAllToLibrary, setAddedAllToLibrary] = useState(false);
  const [addedTrackIds, setAddedTrackIds] = useState<{ [key: string]: boolean }>({});
  const [selectedAlbum, setSelectedAlbum] = useState<ArtistAlbum | null>(null);

  // Follow Toggle
  const handleToggleFollow = () => {
    setIsFollowing(prev => !prev);
  };

  // Add all popular tracks to first / active playlist
  const handleAddAllToLibrary = () => {
    if (playlists && playlists.length > 0 && onPlaylistChange) {
      const targetPlaylist = playlists[0];
      const newSongs = artistData.popularTracks.filter(
        pt => !targetPlaylist.songs.some(s => s.title.toLowerCase() === pt.title.toLowerCase())
      );
      
      if (newSongs.length > 0) {
        onPlaylistChange({
          ...targetPlaylist,
          songs: [...targetPlaylist.songs, ...newSongs]
        });
      }

      setAddedAllToLibrary(true);
      setTimeout(() => setAddedAllToLibrary(false), 2500);
    }
  };

  // Add individual track to playlist
  const handleAddSingleTrack = (song: Song) => {
    if (playlists && playlists.length > 0 && onPlaylistChange) {
      const targetPlaylist = playlists[0];
      if (!targetPlaylist.songs.some(s => s.title.toLowerCase() === song.title.toLowerCase())) {
        onPlaylistChange({
          ...targetPlaylist,
          songs: [...targetPlaylist.songs, song]
        });
      }

      setAddedTrackIds(prev => ({ ...prev, [song.id]: true }));
      setTimeout(() => {
        setAddedTrackIds(prev => ({ ...prev, [song.id]: false }));
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-white pb-6" id="artist-detail-view">
      {/* 1. Back Navigation Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition active:scale-95 cursor-pointer shadow-sm"
          id="btn-artist-back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          ARTIST PROFILE
        </span>
      </div>

      {/* 2. Artist Hero Card */}
      <div 
        id="artist-hero-card"
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#0d1627]/95 to-black border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-4"
      >
        {/* Glow behind avatar */}
        <div className="absolute top-1/4 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 🖼 Artist Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-400/40 shadow-xl shadow-amber-500/10 shrink-0 relative bg-slate-800">
          <img
            src={artistData.avatarUrl}
            alt={artistData.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Artist Name & Subtitle */}
        <div className="flex flex-col gap-1 z-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {artistData.name}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-amber-300/90">
            {artistData.genre}
          </p>
          {artistData.description && (
            <p className="text-xs text-white/60 max-w-lg mt-1 leading-relaxed">
              {artistData.description}
            </p>
          )}
        </div>

        {/* Action Buttons: [ Follow ] [ + Library ] */}
        <div className="flex items-center justify-center gap-3 mt-1 z-10">
          <button
            type="button"
            onClick={handleToggleFollow}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition active:scale-95 cursor-pointer ${
              isFollowing
                ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
            }`}
            id="btn-artist-follow"
          >
            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isFollowing ? 'Following' : 'Follow'}</span>
          </button>

          <button
            type="button"
            onClick={handleAddAllToLibrary}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition active:scale-95 cursor-pointer ${
              addedAllToLibrary
                ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 border-purple-500/30 text-white'
            }`}
            id="btn-artist-add-library"
          >
            {addedAllToLibrary ? <Check className="w-4 h-4 stroke-[3]" /> : <FolderPlus className="w-4 h-4" />}
            <span>{addedAllToLibrary ? 'Added to Library' : '+ Library'}</span>
          </button>
        </div>
      </div>

      {/* 3. Popular Tracks Section */}
      <div className="flex flex-col gap-3" id="artist-popular-tracks-section">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/90 font-mono">
              Popular Tracks
            </h2>
          </div>
          <span className="text-[10px] font-mono text-white/40">
            {artistData.popularTracks.length} Playable Masters
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {artistData.popularTracks.map((song, idx) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            const isThisSelected = currentSong?.id === song.id;
            const isAdded = !!addedTrackIds[song.id];

            return (
              <div
                key={song.id || idx}
                className={`p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 group ${
                  isThisSelected
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-black/40 hover:bg-black/60 border-white/10 hover:border-white/20 text-white'
                }`}
              >
                {/* Play Button & Song Info */}
                <div 
                  onClick={() => {
                    if (isThisSelected && onPlayPause) {
                      onPlayPause(!isPlaying);
                    } else {
                      onSelectSong(song);
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-white/10 relative shrink-0">
                    <img
                      src={song.coverUrl || artistData.avatarUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isThisSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0 text-left">
                    <h3 className={`text-xs sm:text-sm font-semibold truncate ${
                      isThisSelected ? 'text-amber-300 font-bold' : 'text-white'
                    }`}>
                      {song.title}
                    </h3>
                    <p className="text-[11px] text-white/50 truncate">
                      {song.album || artistData.name} • {song.duration || '5:30'}
                    </p>
                  </div>
                </div>

                {/* Actions: Direct Play & Add (+) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isThisSelected && onPlayPause) {
                        onPlayPause(!isPlaying);
                      } else {
                        onSelectSong(song);
                      }
                    }}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/30 flex items-center justify-center text-white/70 hover:text-amber-300 transition-all cursor-pointer"
                    title={isThisPlaying ? 'Pause' : 'Play'}
                  >
                    {isThisPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSingleTrack(song)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                        : 'bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 text-white/70 hover:text-emerald-300'
                    }`}
                    title="Add to Playlist (+)"
                  >
                    {isAdded ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Albums Section: [cover] [cover] [cover] */}
      <div className="flex flex-col gap-3" id="artist-albums-section">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-purple-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/90 font-mono">
              Albums & Discography
            </h2>
          </div>
          <span className="text-[10px] font-mono text-white/40">
            {artistData.albums.length} Releases
          </span>
        </div>

        {/* Continuous Experience: Album Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {artistData.albums.map((album) => {
            const isSelected = selectedAlbum?.id === album.id;

            return (
              <div
                key={album.id}
                onClick={() => setSelectedAlbum(isSelected ? null : album)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer group flex flex-col gap-2.5 ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/20'
                    : 'bg-black/40 hover:bg-black/60 border-white/10 hover:border-white/20'
                }`}
              >
                {/* [cover] */}
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-800 border border-white/10 relative">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono font-medium text-white/80">
                    <span>{album.year}</span>
                    <span>{album.tracksCount} tracks</span>
                  </div>
                </div>

                {/* Album Info */}
                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {album.title}
                  </h4>
                  <p className="text-[11px] text-white/50 truncate">
                    {album.genre || artistData.genre}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Album Tracks Panel (Continuous Experience: Artist -> Albums -> Tracks) */}
        {selectedAlbum && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col gap-3 animate-fade-in mt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Tracks in "{selectedAlbum.title}" ({selectedAlbum.year})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className="text-[11px] text-purple-300 hover:text-white transition cursor-pointer"
              >
                Close Album
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {selectedAlbum.tracks.map((track, i) => {
                const isThisPlaying = currentSong?.id === track.id && isPlaying;
                const isAdded = !!addedTrackIds[track.id];

                return (
                  <div
                    key={track.id || i}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-purple-500/30 transition-all"
                  >
                    <div 
                      onClick={() => onSelectSong(track)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="text-xs font-mono text-white/40 w-4 text-center">
                        {i + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">
                          {track.title}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {track.duration || '4:45'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectSong(track)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-white/70 hover:text-purple-300 transition cursor-pointer"
                      >
                        {isThisPlaying ? <Pause className="w-3.5 h-3.5 text-purple-400" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSingleTrack(track)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isAdded ? 'bg-emerald-500 text-black' : 'bg-white/5 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
