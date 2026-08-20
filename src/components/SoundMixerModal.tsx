import React from 'react';
import { 
  Sliders, 
  X, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Flame, 
  Disc, 
  Waves, 
  Bell, 
  Moon, 
  Feather, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { AmbientSoundTrack } from '../types.ts';

interface SoundMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambientSounds: AmbientSoundTrack[];
  onToggleSound: (id: string) => void;
  onVolumeChange: (id: string, vol: number) => void;
  onApplyPreset: (preset: { [id: string]: number }) => void;
  onMuteAll: () => void;
}

export const SoundMixerModal: React.FC<SoundMixerModalProps> = ({
  isOpen,
  onClose,
  ambientSounds,
  onToggleSound,
  onVolumeChange,
  onApplyPreset,
  onMuteAll,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      name: '새벽 서재의 빗소리',
      icon: '🌧️',
      config: { rain: 0.75, vinyl: 0.45, fireplace: 0.3 },
    },
    {
      name: '타닥타닥 겨울 장작불',
      icon: '🪵',
      config: { fireplace: 0.85, chimes: 0.35, vinyl: 0.25 },
    },
    {
      name: '여름밤 달빛 테라스',
      icon: '🌙',
      config: { crickets: 0.65, chimes: 0.5, stream: 0.4 },
    },
    {
      name: '싱그러운 아침 정원',
      icon: '🌿',
      config: { birds: 0.7, stream: 0.55, chimes: 0.3 },
    },
  ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">룸 앰비언트 사운드스케이프 믹서</h2>
              <p className="text-xs text-slate-400">자연의 소리를 원하는 볼륨으로 겹쳐서 나만의 편안한 공간을 만드세요.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMuteAll}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10"
            >
              모두 끄기
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Combinations */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">추천 사운드 프리셋</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onApplyPreset(preset.config)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all hover:scale-105"
              >
                <span className="text-lg block mb-1">{preset.icon}</span>
                <span className="text-xs font-bold text-white block truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sound Tracks Multi-channel List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
          {ambientSounds.map((sound) => (
            <div
              key={sound.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                sound.isPlaying ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => onToggleSound(sound.id)}
                  className="flex items-center gap-2 text-xs font-bold text-white hover:text-emerald-300"
                >
                  <div className={`p-1.5 rounded-lg ${sound.isPlaying ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                    {getSoundIcon(sound.type)}
                  </div>
                  <span>{sound.nameKo}</span>
                </button>
                <span className="text-[10px] font-mono text-slate-400">
                  {sound.isPlaying ? `${Math.round(sound.volume * 100)}%` : '꺼짐'}
                </span>
              </div>

              {sound.isPlaying && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sound.volume}
                  onChange={(e) => onVolumeChange(sound.id, Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
