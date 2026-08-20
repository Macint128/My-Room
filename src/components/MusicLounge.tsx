import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Disc, 
  Radio, 
  Sparkles, 
  Sliders, 
  Clock, 
  Repeat, 
  Shuffle, 
  Heart,
  CloudRain,
  Flame,
  Waves,
  Bell,
  Moon,
  Feather
} from 'lucide-react';
import { MusicTrack, AmbientSoundTrack } from '../types.ts';
import { MUSIC_PLAYLIST } from '../data/initialData.ts';
import { audioEngine } from '../utils/audioEngine.ts';

interface MusicLoungeProps {
  ambientSounds: AmbientSoundTrack[];
  onToggleAmbientSound: (id: string) => void;
  onUpdateAmbientVolume: (id: string, vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MusicLounge: React.FC<MusicLoungeProps> = ({
  ambientSounds,
  onToggleAmbientSound,
  onUpdateAmbientVolume,
  isMuted,
  onToggleMute,
}) => {
  const [playlist] = useState<MusicTrack[]>(MUSIC_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'lofi' | 'piano' | 'acoustic' | 'ambient' | 'jazz'>('all');
  const [isLooping, setIsLooping] = useState(true);
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [synthVolume, setSynthVolume] = useState(0.6);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentTrack = playlist[currentTrackIndex];

  // Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 300);
    let height = (canvas.height = 100);

    const barCount = 32;
    const bars: number[] = Array.from({ length: barCount }, () => Math.random() * 0.3);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / barCount) - 3;
      for (let i = 0; i < barCount; i++) {
        // If playing, animate bars
        if (isPlaying || isSynthPlaying) {
          const target = Math.sin(Date.now() * 0.005 + i * 0.3) * 0.4 + 0.5 + (Math.random() * 0.1);
          bars[i] += (target - bars[i]) * 0.15;
        } else {
          bars[i] += (0.05 - bars[i]) * 0.1;
        }

        const barHeight = Math.max(4, bars[i] * height * 0.85);
        const x = i * (barWidth + 3);
        const y = height - barHeight;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#fbbf24');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isSynthPlaying]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Start ambient synth chords and subtle vinyl crackle
      audioEngine.startLofiSynth(synthVolume);
      setIsSynthPlaying(true);
      if (!ambientSounds.find(s => s.id === 'vinyl')?.isPlaying) {
        onToggleAmbientSound('vinyl');
      }
    } else {
      setIsPlaying(false);
      audioEngine.stopLofiSynth();
      setIsSynthPlaying(false);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    if (!isPlaying) handleTogglePlay();
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    if (!isPlaying) handleTogglePlay();
  };

  const handleToggleSynth = () => {
    if (isSynthPlaying) {
      audioEngine.stopLofiSynth();
      setIsSynthPlaying(false);
    } else {
      audioEngine.startLofiSynth(synthVolume);
      setIsSynthPlaying(true);
      setIsPlaying(true);
    }
  };

  const handleSynthVolumeChange = (vol: number) => {
    setSynthVolume(vol);
    if (isSynthPlaying) {
      audioEngine.startLofiSynth(vol);
    }
  };

  const filteredPlaylist = activeCategory === 'all' 
    ? playlist 
    : playlist.filter(t => t.category === activeCategory);

  const getSoundIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain className="w-4 h-4" />;
      case 'fireplace': return <Flame className="w-4 h-4" />;
      case 'stream': return <Waves className="w-4 h-4" />;
      case 'chimes': return <Bell className="w-4 h-4" />;
      case 'crickets': return <Moon className="w-4 h-4" />;
      case 'birds': return <Feather className="w-4 h-4" />;
      default: return <Disc className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Main Frosted Turntable Stage */}
      <div 
        className="relative glass-panel rounded-3xl p-8 md:p-10 border border-white/15 overflow-hidden shadow-2xl"
        style={{
          background: `radial-gradient(circle at 60% 40%, rgba(139, 92, 246, 0.18) 0%, rgba(15, 23, 42, 0.85) 75%)`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Vintage Spinning Glass Turntable Visualizer */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-4 glass-panel-light border-2 border-white/20 shadow-2xl flex items-center justify-center">
              {/* Vinyl Groove Rings */}
              <div 
                className={`relative w-full h-full rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-black border-4 border-slate-800 shadow-inner flex items-center justify-center ${
                  isPlaying || isSynthPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                }`}
              >
                <div className="absolute inset-4 rounded-full border border-white/10" />
                <div className="absolute inset-8 rounded-full border border-white/10" />
                <div className="absolute inset-12 rounded-full border border-white/10" />
                
                {/* Center Label with Cover Art */}
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-lg relative">
                  <img
                    src={currentTrack.coverArt}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border border-white" />
                </div>
              </div>

              {/* Tonearm Needle */}
              <div 
                className={`absolute top-2 right-4 w-16 h-28 pointer-events-none transition-transform duration-700 origin-top-right ${
                  isPlaying || isSynthPlaying ? 'rotate-12' : '-rotate-12 opacity-60'
                }`}
              >
                <div className="w-1.5 h-20 bg-slate-400 rounded shadow-md mx-auto" />
                <div className="w-3 h-5 bg-amber-400 rounded-sm shadow-md mx-auto -mt-1" />
              </div>
            </div>

            {/* Visualizer Frequency Canvas */}
            <div className="w-full max-w-[260px] h-12 mt-4">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </div>

          {/* Right: Track Information & Player Controls */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {currentTrack.category.toUpperCase()} CHILL
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentTrack.mood}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1 font-medium">{currentTrack.artist}</p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all"
                title="이전 곡"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 transition-all hover:scale-105"
                title={isPlaying ? '일시 정지' : '재생'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all"
                title="다음 곡"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Lo-Fi Synth Generator Toggle */}
              <button
                onClick={handleToggleSynth}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                  isSynthPlaying
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
                title="실시간 Web Audio 로파이 재즈 피아노 코드 신시사이저"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>재즈 신스 루프 {isSynthPlaying ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Real-time Synth Volume Adjuster */}
            {isSynthPlaying && (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>로파이 피아노 볼륨</span>
                  <span className="font-mono text-amber-300">{Math.round(synthVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={synthVolume}
                  onChange={(e) => handleSynthVolumeChange(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Playlist Selection & Multi-layer Ambient Soundscapes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Curated Playlist (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">추천 플레이리스트</h3>
            {/* Category Filters */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(['all', 'lofi', 'piano', 'acoustic', 'ambient', 'jazz'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
                    activeCategory === cat
                      ? 'bg-violet-500/30 border-violet-400 text-violet-200 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredPlaylist.map((track, idx) => {
              const isCurrent = playlist[currentTrackIndex]?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    const originalIdx = playlist.findIndex(t => t.id === track.id);
                    setCurrentTrackIndex(originalIdx);
                    if (!isPlaying) handleTogglePlay();
                  }}
                  className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-violet-500/20 border-violet-400/40 shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                      <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Disc className="w-4 h-4 text-amber-300 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-violet-200' : 'text-white'}`}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{track.artist}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400">{track.duration}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ambient Soundscape Multi-layer Mixer (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">자연 앰비언스 레이어</h3>
            </div>
            <span className="text-xs text-slate-400">자유롭게 믹싱</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {ambientSounds.map((s) => (
              <div 
                key={s.id}
                className={`p-3 rounded-2xl border transition-all ${
                  s.isPlaying ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    onClick={() => onToggleAmbientSound(s.id)}
                    className="flex items-center gap-2 text-xs font-semibold text-white hover:text-emerald-300"
                  >
                    <div className={`p-1.5 rounded-lg ${s.isPlaying ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                      {getSoundIcon(s.type)}
                    </div>
                    <span>{s.nameKo}</span>
                  </button>
                  <span className="text-[10px] font-mono text-slate-400">
                    {s.isPlaying ? `${Math.round(s.volume * 100)}%` : '꺼짐'}
                  </span>
                </div>

                {s.isPlaying && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={s.volume}
                    onChange={(e) => onUpdateAmbientVolume(s.id, Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
