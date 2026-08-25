import { useEffect, useRef, useState, ChangeEvent, SyntheticEvent } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Sliders, Disc, Radio, RefreshCw, Zap, WifiOff } from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface AudioPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  theme: ThemeConfig;
  isOffline: boolean;
}

export default function AudioPlayer({
  currentSong,
  isPlaying,
  onPlayPause,
  onSkipNext,
  onSkipPrevious,
  theme,
  isOffline,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  // Bitrate states (96, 192, 320 kbps)
  const [bitrate, setBitrate] = useState<96 | 192 | 320>(192);

  // Equalizer states (gains in dB for frequencies: 60, 150, 400, 1k, 3k, 8k, 15k)
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [activePreset, setActivePreset] = useState<string>('Flat');
  const [showEq, setShowEq] = useState(false);

  // Web Audio Nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const bitrateFilterRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const EQ_FREQUENCIES = [60, 150, 400, 1000, 3000, 8000, 15000];

  const presets: { [key: string]: number[] } = {
    Flat: [0, 0, 0, 0, 0, 0, 0],
    'Bass Boost': [6, 4, 1, 0, -1, -2, -3],
    'Vocal Focus': [-4, -2, 1, 4, 5, 2, -1],
    'Cyber Electronic': [5, 3, -1, -2, 2, 4, 6],
    'Dreamy Chill': [2, 1, 0, 1, -1, -3, -4],
  };

  // Setup Audio Nodes
  const initAudio = () => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // 1. Create MediaElementSource
      const source = ctx.createMediaElementSource(audioRef.current);
      sourceRef.current = source;

      // 2. Create Equalizer filters (peaking)
      const filters = EQ_FREQUENCIES.map((freq) => {
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.0;
        filter.gain.value = 0;
        return filter;
      });
      filtersRef.current = filters;

      // 3. Create Bitrate simulator filter (Lowpass for 96kbps, High-shelf for 320kbps)
      const bFilter = ctx.createBiquadFilter();
      bFilter.type = 'allpass'; // default transparent
      bitrateFilterRef.current = bFilter;

      // 4. Create AnalyserNode
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      // Connect nodes: Source -> BitrateFilter -> EqFilters -> Analyser -> Destination
      let current: AudioNode = source;
      current.connect(bFilter);
      current = bFilter;

      filters.forEach((filter) => {
        current.connect(filter);
        current = filter;
      });

      current.connect(analyser);
      analyser.connect(ctx.destination);

      // Start canvas visualization
      drawVisualizer();
      console.log('Web Audio Context & Equalizer initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize Web Audio Equalizer:', err);
    }
  };

  // Sync EQ levels with state
  useEffect(() => {
    if (filtersRef.current.length > 0 && audioContextRef.current) {
      const time = audioContextRef.current.currentTime;
      eqGains.forEach((gain, idx) => {
        filtersRef.current[idx].gain.setValueAtTime(gain, time);
      });
    }
  }, [eqGains]);

  // Handle Bitrate changes acoustically
  useEffect(() => {
    if (!bitrateFilterRef.current || !audioContextRef.current) return;
    const filter = bitrateFilterRef.current;
    const time = audioContextRef.current.currentTime;

    if (bitrate === 96) {
      // 96kbps has a severe lowpass compression limit at 8kHz to simulate compressed MP3 stream
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(7000, time);
      console.log('Bitrate 96kbps acoustic compression filter applied.');
    } else if (bitrate === 320) {
      // 320kbps has a subtle high-shelf boost to simulate high definition sparkle
      filter.type = 'highshelf';
      filter.frequency.setValueAtTime(12000, time);
      filter.gain.setValueAtTime(2.5, time);
      console.log('Bitrate 320kbps high-definition boost applied.');
    } else {
      // 192kbps transparent
      filter.type = 'allpass';
      console.log('Bitrate 192kbps transparent acoustics applied.');
    }
  }, [bitrate]);

  // Draw Audio Visualizer on Canvas
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Draw double side bouncing or beautiful glow bars
        const percent = barHeight / 255;
        const h = percent * height * 0.85;

        // Custom theme color matching
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        if (theme.id === 'cyberpunk') {
          gradient.addColorStop(0, '#ec4899');
          gradient.addColorStop(1, '#06b6d4');
        } else if (theme.id === 'midnight-gold') {
          gradient.addColorStop(0, '#1e293b');
          gradient.addColorStop(1, '#fbbf24');
        } else if (theme.id === 'vaporwave') {
          gradient.addColorStop(0, '#8b5cf6');
          gradient.addColorStop(1, '#ec4899');
        } else {
          // Obsidian emerald
          gradient.addColorStop(0, '#065f46');
          gradient.addColorStop(1, '#34d399');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - h, barWidth - 2, h);

        x += barWidth;
      }
    };

    draw();
  };

  // Cleanup visualizer animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle Playback State Transitions & Song Changes cleanly
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong) {
      audio.pause();
      return;
    }

    // Ensure audio src is updated if it changed
    const currentAudioSrc = audio.getAttribute('src');
    if (currentAudioSrc !== currentSong.url) {
      audio.src = currentSong.url;
    }

    if (isPlaying) {
      initAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play request status:', err);
          if (err.name === 'NotAllowedError') {
            onPlayPause(false);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong?.id, currentSong?.url]);

  const togglePlay = () => {
    if (!currentSong) return;
    onPlayPause(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    onSkipNext();
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      audioRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const selectPreset = (pName: string) => {
    setActivePreset(pName);
    setEqGains([...presets[pName]]);
  };

  const handleBandGainChange = (index: number, val: number) => {
    setActivePreset('Custom');
    const newGains = [...eqGains];
    newGains[index] = val;
    setEqGains(newGains);
  };

  const handleAudioError = (e: SyntheticEvent<HTMLAudioElement, Event>) => {
    console.warn('Audio playback notice:', e);
    const audio = audioRef.current;
    if (audio && currentSong?.url) {
      // Re-attempt loading current track stream with cache-busting if needed
      if (!audio.src.includes('&retry=')) {
        const retryUrl = currentSong.url.includes('?') ? `${currentSong.url}&retry=1` : `${currentSong.url}?retry=1`;
        audio.src = retryUrl;
        if (isPlaying) {
          audio.play().catch(() => {});
        }
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="audio-player-container" className="p-4 sm:p-6 rounded-2xl border border-purple-500/25 bg-gradient-to-b from-[#1c0836]/95 via-[#120524]/95 to-[#04010a]/95 shadow-xl shadow-purple-950/25 relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-20 bg-purple-500/20 pointer-events-none" />

      {/* Embedded Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onError={handleAudioError}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Now Playing Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Disc className="w-4 h-4 animate-spin-slow text-purple-400" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-purple-300">
            {isPlaying ? 'Now Streaming' : 'Paused'}
          </span>
        </div>
        {/* Bitrate / Performance Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-black/40 border border-white/10">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-white font-mono">{bitrate}kbps HQ</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Song Info (Artwork + details) */}
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="relative group shrink-0">
            {/* Glossy Vinyl Outer Ring / Cover Wrap */}
            <div className={`relative w-20 h-20 rounded-full overflow-hidden shadow-2xl border border-white/10 transition-all duration-500 group-hover:scale-105 ${isPlaying ? 'animate-spin-slow shadow-emerald-500/10' : ''}`}>
              <img
                src={currentSong?.coverUrl || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=250&auto=format&fit=crop'}
                alt={currentSong?.title || 'No song selected'}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
              {/* Concentric Vinyl grooves */}
              <div className="absolute inset-0 rounded-full border border-black/30 pointer-events-none" />
              <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-black/40 pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-8 rounded-full border border-black/50 pointer-events-none" />
              <div className="absolute inset-10 rounded-full border border-white/10 pointer-events-none" />
              {/* Vinyl center label pinhole */}
              <div className="absolute inset-[36%] rounded-full bg-[#03050c]/90 border border-white/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
              {/* Gloss sweep reflex reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay" />
            </div>
            {isOffline && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-full flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className={`font-semibold text-lg truncate ${theme.textClass}`}>
              {currentSong?.title || 'Select a Song'}
            </h3>
            <p className={`text-sm truncate ${theme.mutedTextClass}`}>
              {currentSong?.artist || 'Ready for playback'}
            </p>
            <p className="text-xs text-white/40 truncate mt-0.5 font-mono uppercase tracking-wider text-[10px]">
              {currentSong?.album || 'Offline Cached'}
            </p>
          </div>
        </div>

        {/* Player Controls & Visualizer */}
        <div className="md:col-span-5 flex flex-col gap-3">
          {/* Audio Visualizer Canvas */}
          <div className="relative h-12 w-full bg-black/30 rounded-lg overflow-hidden border border-white/5">
            <canvas ref={canvasRef} className="w-full h-full block" width={300} height={48} />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase font-mono tracking-widest text-white/30">
                Visualizer Idle
              </div>
            )}
          </div>

          {/* Time Progress Line */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/50 w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-${theme.sliderAccentColor}-400 bg-white/10`}
            />
            <span className="text-xs font-mono text-white/50 w-10">{formatTime(duration)}</span>
          </div>

          {/* Central Control Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={onSkipPrevious}
              disabled={!currentSong}
              className={`p-2 rounded-full transition-colors duration-150 ${currentSong ? 'text-white hover:bg-white/10' : 'text-white/20'}`}
              id="btn-prev-song"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentSong}
              className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                currentSong ? `${theme.primaryButtonClass} text-black shadow-lg shadow-emerald-500/10` : 'bg-white/10 text-white/20'
              }`}
              id="btn-toggle-play"
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
            </button>

            <button
              onClick={onSkipNext}
              disabled={!currentSong}
              className={`p-2 rounded-full transition-colors duration-150 ${currentSong ? 'text-white hover:bg-white/10' : 'text-white/20'}`}
              id="btn-next-song"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Side Controls (Volume Level & EQ summary) */}
        <div className="md:col-span-3 flex flex-col gap-3">
          {/* Volume control with dynamic % level */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-white/60 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Volume Level
              </span>
              <span className="font-mono font-bold text-amber-300">
                {isMuted ? 'Muted (0%)' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors" id="btn-toggle-mute">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-${theme.sliderAccentColor}-400 bg-white/10`}
              />
            </div>

            {/* Quick volume level buttons */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              {[0.25, 0.5, 0.75, 1.0].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setVolume(lvl);
                    if (audioRef.current) audioRef.current.volume = lvl;
                    setIsMuted(false);
                  }}
                  className={`py-0.5 rounded text-[9px] font-mono transition-all ${
                    !isMuted && Math.round(volume * 100) === Math.round(lvl * 100)
                      ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {lvl * 100}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {/* Equalizer Toggle Button */}
            <button
              onClick={() => setShowEq(!showEq)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                showEq
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-black/40 border-white/10 text-white/80 hover:bg-white/10'
              }`}
              id="btn-toggle-eq"
            >
              <Sliders className="w-4 h-4" />
              <span>Equalizer ({activePreset})</span>
            </button>

            {/* Bitrate Selector Dropdown */}
            <div className="relative shrink-0 flex items-center bg-black/40 border border-white/10 rounded-lg px-2">
              <span className="text-[10px] text-white/40 uppercase font-mono mr-1">Bitrate</span>
              <select
                value={bitrate}
                onChange={(e) => setBitrate(Number(e.target.value) as any)}
                className="bg-transparent text-xs text-white/90 font-mono focus:outline-none cursor-pointer p-1"
                id="select-bitrate"
              >
                <option value={96} className="bg-neutral-900 text-white">96k</option>
                <option value={192} className="bg-neutral-900 text-white">192k</option>
                <option value={320} className="bg-neutral-900 text-white">320k</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Under the Player: Equalizer & Volume Level Dedicated Studio Panel */}
      <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-4">
        {/* Equalizer & Volume Level Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm text-white tracking-tight">
              Acoustic Equalizer & Sound FX
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              7-Band Parametric DSP
            </span>
          </div>

          {/* Equalizer Presets */}
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(presets).map((p) => (
              <button
                key={p}
                onClick={() => selectPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-all ${
                  activePreset === p
                    ? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 7-Band Equalizer Frequency Sliders Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 py-3 px-2 rounded-xl bg-black/40 border border-white/5">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}Hz`;
            const gain = eqGains[idx];
            return (
              <div key={freq} className="flex flex-col items-center justify-between gap-1.5 h-36">
                <span className={`text-[10px] font-mono font-bold ${gain > 0 ? 'text-emerald-400' : gain < 0 ? 'text-rose-400' : 'text-white/40'}`}>
                  {gain > 0 ? `+${gain}` : gain}dB
                </span>
                <div className="relative flex items-center justify-center w-4 h-20 shrink-0">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={gain}
                    onChange={(e) => handleBandGainChange(idx, Number(e.target.value))}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', width: '76px' }}
                    className="absolute cursor-pointer accent-amber-400 opacity-90"
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-semibold text-white/80">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
