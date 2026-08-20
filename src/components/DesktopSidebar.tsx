import React from 'react';
import { 
  Home, 
  Flower2, 
  BookOpen, 
  Music, 
  Film, 
  Sparkles, 
  Sun, 
  SunMedium, 
  Sunset, 
  Moon, 
  CloudRain, 
  Coffee, 
  Sliders, 
  Volume2, 
  VolumeX,
  Flame,
  Wind
} from 'lucide-react';
import { TabType, TimeOfDay, WeatherType, RoomLightingState, TeaOption } from '../types.ts';
import { LIGHTING_PRESETS } from '../data/initialData.ts';

interface DesktopSidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (time: TimeOfDay) => void;
  weather: WeatherType;
  onChangeWeather: (weather: WeatherType) => void;
  lighting: RoomLightingState;
  onUpdateLighting: (lighting: Partial<RoomLightingState>) => void;
  currentTea: TeaOption | null;
  onOpenTeaModal: () => void;
  onOpenSoundModal: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  gardenBloomingCount?: number;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  timeOfDay,
  onChangeTimeOfDay,
  weather,
  onChangeWeather,
  lighting,
  onUpdateLighting,
  currentTea,
  onOpenTeaModal,
  onOpenSoundModal,
  isMuted,
  onToggleMute,
  gardenBloomingCount = 3,
}) => {
  const tabs: { id: TabType; label: string; labelEn: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'room', label: '나만의 방', labelEn: 'Sanctuary Hub', icon: <Home className="w-4 h-4" /> },
    { 
      id: 'garden', 
      label: '나만의 정원', 
      labelEn: 'Zen Garden', 
      icon: <Flower2 className="w-4 h-4" />, 
      badge: gardenBloomingCount > 0 ? `${gardenBloomingCount}개 만개` : undefined 
    },
    { id: 'manga', label: '서재 · 만화', labelEn: 'Manga & Novel', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'music', label: '로파이 음악', labelEn: 'Sound Lounge', icon: <Music className="w-4 h-4" /> },
    { id: 'cinema', label: '홈 시네마', labelEn: 'Ambilight Screen', icon: <Film className="w-4 h-4" /> },
  ];

  const times: { id: TimeOfDay; label: string; icon: React.ReactNode }[] = [
    { id: 'morning', label: '아침', icon: <Sun className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'afternoon', label: '오후', icon: <SunMedium className="w-3.5 h-3.5 text-sky-300" /> },
    { id: 'sunset', label: '노을', icon: <Sunset className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'night', label: '심야', icon: <Moon className="w-3.5 h-3.5 text-indigo-300" /> },
  ];

  const weathers: { id: WeatherType; label: string; emoji: string }[] = [
    { id: 'rain', label: '비', emoji: '🌧️' },
    { id: 'sakura', label: '벚꽃', emoji: '🌸' },
    { id: 'fireflies', label: '반딧불', emoji: '✨' },
    { id: 'snow', label: '첫눈', emoji: '❄️' },
    { id: 'clear', label: '맑음', emoji: '🌙' },
  ];

  return (
    <aside 
      id="desktop-sidebar"
      className="hidden md:flex flex-col justify-between w-64 lg:w-72 shrink-0 h-[calc(100vh-2rem)] sticky top-4 left-4 my-4 ml-4 rounded-[28px] glass-panel border border-white/15 p-5 shadow-2xl z-30 transition-all duration-300 overflow-y-auto no-scrollbar"
      style={{
        boxShadow: `0 20px 60px -15px ${lighting.color}22, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }}
    >
      {/* Top Section: App Title & Aura */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border border-white/25 transition-all duration-700 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${lighting.color}44, ${lighting.glowColor}99)`,
              boxShadow: `0 0 20px ${lighting.glowColor}66`,
            }}
          >
            <Sparkles className="w-5 h-5 text-white drop-shadow" />
            {lighting.candleFlicker && (
              <div className="absolute inset-0 bg-amber-400/20 animate-candle" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">My Room</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/15">
                Cozy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-light truncate">나만의 힐링 룸 & 라이브러리</p>
          </div>
        </div>

        {/* Vertical Stack Navigation Tabs */}
        <nav className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
            공간 이동
          </span>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-white font-semibold shadow-lg'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, rgba(255,255,255,0.18), ${lighting.color}44)`,
                        border: '1px solid rgba(255,255,255,0.25)',
                        boxShadow: `0 4px 15px ${lighting.color}22, inset 0 1px 0 rgba(255,255,255,0.3)`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-white/20 text-amber-300' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {tab.icon}
                  </div>
                  <div className="text-left">
                    <span className="block">{tab.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal block -mt-0.5">
                      {tab.labelEn}
                    </span>
                  </div>
                </div>

                {tab.badge && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Environmental Controller Widget (Time & Weather) */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          {/* Time of Day */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>시간대</span>
              <span className="text-[10px] font-mono text-amber-300 capitalize">{timeOfDay}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-slate-950/60 border border-white/5">
              {times.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeTimeOfDay(t.id)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] transition-all ${
                    timeOfDay === t.id
                      ? 'bg-white/15 text-white font-bold border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`${t.label}로 시간대 변경`}
                >
                  {t.icon}
                  <span className="mt-0.5">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weather Effect */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>창밖 날씨</span>
              <span className="text-[10px] font-mono text-sky-300 capitalize">{weather}</span>
            </div>
            <div className="flex items-center justify-between gap-1 p-0.5 rounded-xl bg-slate-950/60 border border-white/5">
              {weathers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => onChangeWeather(w.id)}
                  className={`flex-1 py-1 rounded-lg text-xs transition-all text-center ${
                    weather === w.id
                      ? 'bg-white/15 border border-white/20 shadow-sm scale-105'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={`${w.label} 날씨 효과`}
                >
                  {w.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Lighting Color Swatches */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>무드 조명 ({lighting.temperature}K)</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lighting.color }} />
              <span className="text-[10px] text-slate-300 font-mono">{lighting.brightness}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            {LIGHTING_PRESETS.map((preset) => {
              const isSelected = lighting.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onUpdateLighting({
                    presetId: preset.id,
                    color: preset.color,
                    glowColor: preset.glowColor,
                    temperature: preset.temperature,
                    brightness: preset.brightness,
                    candleFlicker: preset.flickerSpeed > 0,
                  })}
                  className={`w-7 h-7 rounded-lg transition-all flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={`${preset.nameKo} (${preset.temperature}K)`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Brewed Tea & Quick Audio Console */}
      <div className="pt-4 border-t border-white/10 space-y-2.5">
        {/* Current Tea Card */}
        <button
          onClick={onOpenTeaModal}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div 
              className="w-7 h-7 rounded-xl flex items-center justify-center text-amber-300 shadow"
              style={{ backgroundColor: `${currentTea ? currentTea.color : '#fbbf24'}33` }}
            >
              <Coffee className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-semibold text-white block truncate">
                {currentTea ? currentTea.nameKo.split(' ')[0] : '차 준비하기'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block">
                {currentTea ? currentTea.category : '따뜻한 온기'}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-amber-300 font-bold group-hover:translate-x-0.5 transition-transform">
            우리기 →
          </span>
        </button>

        {/* Audio Engine Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSoundModal}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
            title="자연 소리 사운드 믹서 열기"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>사운드 믹서</span>
          </button>

          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
