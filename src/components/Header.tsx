import React from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Sun, 
  SunMedium, 
  Sunset, 
  Moon, 
  CloudRain, 
  Coffee,
  Sliders
} from 'lucide-react';
import { TabType, TimeOfDay, WeatherType, TeaOption, RoomLightingState } from '../types.ts';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (time: TimeOfDay) => void;
  weather: WeatherType;
  onChangeWeather: (weather: WeatherType) => void;
  currentTea?: TeaOption | null;
  onOpenTeaModal?: () => void;
  onOpenSoundMixer: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lighting: RoomLightingState;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  timeOfDay,
  onChangeTimeOfDay,
  weather,
  onChangeWeather,
  currentTea,
  onOpenTeaModal,
  onOpenSoundMixer,
  isMuted,
  onToggleMute,
  lighting,
}) => {
  const cycleTimeOfDay = () => {
    const times: TimeOfDay[] = ['morning', 'afternoon', 'sunset', 'night'];
    const currentIndex = times.indexOf(timeOfDay);
    const nextTime = times[(currentIndex + 1) % times.length];
    onChangeTimeOfDay(nextTime);
  };

  const cycleWeather = () => {
    const weathers: WeatherType[] = ['rain', 'sakura', 'fireflies', 'snow', 'clear'];
    const currentIndex = weathers.indexOf(weather);
    const nextWeather = weathers[(currentIndex + 1) % weathers.length];
    onChangeWeather(nextWeather);
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning': return <Sun className="w-4 h-4 text-amber-300" />;
      case 'afternoon': return <SunMedium className="w-4 h-4 text-sky-300" />;
      case 'sunset': return <Sunset className="w-4 h-4 text-orange-400" />;
      case 'night': return <Moon className="w-4 h-4 text-indigo-300" />;
    }
  };

  const getWeatherIcon = () => {
    switch (weather) {
      case 'rain': return '🌧️';
      case 'sakura': return '🌸';
      case 'fireflies': return '✨';
      case 'snow': return '❄️';
      case 'clear': return '🌙';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 pt-3 pb-3 backdrop-blur-2xl bg-slate-950/70 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* App Title & Dynamic Aura for Mobile & Desktop */}
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 transition-all duration-500 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${lighting.color}44, ${lighting.glowColor}88)`,
              boxShadow: `0 0 16px ${lighting.glowColor}44`,
            }}
          >
            <Sparkles className="w-4 h-4 text-white drop-shadow" />
            {lighting.candleFlicker && (
              <div className="absolute inset-0 bg-amber-400/20 animate-candle" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">나만의 방</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                Cozy Haven
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-light truncate hidden sm:block">
              애플 감성 글래스모피즘 힐링 공간
            </p>
          </div>
        </div>

        {/* Quick Ambient Environmental Controls (Time, Weather, Sound, Tea) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Time Switcher Capsule */}
          <button
            onClick={cycleTimeOfDay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition-all hover:scale-105"
            title="시간대 전환 (아침/오후/노을/심야)"
          >
            {getTimeIcon()}
            <span className="capitalize text-[11px] hidden sm:inline">{timeOfDay}</span>
          </button>

          {/* Weather Switcher Capsule */}
          <button
            onClick={cycleWeather}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition-all hover:scale-105"
            title="창밖 날씨 전환 (비/벚꽃/반딧불이/눈/맑음)"
          >
            <span>{getWeatherIcon()}</span>
            <span className="capitalize text-[11px] hidden sm:inline">{weather}</span>
          </button>

          {/* Sound Mixer Quick Open */}
          <button
            onClick={onOpenSoundMixer}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-emerald-300 transition-all hover:scale-105"
            title="사운드스케이프 믹서 열기"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">사운드</span>
          </button>

          {/* Master Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
