import React from 'react';
import { Sparkles, MessageCircle, Volume2 } from 'lucide-react';
import { DialogueBlock } from '../utils/pdfReaderEngine.ts';

interface SpeechBubbleOverlayProps {
  dialogues: DialogueBlock[];
  displayMode: 'translated' | 'original' | 'dual';
  targetLang: string;
}

export const SpeechBubbleOverlay: React.FC<SpeechBubbleOverlayProps> = ({
  dialogues,
  displayMode,
  targetLang,
}) => {
  if (dialogues.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {dialogues.map((d, index) => {
        const text = displayMode === 'original' 
          ? d.originalText 
          : (d.translatedText || d.originalText);

        const left = `${Math.round((d.xRatio || 0.1) * 100)}%`;
        const top = `${Math.round((d.yRatio || 0.15 + (index * 0.15) % 0.7) * 100)}%`;

        return (
          <div
            key={d.id || index}
            style={{ left, top }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto max-w-[220px] sm:max-w-[280px] group transition-all duration-300 animate-fadeIn"
          >
            {/* Localized Floating Speech Bubble */}
            <div className="relative p-2.5 rounded-2xl bg-slate-950/90 text-white border border-amber-400/60 shadow-2xl backdrop-blur-xl group-hover:scale-105 group-hover:border-amber-400 transition-all">
              <div className="flex items-center gap-1 text-[9px] font-bold text-amber-300 mb-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                <span>대사 #{index + 1}</span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-amber-50">
                {text}
              </p>
              {displayMode === 'dual' && d.translatedText && (
                <p className="text-[10px] text-slate-400 font-serif italic mt-1 pt-1 border-t border-white/10">
                  {d.originalText}
                </p>
              )}

              {/* Bubble pointer indicator */}
              <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-slate-950 border-r border-b border-amber-400/60 rotate-45" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
