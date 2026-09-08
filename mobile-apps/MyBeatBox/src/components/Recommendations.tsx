import { useState } from 'react';
import { Sparkles, Play, Plus, Zap, Heart, RefreshCw } from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface RecommendationsProps {
  onSelectSong: (song: Song) => void;
  onAddPlaylist: (playlistName: string, description: string, songs: Song[]) => void;
  allSongs: Song[];
  theme: ThemeConfig;
  isOffline: boolean;
}

interface RecItem {
  title: string;
  artist: string;
  reason: string;
  genre: string;
  vibe: string;
}

export default function Recommendations({
  onSelectSong,
  onAddPlaylist,
  allSongs,
  theme,
  isOffline,
}: RecommendationsProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Synthwave', 'Ambient']);
  const [selectedMood, setSelectedMood] = useState<string>('Chill & Relax');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecItem[]>([]);
  const [saved, setSaved] = useState(false);

  const GENRES_LIST = ['Synthwave', 'Cyberpunk', 'Lofi Jazz', 'Vaporwave', 'Techno', 'Ambient', 'Space Ambient'];
  const MOODS_LIST = ['Chill & Relax', 'Deep Focus & Coding', 'High Energy Drive', 'Late Night Dreamy', 'Creative Wave'];

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const generateRecommendations = async () => {
    if (isOffline) return;
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favoriteGenres: selectedGenres,
          mood: selectedMood,
        }),
      });

      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Maps recommended song to a playable preloaded SoundHelix song
  const getPlayableSong = (rec: RecItem): Song => {
    // Try to match by genre first
    const match = allSongs.find((song) => song.genre.toLowerCase().includes(rec.genre.toLowerCase()));
    if (match) return match;

    // Fallback to random song index based on title hash
    const hash = rec.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % allSongs.length;
    return allSongs[index];
  };

  const saveToPlaylist = () => {
    if (recommendations.length === 0) return;

    // Convert recommendations to corresponding playable songs
    const songsToSave = recommendations.map((rec) => getPlayableSong(rec));
    const playlistName = `Gemini Mix: ${selectedMood}`;
    const desc = `Daily personalized recommendations curated by Gemini AI based on your preference for ${selectedGenres.join(
      ', '
    )} in a ${selectedMood} mood.`;

    onAddPlaylist(playlistName, desc, songsToSave);
    setSaved(true);
  };

  return (
    <div id="recommendations-container" className={`p-6 rounded-2xl border ${theme.cardClass} ${theme.borderClass} shadow-lg relative overflow-hidden`}>
      {/* Visual background elements */}
      <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div>
          <h2 className={`font-bold text-lg flex items-center gap-2 ${theme.textClass}`}>
            <Sparkles className="w-5 h-5 text-emerald-400 fill-current animate-pulse" />
            Gemini Acoustic Curation
          </h2>
          <p className={`text-xs ${theme.mutedTextClass}`}>Get bespoke, AI-powered music daily recommendations based on your preferences.</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/5 uppercase">
          Daily discovery
        </span>
      </div>

      {isOffline ? (
        <div className="text-center py-10 text-white/40 text-xs">
          Recommendations require server-side Gemini processing. Please reconnect online to generate bespoke tracklists.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="md:col-span-1 flex flex-col gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
            <div>
              <label className="block text-xs font-mono text-white/50 mb-2 uppercase">1. Favorite Genres</label>
              <div className="flex flex-wrap gap-1.5">
                {GENRES_LIST.map((genre) => {
                  const selected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                        selected
                          ? `${theme.accentClass} ${theme.borderClass} text-white`
                          : 'bg-black/40 border-white/5 text-white/50 hover:border-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/50 mb-2 uppercase">2. Current Mood</label>
              <div className="flex flex-col gap-1.5">
                {MOODS_LIST.map((mood) => {
                  const selected = selectedMood === mood;
                  return (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center justify-between ${
                        selected
                          ? `${theme.accentClass} ${theme.borderClass} text-white`
                          : 'bg-black/40 border-white/5 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      <span>{mood}</span>
                      {selected && <Zap className="w-3 h-3 text-emerald-400 fill-current" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={generateRecommendations}
              disabled={loading}
              className={`mt-2 w-full py-2.5 rounded-xl text-xs font-bold text-black transition hover:scale-105 flex items-center justify-center gap-2 ${theme.primaryButtonClass}`}
              id="btn-generate-recs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Curating Acoustic Waves...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black fill-current" />
                  <span>Generate AI Recommendation</span>
                </>
              )}
            </button>
          </div>

          {/* Results List */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {loading ? (
              <div className="h-full border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-8 text-white/40">
                <Sparkles className="w-8 h-8 text-emerald-400/30 animate-spin-slow mb-3" />
                <p className="text-sm font-semibold text-white/70">Assembling Acoustic Signature</p>
                <p className="text-xs text-center mt-1 max-w-xs">
                  Gemini is parsing your favorite genres to synthesize a beautiful set of tracks matching your vibe.
                </p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-white/40">5 Custom Curation Results</span>
                  <button
                    onClick={saveToPlaylist}
                    disabled={saved}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      saved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                        : `${theme.primaryButtonClass} text-black hover:scale-105`
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{saved ? 'Saved in Account' : 'Save as Playlist'}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {recommendations.map((rec, idx) => {
                    const playableSong = getPlayableSong(rec);
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="relative shrink-0 mt-1">
                            <img
                              src={playableSong.coverUrl}
                              alt={rec.title}
                              className="w-12 h-12 rounded-lg object-cover border border-white/5"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              onClick={() => onSelectSong(playableSong)}
                              className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition"
                            >
                              <Play className="w-4 h-4 text-white fill-current" />
                            </button>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold text-sm truncate ${theme.textClass}`}>{rec.title}</span>
                              <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 text-white/60">
                                {rec.genre}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 mt-0.5 font-medium">{rec.artist}</p>
                            <p className="text-[11px] text-white/40 mt-1 line-clamp-2 italic">"{rec.reason}"</p>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectSong(playableSong)}
                          className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/5 hover:bg-emerald-500/20 transition self-end sm:self-center"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Preview</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-8 text-white/40">
                <Heart className="w-10 h-10 text-white/10 mb-3" />
                <p className="text-sm">Personal Curation Pending</p>
                <p className="text-xs text-center mt-1 max-w-xs">
                  Select your genres and mood on the left, then click Generate to construct an AI bespoke daily playlist.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
