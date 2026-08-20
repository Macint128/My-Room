import React from 'react';
import { 
  Home, 
  Flower2, 
  BookOpen, 
  Music, 
  Film 
} from 'lucide-react';
import { TabType, RoomLightingState } from '../types.ts';

interface FloatingMobileTabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  lighting: RoomLightingState;
  gardenBloomingCount?: number;
}

export const FloatingMobileTabBar: React.FC<FloatingMobileTabBarProps> = ({
  activeTab,
  onSelectTab,
  lighting,
  gardenBloomingCount = 0,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'room', label: '방', icon: <Home className="w-5 h-5" /> },
    { id: 'garden', label: '정원', icon: <Flower2 className="w-5 h-5" />, badge: gardenBloomingCount },
    { id: 'manga', label: '서재', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'music', label: '음악', icon: <Music className="w-5 h-5" /> },
    { id: 'cinema', label: '시네마', icon: <Film className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto">
      <nav 
        className="glass-panel rounded-3xl p-1.5 border border-white/20 shadow-2xl backdrop-blur-2xl flex items-center justify-around"
        style={{
          boxShadow: `0 10px 40px -5px ${lighting.color}44, 0 0 0 1px rgba(255,255,255,0.15)`,
          background: 'rgba(15, 23, 42, 0.78)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl min-w-[56px] transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Glass Pill Highlight */}
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-2xl border border-white/25 -z-10 animate-fadeIn"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.22), ${lighting.color}44)`,
                    boxShadow: `0 4px 12px ${lighting.glowColor}33, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  }}
                />
              )}

              {/* Badge for garden harvest / updates */}
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
              )}

              <div className={`transition-transform duration-200 ${isActive ? 'scale-110 text-amber-300' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
