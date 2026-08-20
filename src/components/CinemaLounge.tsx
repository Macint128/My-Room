import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Tv, 
  Monitor, 
  Sliders,
  Coffee
} from 'lucide-react';
import { CinemaScene, RoomLightingState } from '../types.ts';
import { CINEMA_SCENES } from '../data/initialData.ts';

interface CinemaLoungeProps {
  lighting: RoomLightingState;
  onUpdateLighting: (newLighting: Partial<RoomLightingState>) => void;
}

export const CinemaLounge: React.FC<CinemaLoungeProps> = ({
  lighting,
  onUpdateLighting,
}) => {
  const [scenes] = useState<CinemaScene[]>(CINEMA_SCENES);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCinemaDimMode, setIsCinemaDimMode] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [activeCustomVideo, setActiveCustomVideo] = useState<string | null>(null);

  const currentScene = scenes[currentSceneIndex];

  const handleSelectScene = (index: number) => {
    setCurrentSceneIndex(index);
    setActiveCustomVideo(null);
    setIsPlaying(true);
    // Sync room lighting to scene ambient color
    const scene = scenes[index];
    onUpdateLighting({
      color: scene.ambientColor,
      glowColor: scene.ambientColor,
    });
  };

  const handleToggleCinemaMode = () => {
    const nextMode = !isCinemaDimMode;
    setIsCinemaDimMode(nextMode);
    if (nextMode) {
      onUpdateLighting({ brightness: 30 });
    } else {
      onUpdateLighting({ brightness: 80 });
    }
  };

  const handleApplyCustomVideo = () => {
    if (!customVideoUrl.trim()) return;
    setActiveCustomVideo(customVideoUrl.trim());
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Cinema Projection Screen with Ambilight Backglow */}
      <div 
        className={`relative rounded-3xl overflow-hidden border border-white/20 transition-all duration-700 shadow-2xl ${
          isCinemaDimMode ? 'p-2 md:p-4 bg-black/90' : 'p-6 md:p-8 glass-panel'
        }`}
      >
        {/* Dynamic Ambilight Backglow */}
        <div 
          className="absolute inset-0 blur-3xl opacity-45 pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: currentScene.ambientColor }}
        />

        {/* Cinema Stage Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white">
                {activeCustomVideo ? '커스텀 영상 스트림' : currentScene.title}
              </h2>
              <p className="text-xs text-slate-300">{currentScene.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleCinemaMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isCinemaDimMode
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                  : 'bg-white/10 border-white/15 text-slate-300 hover:text-white'
              }`}
            >
              {isCinemaDimMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isCinemaDimMode ? '시네마 모드 닫기' : '시네마 모드 몰입 (조명 어둡게)'}</span>
            </button>
          </div>
        </div>

        {/* Video Canvas / Backdrop Display */}
        <div className="relative z-10 w-full h-[320px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-white/20">
          <img
            src={currentScene.backdropUrl}
            alt={currentScene.title}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isPlaying ? 'scale-105 filter brightness-100' : 'filter brightness-75'
            }`}
          />

          {/* Ambient Video Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Screen Floating Ambient Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-white border border-white/20">
              4K HDR · 앰비언트 시네마
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] text-amber-300 border border-white/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>엠비라이트 연동 중</span>
            </span>
          </div>

          {/* Screen Bottom Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <div className="hidden sm:block">
                <span className="text-xs font-bold text-white block">{currentScene.title}</span>
                <span className="text-[10px] text-slate-300">{currentScene.description}</span>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-300">{currentScene.duration}</span>
          </div>
        </div>
      </div>

      {/* 2. Curated Scenic Moods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {scenes.map((scene, idx) => {
          const isSelected = currentSceneIndex === idx && !activeCustomVideo;
          return (
            <div
              key={scene.id}
              onClick={() => handleSelectScene(idx)}
              className={`group cursor-pointer rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                isSelected
                  ? 'glass-panel border-pink-400/60 shadow-xl scale-[1.02]'
                  : 'bg-slate-900/60 border-white/10 hover:bg-slate-900/90'
              }`}
            >
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={scene.backdropUrl}
                  alt={scene.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div
                  className="absolute bottom-2 right-2 w-3 h-3 rounded-full border border-white/40 shadow-sm"
                  style={{ backgroundColor: scene.ambientColor }}
                />
              </div>

              <div className="p-4 space-y-1">
                <h4 className="text-xs font-bold text-white group-hover:text-pink-200 transition-colors">
                  {scene.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {scene.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
