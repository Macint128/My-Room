import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Music, 
  Film, 
  Flower2, 
  Coffee, 
  Flame, 
  Sliders, 
  Volume2, 
  CloudRain, 
  Disc, 
  Wind, 
  Layers,
  Sun,
  Leaf
} from 'lucide-react';
import { 
  TabType, 
  RoomLightingState, 
  LightingPreset, 
  TeaOption, 
  AmbientSoundTrack, 
  TimeOfDay, 
  WeatherType 
} from '../types.ts';
import { LIGHTING_PRESETS } from '../data/initialData.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { SteamCanvas } from './SteamCanvas.tsx';

interface RoomHubProps {
  onSelectTab: (tab: TabType) => void;
  lighting: RoomLightingState;
  onUpdateLighting: (newLighting: Partial<RoomLightingState>) => void;
  currentTea: TeaOption | null;
  onOpenTeaModal: () => void;
  onOpenSoundModal: () => void;
  ambientSounds: AmbientSoundTrack[];
  onToggleSound: (id: string) => void;
  onSoundVolumeChange: (id: string, vol: number) => void;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  gardenBloomingCount: number;
}

export const RoomHub: React.FC<RoomHubProps> = ({
  onSelectTab,
  lighting,
  onUpdateLighting,
  currentTea,
  onOpenTeaModal,
  onOpenSoundModal,
  ambientSounds,
  onToggleSound,
  onSoundVolumeChange,
  timeOfDay,
  weather,
  gardenBloomingCount,
}) => {
  const currentPreset = LIGHTING_PRESETS.find((p) => p.id === lighting.presetId) || LIGHTING_PRESETS[0];

  const handleSelectPreset = (preset: LightingPreset) => {
    onUpdateLighting({
      presetId: preset.id,
      color: preset.color,
      glowColor: preset.glowColor,
      temperature: preset.temperature,
      brightness: preset.brightness,
      candleFlicker: preset.flickerSpeed > 0,
    });
  };

  const handleQuickSingingBowl = () => {
    audioEngine.playSingingBowl(432, 5.5);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* 1. Main Interactive Room Haven Stage with Apple Glassmorphism */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden glass-panel border border-white/15 p-6 md:p-8 transition-all duration-700 shadow-2xl"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, ${lighting.color}28 0%, rgba(15, 23, 42, 0.85) 80%)`,
          boxShadow: `0 20px 60px -10px ${lighting.color}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}
      >
        {/* Ambient Room Glow Orb (Light source) */}
        <div 
          className={`absolute top-6 right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            lighting.candleFlicker ? 'animate-candle' : lighting.breatheEffect ? 'animate-breathe-glow' : ''
          }`}
          style={{
            backgroundColor: lighting.glowColor,
            opacity: (lighting.brightness / 100) * 0.45,
          }}
        />

        {/* Room Header Info */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3" />
                {timeOfDay === 'morning' ? '상쾌한 아침 햇살' : timeOfDay === 'afternoon' ? '포근한 오후의 쉼' : timeOfDay === 'sunset' ? '노을빛 골든 아워' : '고요한 심야의 은신처'}
              </span>
              <span className="text-[11px] text-slate-300 font-mono">
                {weather === 'rain' ? '🌧️ 창가 빗방울' : weather === 'sakura' ? '🌸 흩날리는 벚꽃' : weather === 'fireflies' ? '✨ 밤의 반딧불이' : weather === 'snow' ? '❄️ 소복한 눈꽃' : '🌙 맑은 밤하늘'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              나만의 아늑한 안식처
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/90 mt-1 max-w-xl leading-relaxed">
              차가운 유리 질감의 세련됨과 포근한 감성 조명이 머무는 공간. 정원을 가꾸거나, 3D 책장을 넘기며 로파이 음악을 즐겨보세요.
            </p>
          </div>

          {/* Quick Active Status Pills & Realistic Steaming Tea Mug */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Brewed Tea Mug with Live Steam Animation */}
            <div className="relative group">
              <button
                onClick={onOpenTeaModal}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-xs transition-all hover:scale-105 shadow-lg"
              >
                <div className="relative flex items-center justify-center">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-300 shadow"
                    style={{ backgroundColor: `${currentTea ? currentTea.color : '#fbbf24'}33` }}
                  >
                    <Coffee className="w-4 h-4" />
                  </div>
                  {/* Steaming Smoke Effect on top of tea cup */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none opacity-80">
                    <SteamCanvas tintColor={currentTea?.color ? `${currentTea.color}` : 'rgba(255,255,255,0.4)'} />
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-amber-300 font-mono block">
                    {currentTea ? '따스하게 우린 차' : '차 준비하기'}
                  </span>
                  <span className="text-xs font-bold text-white block truncate max-w-[130px]">
                    {currentTea ? currentTea.nameKo : '차를 골라보세요'}
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Sing Bowl Bell */}
            <button
              onClick={handleQuickSingingBowl}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-semibold text-sky-200 transition-all hover:scale-105 shadow-md"
              title="432Hz 티베탄 싱잉볼 울림 듣기"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>싱잉볼 공명</span>
            </button>
          </div>
        </div>

        {/* 2. Interactive Activity Pods Grid (Vertical Stacks & Cards) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* Station 1: Zen Garden Terrace */}
          <div
            id="station-garden"
            onClick={() => onSelectTab('garden')}
            className="group relative cursor-pointer p-5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-emerald-400/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                  <Flower2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  {gardenBloomingCount > 0 ? `${gardenBloomingCount}송이 만개` : '정원 온실'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-emerald-200 transition-colors">
                나만의 정원 & 온실
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                살랑이는 풀잎과 사계절 테마 속에서 씨앗을 심고 찻잎을 수확하세요.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-300 font-semibold">
              <span>정원 둘러보기</span>
              <span className="group-hover:translate-x-1 transition-transform">🌿 →</span>
            </div>
          </div>

          {/* Station 2: Bookshelf (Manga & 3D Realistic Book) */}
          <div
            id="station-manga"
            onClick={() => onSelectTab('manga')}
            className="group relative cursor-pointer p-5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  3D 서재
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-amber-200 transition-colors">
                만화책 & 라노벨 읽기
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                종이 질감과 3D 책장 넘김 효과로 감성 문학을 읽고 AI로 소설을 창작하세요.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-amber-300 font-semibold">
              <span>서재 열기</span>
              <span className="group-hover:translate-x-1 transition-transform">📖 →</span>
            </div>
          </div>

          {/* Station 3: Music Lounge */}
          <div
            id="station-music"
            onClick={() => onSelectTab('music')}
            className="group relative cursor-pointer p-5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-violet-400/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-violet-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:scale-110 transition-transform">
                  <Disc className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  LP 턴테이블
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-violet-200 transition-colors">
                로파이 음악 라운지
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                빗소리, 벽난로, 바이닐 질감과 함께 감미로운 피아노 선율을 감상하세요.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-violet-300 font-semibold">
              <span>음악 감상</span>
              <span className="group-hover:translate-x-1 transition-transform">🎵 →</span>
            </div>
          </div>

          {/* Station 4: Cinema Lounge */}
          <div
            id="station-cinema"
            onClick={() => onSelectTab('cinema')}
            className="group relative cursor-pointer p-5 rounded-3xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-pink-400/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-pink-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 group-hover:scale-110 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  빔 프로젝터
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-pink-200 transition-colors">
                홈 시네마 & 영상 라운지
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                지브리 감성 빗소리 방, 도쿄 야경, 모닥불 등 앰비언트 라이팅 영상 휴식.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-pink-300 font-semibold">
              <span>시네마 입장</span>
              <span className="group-hover:translate-x-1 transition-transform">🎬 →</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Vertical Stacks: Room Lighting Engine & Ambient Sound Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Stack (7 cols): Room Lighting & Atmosphere Controller */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-4 h-4 rounded-full shadow-md"
                style={{ backgroundColor: lighting.color, boxShadow: `0 0 10px ${lighting.glowColor}` }}
              />
              <h2 className="text-base font-bold text-white">조명 & 감성 무드 제어</h2>
            </div>
            <span className="text-xs font-mono text-amber-300 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
              {currentPreset.nameKo} ({lighting.temperature}K)
            </span>
          </div>

          {/* Lighting Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {LIGHTING_PRESETS.map((preset) => {
              const isSelected = lighting.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-white/15 border-white/40 shadow-md scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: preset.color, boxShadow: isSelected ? `0 0 10px ${preset.glowColor}` : 'none' }}
                    />
                    <span className="text-[10px] font-mono text-slate-400">{preset.temperature}K</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{preset.nameKo.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 truncate">{preset.name}</span>
                </button>
              );
            })}
          </div>

          {/* Lighting Fine-Tune Sliders */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            {/* Brightness Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>조명 밝기</span>
                <span className="font-mono text-amber-300">{lighting.brightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={lighting.brightness}
                onChange={(e) => onUpdateLighting({ brightness: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Effects Switches (Candle Flicker & Warm Breathing) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => onUpdateLighting({ candleFlicker: !lighting.candleFlicker })}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  lighting.candleFlicker
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className={`w-3.5 h-3.5 ${lighting.candleFlicker ? 'text-amber-400 animate-pulse' : ''}`} />
                  <span>촛불 흔들림 효과</span>
                </div>
                <span className="text-[10px] font-bold">{lighting.candleFlicker ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => onUpdateLighting({ breatheEffect: !lighting.breatheEffect })}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  lighting.breatheEffect
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-200 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wind className={`w-3.5 h-3.5 ${lighting.breatheEffect ? 'text-sky-400 animate-pulse' : ''}`} />
                  <span>호흡 숨결 조명</span>
                </div>
                <span className="text-[10px] font-bold">{lighting.breatheEffect ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Stack (5 cols): Ambient Soundscape Quick Mixer */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white">룸 사운드스케이프</h2>
            </div>
            <button
              onClick={onOpenSoundModal}
              className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold"
            >
              전체 믹서 열기 →
            </button>
          </div>
          <p className="text-xs text-slate-400">
            방 안의 자연 소리를 원하는 볼륨으로 믹싱해보세요.
          </p>

          {/* Quick Sound Channels */}
          <div className="space-y-3 pt-1">
            {ambientSounds.slice(0, 4).map((sound) => {
              return (
                <div 
                  key={sound.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    sound.isPlaying ? 'bg-white/10 border-emerald-500/30 shadow-sm' : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => onToggleSound(sound.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-white hover:text-emerald-300 transition-colors"
                    >
                      <div className={`p-1.5 rounded-lg ${sound.isPlaying ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                        {sound.type === 'rain' ? <CloudRain className="w-3.5 h-3.5" /> : sound.type === 'fireplace' ? <Flame className="w-3.5 h-3.5" /> : sound.type === 'vinyl' ? <Disc className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
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
                      onChange={(e) => onSoundVolumeChange(sound.id, Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
