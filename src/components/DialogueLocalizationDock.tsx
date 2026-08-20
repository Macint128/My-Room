import React, { useState, useEffect } from 'react';
import { 
  Languages, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MessageSquare, 
  Layers, 
  Eye, 
  EyeOff,
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';
import { DialogueBlock } from '../utils/pdfReaderEngine.ts';
import { audioEngine } from '../utils/audioEngine.ts';

export interface DialogueLocalizationProps {
  dialogues: DialogueBlock[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  isOpen: boolean;
  onClose: () => void;
  targetLang: string;
  onChangeTargetLang: (lang: string) => void;
  showOverlay: boolean;
  onToggleOverlay: () => void;
  displayMode: 'translated' | 'original' | 'dual';
  onChangeDisplayMode: (mode: 'translated' | 'original' | 'dual') => void;
  onRescan: () => void;
}

export const DialogueLocalizationDock: React.FC<DialogueLocalizationProps> = ({
  dialogues,
  isLoading,
  currentPage,
  isOpen,
  onClose,
  targetLang,
  onChangeTargetLang,
  showOverlay,
  onToggleOverlay,
  displayMode,
  onChangeDisplayMode,
  onRescan,
}) => {
  const [activeDialogueIndex, setActiveDialogueIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showFullTranscript, setShowFullTranscript] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    setActiveDialogueIndex(0);
  }, [currentPage, dialogues]);

  if (!isOpen) return null;

  const currentDialogue = dialogues[activeDialogueIndex] || dialogues[0];

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (targetLang === 'ko') utterance.lang = 'ko-KR';
    else if (targetLang === 'ja') utterance.lang = 'ja-JP';
    else if (targetLang === 'en') utterance.lang = 'en-US';
    else if (targetLang === 'zh') utterance.lang = 'zh-CN';

    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const languages = [
    { code: 'ko', name: '한국어 (KR)' },
    { code: 'en', name: 'English (US)' },
    { code: 'ja', name: '日本語 (JP)' },
    { code: 'zh', name: '中文 (CN)' },
  ];

  return (
    <div className="absolute bottom-16 sm:bottom-14 left-2 right-2 sm:left-6 sm:right-6 max-w-4xl mx-auto z-40 animate-slideUp">
      {/* Main Connected Dock Menu (Zero Gaps, Densely Packed, Apple-Style Floating Bar) */}
      <div className="rounded-2xl bg-slate-950/95 border border-amber-500/30 backdrop-blur-2xl shadow-2xl overflow-hidden divide-y divide-white/10">
        
        {/* Top Mini Control Toolbar - Flush & Dense */}
        <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-slate-900/90 text-xs gap-2">
          {/* Left: Badge & Language Selector */}
          <div className="flex items-center divide-x divide-white/10 rounded-xl bg-white/5 border border-white/10 p-0.5 overflow-hidden">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-amber-300 font-bold text-[11px]">
              <Languages className="w-3.5 h-3.5" />
              <span>자동 대사 로컬라이징</span>
            </div>

            {/* Target Lang Switcher */}
            <div className="flex items-center">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onChangeTargetLang(lang.code)}
                  className={`px-2 py-1 text-[10px] font-semibold transition-all ${
                    targetLang === lang.code
                      ? 'bg-amber-500/30 text-amber-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Center/Right: View Modes & Overlay Toggle (Flush Segmented Group) */}
          <div className="flex items-center divide-x divide-white/10 rounded-xl bg-white/5 border border-white/10 p-0.5 overflow-hidden">
            {/* Mode Segments */}
            <button
              onClick={() => onChangeDisplayMode('translated')}
              className={`px-2.5 py-1 text-[10px] font-semibold transition-all ${
                displayMode === 'translated' ? 'bg-amber-500/30 text-amber-200' : 'text-slate-400 hover:text-white'
              }`}
            >
              번역본
            </button>
            <button
              onClick={() => onChangeDisplayMode('dual')}
              className={`px-2.5 py-1 text-[10px] font-semibold transition-all ${
                displayMode === 'dual' ? 'bg-amber-500/30 text-amber-200' : 'text-slate-400 hover:text-white'
              }`}
            >
              한/원문 병기
            </button>
            <button
              onClick={() => onChangeDisplayMode('original')}
              className={`px-2.5 py-1 text-[10px] font-semibold transition-all ${
                displayMode === 'original' ? 'bg-amber-500/30 text-amber-200' : 'text-slate-400 hover:text-white'
              }`}
            >
              원문
            </button>

            {/* Overlay On/Off Toggle */}
            <button
              onClick={onToggleOverlay}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold transition-all ${
                showOverlay ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
              title="말풍선 오버레이 표시"
            >
              {showOverlay ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3" />}
              <span>말풍선</span>
            </button>

            {/* Full Transcript Toggle */}
            <button
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold transition-all ${
                showFullTranscript ? 'bg-purple-500/30 text-purple-200' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>전체 목록</span>
            </button>

            {/* Rescan Button */}
            <button
              onClick={onRescan}
              disabled={isLoading}
              className="px-2 py-1 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              title="대사 재스캔"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-amber-300' : ''}`} />
            </button>

            {/* Close Dock */}
            <button
              onClick={onClose}
              className="px-2 py-1 text-slate-400 hover:text-white transition-colors"
              title="로컬라이징 닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Middle Section: Active Dialogue Banner / Reader Line */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-amber-300 py-1 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>현재 페이지 대사를 스캔하고 로컬라이징 번역 중입니다...</span>
            </div>
          ) : dialogues.length === 0 ? (
            <div className="text-xs text-slate-400 py-1">
              이 페이지에서 감지된 텍스트 대사가 없습니다. 이미지 만화의 경우 말풍선 또는 전체 목록을 확인해보세요.
            </div>
          ) : (
            <div className="flex-1 min-w-0 space-y-1">
              {/* Dialogue Header */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  대사 {activeDialogueIndex + 1} / {dialogues.length}
                </span>
                {currentDialogue?.isDialogue && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>주요 대사</span>
                  </span>
                )}
              </div>

              {/* Localized Text */}
              <div className="text-sm font-bold text-white leading-snug">
                {displayMode === 'original' 
                  ? currentDialogue?.originalText 
                  : (currentDialogue?.translatedText || currentDialogue?.originalText)}
              </div>

              {/* Dual Mode Sub-Text */}
              {displayMode === 'dual' && currentDialogue?.translatedText && (
                <div className="text-xs text-slate-400 font-serif italic pt-0.5 border-t border-white/5">
                  원문: {currentDialogue.originalText}
                </div>
              )}
            </div>
          )}

          {/* Right Navigation & Audio Actions */}
          {dialogues.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              {/* Prev Dialogue */}
              <button
                onClick={() => {
                  setActiveDialogueIndex((prev) => Math.max(0, prev - 1));
                  audioEngine.playUiClick();
                }}
                disabled={activeDialogueIndex <= 0}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="이전 대사"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Next Dialogue */}
              <button
                onClick={() => {
                  setActiveDialogueIndex((prev) => Math.min(dialogues.length - 1, prev + 1));
                  audioEngine.playUiClick();
                }}
                disabled={activeDialogueIndex >= dialogues.length - 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="다음 대사"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* TTS Voice Narration */}
              <button
                onClick={() => handleSpeak(currentDialogue?.translatedText || currentDialogue?.originalText || '')}
                className={`p-1.5 rounded-lg border transition-all ${
                  isSpeaking
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white'
                }`}
                title="대사 음성으로 듣기"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Copy Dialogue */}
              <button
                onClick={() => handleCopy(currentDialogue?.translatedText || currentDialogue?.originalText || '')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all"
                title="대사 복사하기"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Expandable Full Transcript Drawer */}
        {showFullTranscript && dialogues.length > 0 && (
          <div className="p-3 bg-slate-900/95 max-h-44 overflow-y-auto space-y-2 divide-y divide-white/5 scrollbar-thin">
            <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between pb-1">
              <span>페이지 전체 대사 스크립트 ({dialogues.length}개)</span>
              <span className="text-[10px] text-slate-400">클릭하여 선택</span>
            </div>
            {dialogues.map((d, idx) => (
              <div
                key={d.id || idx}
                onClick={() => {
                  setActiveDialogueIndex(idx);
                  audioEngine.playUiClick();
                }}
                className={`pt-2 cursor-pointer text-xs transition-colors rounded-lg p-2 ${
                  activeDialogueIndex === idx
                    ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="font-semibold">{d.translatedText || d.originalText}</div>
                {displayMode === 'dual' && d.translatedText && (
                  <div className="text-[10px] text-slate-500 mt-0.5">{d.originalText}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
