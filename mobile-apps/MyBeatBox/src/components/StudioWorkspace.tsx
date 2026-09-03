import { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Plus,
  Trash2,
  Save,
  Volume2,
  RotateCcw,
  Sparkles,
  Music,
  Radio,
  Layers,
  Wand2,
  Check,
  Download,
  Flame,
  Zap,
  Disc
} from 'lucide-react';
import { Song, Playlist, ThemeConfig } from '../types';

interface StudioWorkspaceProps {
  playlists: Playlist[];
  activePlaylistId: string | null;
  currentSong: Song | null;
  isPlaying: boolean;
  onSelectSong: (song: Song) => void;
  onPlayPause: (playing: boolean) => void;
  onPlaylistChange?: (playlist: Playlist) => void;
  onCreatePlaylist?: (name: string, description: string) => void;
  onAddSongToPlaylist?: (playlistId: string, song: Song) => void;
  theme?: ThemeConfig;
  isOffline?: boolean;
}

export default function StudioWorkspace({
  playlists,
  activePlaylistId,
  currentSong,
  isPlaying,
  onSelectSong,
  onPlayPause,
  onPlaylistChange,
  onCreatePlaylist,
  onAddSongToPlaylist,
  theme,
  isOffline
}: StudioWorkspaceProps) {
  const [activeStudioSection, setActiveStudioSection] = useState<'mixer' | 'recorder' | 'projectEditor' | 'soundboard'>('mixer');

  // 1. Equalizer State
  const [eqGains, setEqGains] = useState<{ [freq: string]: number }>({
    '60Hz': 4,
    '150Hz': 2,
    '400Hz': 0,
    '1kHz': 1,
    '2.4kHz': 3,
    '6kHz': 2,
    '15kHz': 4,
  });
  const [bassBoost, setBassBoost] = useState<number>(6);
  const [spatialVirtualizer, setSpatialVirtualizer] = useState<boolean>(true);
  const [reverbPreset, setReverbPreset] = useState<'studio' | 'club' | 'hall' | 'cathedral'>('studio');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // 2. Mic / Audio Recorder State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordSongTitle, setRecordSongTitle] = useState<string>('My BeatBox Vocal Take #1');
  const [recordSavedToast, setRecordSavedToast] = useState<string | null>(null);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 3. Audio Project / Playlist Editing State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activePlaylistId || (playlists[0]?.id || ''));
  const currentProject = playlists.find(p => p.id === selectedProjectId) || playlists[0];
  const [projectTitle, setProjectTitle] = useState<string>(currentProject?.name || 'Studio Project');
  const [projectDesc, setProjectDesc] = useState<string>(currentProject?.description || '');
  const [projectSavedToast, setProjectSavedToast] = useState<boolean>(false);

  // Sound FX synthesizers (Web Audio procedural triggers)
  const playFxSound = (type: 'airhorn' | 'scratch' | 'subdrop' | 'hihat' | 'laser' | 'cheer') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'subdrop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'hihat') {
        // High-pass filtered noise burst
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'scratch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.08);
        osc.frequency.linearRampToValueAtTime(200, now + 0.16);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'airhorn') {
        [440, 554, 659].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
        });
      } else {
        // Cheer / chord
        [523.25, 659.25, 783.99].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
        });
      }
    } catch (e) {
      console.warn('Audio FX context notice:', e);
    }
  };

  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);

  // Start Mic Recording
  const startRecording = async () => {
    setMicErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone media recording is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      // Set up volume level analyser
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolumeLevel(Math.min(100, Math.round((avg / 255) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access notice:', err);
      setMicErrorMsg('Microphone access unavailable or blocked in iframe. You can load a sample vocal stem below!');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    }
  };

  // Save Recorded Audio Track to Current Playlist or Library
  const handleSaveRecordingToProject = () => {
    if (!recordedAudioUrl) return;
    const mins = Math.floor(recordingTime / 60);
    const secs = recordingTime % 60;
    const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const newRecordedSong: Song = {
      id: `rec-${Date.now()}`,
      title: recordSongTitle.trim() || 'Studio Voice Stem',
      artist: 'MyBeatBox Recording',
      album: currentProject?.name || 'Studio Session Stems',
      duration: durStr || '0:15',
      durationSec: recordingTime || 15,
      url: recordedAudioUrl,
      coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
      genre: 'Studio Recording',
      isLocal: true,
    };

    if (currentProject && onPlaylistChange) {
      const updated = {
        ...currentProject,
        songs: [newRecordedSong, ...currentProject.songs]
      };
      onPlaylistChange(updated);
    }

    setRecordSavedToast(`Saved "${newRecordedSong.title}" to ${currentProject?.name || 'project'}!`);
    setTimeout(() => setRecordSavedToast(null), 3500);
  };

  // Handle saving project details
  const handleSaveProjectDetails = () => {
    if (currentProject && onPlaylistChange) {
      onPlaylistChange({
        ...currentProject,
        name: projectTitle,
        description: projectDesc
      });
      setProjectSavedToast(true);
      setTimeout(() => setProjectSavedToast(false), 3000);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in" id="studio-workspace">
      
      {/* 1. Header Banner & Section Navigation Tabs */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#110c22] via-[#0d1326] to-[#0a1b24] border border-white/10 shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-purple-500/20 shrink-0">
              <Sliders className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  🎛️ Audio Studio & Mixing Deck
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-bold">
                  Pro Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-200/70 mt-0.5">
                Recording, audio projects, playlist creation, parametric editing & live mixing.
              </p>
            </div>
          </div>

          {/* Quick Active Song Status */}
          {currentSong && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60 truncate max-w-[140px]">Live Audio:</span>
              <span className="font-bold text-white truncate max-w-[150px]">{currentSong.title}</span>
            </div>
          )}
        </div>

        {/* Section Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveStudioSection('mixer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeStudioSection === 'mixer'
                ? 'bg-purple-500/25 border border-purple-400 text-purple-200 shadow-md'
                : 'bg-white/5 hover:bg-white/10 border border-transparent text-white/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Parametric EQ</span>
          </button>

          <button
            onClick={() => setActiveStudioSection('recorder')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeStudioSection === 'recorder'
                ? 'bg-rose-500/25 border border-rose-400 text-rose-200 shadow-md'
                : 'bg-white/5 hover:bg-white/10 border border-transparent text-white/60'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-400" />
            <span>Voice & Stems</span>
          </button>

          <button
            onClick={() => setActiveStudioSection('projectEditor')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeStudioSection === 'projectEditor'
                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-md'
                : 'bg-white/5 hover:bg-white/10 border border-transparent text-white/60'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Project Editor</span>
          </button>

          <button
            onClick={() => setActiveStudioSection('soundboard')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeStudioSection === 'soundboard'
                ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-md'
                : 'bg-white/5 hover:bg-white/10 border border-transparent text-white/60'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>DJ Soundboard</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: PARAMETRIC EQUALIZER & AUDIO FX
         ───────────────────────────────────────────────────────────── */}
      {activeStudioSection === 'mixer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main 7-Band Equalizer */}
          <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase">7-Band Parametric Equalizer</h3>
              </div>
              <button
                onClick={() => {
                  setEqGains({
                    '60Hz': 0,
                    '150Hz': 0,
                    '400Hz': 0,
                    '1kHz': 0,
                    '2.4kHz': 0,
                    '6kHz': 0,
                    '15kHz': 0,
                  });
                  setBassBoost(0);
                }}
                className="text-[11px] font-mono text-white/50 hover:text-white flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Flat
              </button>
            </div>

            {/* Fader Sliders Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 py-4 px-2 sm:px-4 rounded-2xl bg-white/[0.02] border border-white/5 items-end justify-items-center">
              {Object.entries(eqGains).map(([freq, gain]) => {
                const numGain = Number(gain);
                return (
                  <div key={freq} className="flex flex-col items-center gap-2 w-full">
                    <span className="text-[11px] font-mono font-bold text-purple-300">
                      {numGain > 0 ? `+${numGain}` : numGain}dB
                    </span>
                    <div className="h-36 sm:h-44 flex items-center justify-center relative">
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        value={numGain}
                        onChange={(e) => setEqGains({ ...eqGains, [freq]: Number(e.target.value) })}
                        className="accent-purple-400 -rotate-90 w-28 sm:w-36 h-2 bg-white/10 rounded-lg cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono text-white/60 font-semibold">{freq}</span>
                  </div>
                );
              })}
            </div>

            {/* Equalizer Presets Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <span className="text-xs font-mono text-white/50">Presets:</span>
              {[
                { label: 'Bass Heavy', gains: { '60Hz': 6, '150Hz': 4, '400Hz': 1, '1kHz': 0, '2.4kHz': 1, '6kHz': 3, '15kHz': 5 }, boost: 8 },
                { label: 'Vocal Clarity', gains: { '60Hz': -1, '150Hz': 0, '400Hz': 1, '1kHz': 3, '2.4kHz': 5, '6kHz': 4, '15kHz': 2 }, boost: 2 },
                { label: 'Acoustic / Sufi', gains: { '60Hz': 2, '150Hz': 3, '400Hz': 2, '1kHz': 4, '2.4kHz': 4, '6kHz': 3, '15kHz': 3 }, boost: 4 },
                { label: 'Electronic Club', gains: { '60Hz': 7, '150Hz': 5, '400Hz': -2, '1kHz': 1, '2.4kHz': 3, '6kHz': 6, '15kHz': 7 }, boost: 10 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setEqGains(p.gains);
                    setBassBoost(p.boost);
                  }}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/15 border border-white/10 text-white transition active:scale-95 cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio FX & Virtualizer Side Controls */}
          <div className="p-5 sm:p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-4">
            <h3 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Master Audio FX
            </h3>

            {/* Bass Boost Fader */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Bass Boost
                </span>
                <span className="font-mono text-amber-400 font-bold">+{bassBoost} dB</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={bassBoost}
                onChange={(e) => setBassBoost(Number(e.target.value))}
                className="w-full accent-orange-400 h-2 bg-white/10 rounded cursor-pointer"
              />
            </div>

            {/* Spatial Virtualizer Toggle */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">3D Spatial Virtualizer</span>
                <span className="text-[11px] text-white/50">Expands stereo width & immersion</span>
              </div>
              <button
                onClick={() => setSpatialVirtualizer(!spatialVirtualizer)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  spatialVirtualizer ? 'bg-cyan-400' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                    spatialVirtualizer ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Playback Tempo Speed */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-cyan-400" />
                  BPM Pitch & Speed
                </span>
                <span className="font-mono text-cyan-300 font-bold">{playbackSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-white/10 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>0.5x Slowed</span>
                <button onClick={() => setPlaybackSpeed(1.0)} className="hover:text-white">1.0x Normal</button>
                <span>1.5x Fast</span>
              </div>
            </div>

            {/* Reverb Presets */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
              <span className="text-xs font-bold text-white">Acoustic Reverb Ambience</span>
              <div className="grid grid-cols-2 gap-2">
                {(['studio', 'club', 'hall', 'cathedral'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setReverbPreset(r)}
                    className={`py-1.5 px-2 rounded-xl text-xs capitalize font-medium transition cursor-pointer ${
                      reverbPreset === r
                        ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: VOICE & MIC STEM RECORDER
         ───────────────────────────────────────────────────────────── */}
      {activeStudioSection === 'recorder' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col items-center text-center gap-6">
          <div className="max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-white font-mono uppercase flex items-center justify-center gap-2">
              <Mic className="w-5 h-5 text-rose-400" />
              Studio Voice & Beatbox Stem Recorder
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Record live vocal takes, freestyle beatbox rhythms, or acoustic instruments and add directly to your project tracks.
            </p>
          </div>

          {/* Recording Status & Waveform Indicator */}
          <div className="w-full max-w-lg p-6 rounded-3xl bg-black/60 border border-white/10 flex flex-col items-center gap-4">
            <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest">
              {formatTime(recordingTime)}
            </div>

            {/* Live Audio Level Meter Bar */}
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
              <div
                className={`h-full transition-all duration-75 ${
                  micVolumeLevel > 70 ? 'bg-red-500' : micVolumeLevel > 35 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${isRecording ? Math.max(5, micVolumeLevel) : 0}%` }}
              />
            </div>

            {/* Big Record Toggle Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-sm sm:text-base font-mono uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-rose-500/30 transition active:scale-95 cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm sm:text-base font-mono uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-red-600/40 animate-pulse transition active:scale-95 cursor-pointer"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Stop Recording</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setRecordedAudioUrl('/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/TereLiyeAtifAslambyKhiladi786/01%20-%20Tere%20Liye%20(320%20Kbps)%20-%20.mp3'));
                  setRecordingTime(18);
                  setRecordSongTitle('Acoustic Vocal Take Demo');
                }}
                className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Music className="w-4 h-4 text-purple-400" />
                <span>Load Sample Stem</span>
              </button>
            </div>

            {micErrorMsg && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-mono text-left max-w-md">
                {micErrorMsg}
              </div>
            )}
          </div>

          {/* Recorded Take Preview & Save */}
          {recordedAudioUrl && (
            <div className="w-full max-w-lg p-5 rounded-2xl bg-rose-500/10 border border-rose-400/30 flex flex-col gap-3 text-left animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-rose-300 uppercase">Recorded Stem Take</span>
                <span className="text-xs text-white/60 font-mono">{formatTime(recordingTime)} Duration</span>
              </div>

              <audio controls src={recordedAudioUrl} className="w-full h-10 rounded-lg" />

              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <input
                  type="text"
                  value={recordSongTitle}
                  onChange={(e) => setRecordSongTitle(e.target.value)}
                  placeholder="Enter Stem Title..."
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={handleSaveRecordingToProject}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs font-mono uppercase flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Add to Project</span>
                </button>
              </div>

              {recordSavedToast && (
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{recordSavedToast}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: PROJECT CREATION & AUDIO EDITOR
         ───────────────────────────────────────────────────────────── */}
      {activeStudioSection === 'projectEditor' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Playlist & Project Construction Editor
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Manage track sequencing, arrange playlist projects, and update metadata.
              </p>
            </div>

            {/* Project Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/50">Active Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const p = playlists.find(pl => pl.id === e.target.value);
                  if (p) {
                    setProjectTitle(p.name);
                    setProjectDesc(p.description);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {playlists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name} ({pl.songs.length} tracks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-white/70">Project Name</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-white/70">Description / Liner Notes</label>
              <input
                type="text"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleSaveProjectDetails}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono uppercase flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Project Metadata</span>
            </button>

            {projectSavedToast && (
              <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          {/* Tracks Sequencing List */}
          <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-white uppercase">Project Tracks ({currentProject?.songs.length || 0})</span>
            </div>

            <div className="flex flex-col divide-y divide-white/[0.06] rounded-2xl bg-black/30 border border-white/5 overflow-hidden max-h-80 overflow-y-auto">
              {currentProject?.songs.map((song, idx) => (
                <div
                  key={song.id + idx}
                  className="p-3 flex items-center justify-between hover:bg-white/[0.04] transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-white/30 w-5">{idx + 1}</span>
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{song.title}</span>
                      <span className="text-[11px] text-white/50 truncate">{song.artist} • {song.genre}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-white/40">{song.duration}</span>
                    <button
                      onClick={() => onSelectSong(song)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 transition cursor-pointer"
                      title="Play track"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    {onPlaylistChange && currentProject && (
                      <button
                        onClick={() => {
                          const updated = {
                            ...currentProject,
                            songs: currentProject.songs.filter((_, i) => i !== idx)
                          };
                          onPlaylistChange(updated);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition cursor-pointer opacity-70 group-hover:opacity-100"
                        title="Remove track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: DJ SOUNDBOARD & LIVE DROPS
         ───────────────────────────────────────────────────────────── */}
      {activeStudioSection === 'soundboard' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Live DJ Soundboard & Stems Trigger
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Trigger procedural audio sound effects in real-time over your music.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'airhorn', label: 'Airhorn 🎺', color: 'from-amber-500 to-orange-500', desc: 'Hype Brass Trio' },
              { id: 'scratch', label: 'Vinyl Scratch 📀', color: 'from-purple-500 to-pink-500', desc: 'Turntable Mod' },
              { id: 'subdrop', label: 'Sub Drop 💥', color: 'from-rose-500 to-red-600', desc: 'Deep Sine Boom' },
              { id: 'hihat', label: 'Hi-Hat Roll 🥁', color: 'from-cyan-500 to-blue-500', desc: 'Crisp Noise Burst' },
              { id: 'laser', label: 'Laser Zap ⚡', color: 'from-emerald-500 to-teal-500', desc: 'Retro Saw Sweep' },
              { id: 'cheer', label: 'Crowd Chord 🎉', color: 'from-yellow-400 to-amber-500', desc: 'Harmonic Burst' },
            ].map((fx) => (
              <button
                key={fx.id}
                onClick={() => playFxSound(fx.id as any)}
                className={`p-4 rounded-2xl bg-gradient-to-br ${fx.color} text-black font-extrabold flex flex-col items-start justify-between gap-2 shadow-lg hover:shadow-xl transition-all duration-150 active:scale-90 cursor-pointer text-left`}
              >
                <span className="text-sm sm:text-base font-black uppercase font-mono tracking-tight">
                  {fx.label}
                </span>
                <span className="text-[10px] font-mono text-black/70 font-semibold uppercase">
                  {fx.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
