import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Play,
  Plus,
  Compass,
  Sliders,
  Music,
  Check,
  Zap,
  RotateCcw,
  Volume2,
  Disc,
  ArrowRight
} from 'lucide-react';
import { Song, Playlist, ThemeConfig } from '../types';

interface AiAssistantWorkspaceProps {
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSelectSong: (song: Song) => void;
  onPlayPause: (playing: boolean) => void;
  onAddSongToPlaylist?: (playlistId: string, song: Song) => void;
  onNavigateToTab?: (tab: 'home' | 'discover' | 'library' | 'studio') => void;
  theme?: ThemeConfig;
  isOffline?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  suggestedTracks?: Song[];
  tips?: string[];
}

export default function AiAssistantWorkspace({
  playlists,
  currentSong,
  isPlaying,
  onSelectSong,
  onPlayPause,
  onAddSongToPlaylist,
  onNavigateToTab,
  theme,
  isOffline
}: AiAssistantWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: "Hello! I'm your intelligent MyBeatBox AI assistant, powered by Gemini. Ask me for bespoke playlist ideas, deep musical lyric interpretations, genre recommendations, or Studio EQ sound design tips!",
      timestamp: Date.now(),
      tips: [
        'Try asking: "Create a 90s Sufi acoustic playlist"',
        'Ask: "Best Studio EQ settings for crisp vocals and heavy bass"',
        'Ask: "Explain the emotional taan and meaning in Dil E Umeed"'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          userContext: {
            currentSongTitle: currentSong?.title,
            currentSongArtist: currentSong?.artist,
            playlistsCount: playlists.length
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI Assistant response error');
      }

      const data = await response.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Here is your custom musical insight from MyBeatBox AI.',
        timestamp: Date.now(),
        suggestedTracks: data.suggestedTracks || [],
        tips: data.tips || []
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `I synthesized your request for "${query}". Explore our curated catalog and Studio mixing tools!`,
        timestamp: Date.now(),
        tips: ['Use Studio EQ to shape acoustic tone', 'Save tracks into your Stage 03 Playlist']
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrack = (song: Song) => {
    if (playlists.length > 0 && onAddSongToPlaylist) {
      onAddSongToPlaylist(playlists[0].id, song);
      setAddedToast(`Added "${song.title}" to ${playlists[0].name}!`);
      setTimeout(() => setAddedToast(null), 3000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in" id="ai-assistant-workspace">
      
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0d1c24] via-[#091522] to-[#120e29] border border-cyan-500/20 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/20 shrink-0">
            <Bot className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                🤖 MyBeatBox AI Music Assistant
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 uppercase font-bold">
                Gemini 3.7
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cyan-200/70 mt-0.5">
              Your intelligent companion for music discovery, playlist generation, audio analysis & production advice.
            </p>
          </div>
        </div>

        {/* Quick Clear Conversation Button */}
        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-reset',
                sender: 'ai',
                text: "Chat reset! How can I assist with your music today?",
                timestamp: Date.now(),
                tips: ['"Recommend 5 late night Sufi tracks"', '"How should I EQ vocals in the Studio?"']
              }
            ]);
          }}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl text-xs font-mono text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* 2. Quick Prompt Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs font-mono text-white/50 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Quick Prompts:
        </span>
        {[
          'Create a 90s Sufi acoustic playlist',
          'Best Studio EQ settings for crisp vocals',
          'Analyze lyrics of Dil E Umeed',
          'Recommend upbeat synthwave tracks for coding',
        ].map((promptText) => (
          <button
            key={promptText}
            onClick={() => handleSendMessage(promptText)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-white/80 hover:text-cyan-300 transition active:scale-95 cursor-pointer"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* 3. Messages Chat Box */}
      <div className="w-full min-h-[380px] max-h-[520px] rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 shadow-xl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-2 max-w-[90%] sm:max-w-[80%] ${
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            {/* Sender Label */}
            <div className="flex items-center gap-1.5 px-1">
              {msg.sender === 'ai' ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-mono font-bold text-cyan-300">MyBeatBox AI</span>
                </>
              ) : (
                <span className="text-[11px] font-mono text-white/50">You</span>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold rounded-tr-sm shadow-md'
                  : 'bg-white/[0.06] border border-white/10 text-white/90 rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>

            {/* Suggested Tracks Cards (if returned by AI) */}
            {msg.suggestedTracks && msg.suggestedTracks.length > 0 && (
              <div className="w-full flex flex-col gap-2 mt-1">
                <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase">
                  🎵 Recommended Tracks:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.suggestedTracks.map((trk, i) => (
                    <div
                      key={trk.id || i}
                      className="p-2.5 rounded-xl bg-black/60 border border-cyan-500/20 flex items-center justify-between gap-2 group hover:border-cyan-400/50 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={trk.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop'}
                          alt={trk.title}
                          className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">{trk.title}</span>
                          <span className="text-[10px] text-white/50 truncate">{trk.artist}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onSelectSong(trk)}
                          className="p-1.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition cursor-pointer"
                          title="Play Song"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          onClick={() => handleAddTrack(trk)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                          title="Add to Playlist"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips / Insights list */}
            {msg.tips && msg.tips.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-[11px] text-cyan-200/90 font-mono">
                <span className="font-bold uppercase text-cyan-300">💡 Audio & Discovery Advice:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {msg.tips.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 self-start p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-cyan-300 font-mono animate-pulse">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Gemini AI is analyzing music intelligence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Added to Playlist Toast */}
      {addedToast && (
        <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-xs flex items-center justify-between gap-2 font-mono animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{addedToast}</span>
          </div>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('library')}
              className="underline text-white hover:text-emerald-200 cursor-pointer text-[11px]"
            >
              View in Library →
            </button>
          )}
        </div>
      )}

      {/* 4. Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-black/60 border border-white/15 focus-within:border-cyan-400/70 transition shadow-xl"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask MyBeatBox AI anything about music, lyrics, EQ, or playlist ideas..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`p-2.5 sm:px-4 rounded-xl text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
            inputText.trim() && !isLoading
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md shadow-cyan-500/20'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

    </div>
  );
}
