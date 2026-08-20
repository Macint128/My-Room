import React, { useState } from 'react';
import { Coffee, X, Sparkles, Check, Flame, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeaOption } from '../types.ts';
import { TEA_OPTIONS } from '../data/initialData.ts';
import { audioEngine } from '../utils/audioEngine.ts';

interface TeaBrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTea: TeaOption | null;
  onSelectTea: (tea: TeaOption) => void;
}

export const TeaBrewModal: React.FC<TeaBrewModalProps> = ({
  isOpen,
  onClose,
  currentTea,
  onSelectTea,
}) => {
  const [selectedTea, setSelectedTea] = useState<TeaOption>(currentTea || TEA_OPTIONS[0]);
  const [isBrewing, setIsBrewing] = useState(false);

  if (!isOpen) return null;

  const handleBrew = (tea: TeaOption) => {
    setSelectedTea(tea);
    setIsBrewing(true);
    audioEngine.playTeaPour();

    setTimeout(() => {
      setIsBrewing(false);
      onSelectTea(tea);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: [tea.color, '#fbbf24', '#ffffff'],
      });
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">룸 티 & 핸드드립 바</h2>
              <p className="text-xs text-slate-400">마음을 편안하게 채워줄 따뜻한 차를 우려보세요.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tea Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {TEA_OPTIONS.map((tea) => {
            const isCurrent = currentTea?.id === tea.id;
            return (
              <div
                key={tea.id}
                onClick={() => handleBrew(tea)}
                className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500/50 shadow-md'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: tea.color }}
                  />
                  <span className="text-[10px] text-amber-300 font-mono">{tea.category}</span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                  {tea.nameKo}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">{tea.notes}</p>
                <div className="text-[10px] text-emerald-300 font-medium mt-2 pt-2 border-t border-white/5">
                  ✨ {tea.benefits}
                </div>
              </div>
            );
          })}
        </div>

        {/* Brewing Status Overlay */}
        {isBrewing && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center space-y-2 animate-fadeIn">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-200">
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              <span>따뜻한 물을 붓고 향긋한 찻잎을 우려내는 중...</span>
            </div>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full animate-[pulse_1s_infinite] w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
