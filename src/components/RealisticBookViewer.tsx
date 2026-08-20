import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  Maximize2, 
  Minimize2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Sparkles,
  Columns,
  Square
} from 'lucide-react';
import { LightNovelStory, ReadingPreferences } from '../types.ts';
import { audioEngine } from '../utils/audioEngine.ts';

interface RealisticBookViewerProps {
  story: LightNovelStory;
  onClose: () => void;
  prefs: ReadingPreferences;
  onUpdatePrefs: (prefs: ReadingPreferences) => void;
}

export const RealisticBookViewer: React.FC<RealisticBookViewerProps> = ({
  story,
  onClose,
  prefs,
  onUpdatePrefs,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);

  // Divide chapter text into realistic book pages
  const chapter = story.chapters[0];
  const paragraphs = chapter ? chapter.content.split('\n\n').filter(p => p.trim()) : [];
  
  // Group paragraphs into pages
  const pageSize = prefs.twoPageSpread ? 2 : 3;
  const pages: string[][] = [];
  for (let i = 0; i < paragraphs.length; i += pageSize) {
    pages.push(paragraphs.slice(i, i + pageSize));
  }
  if (pages.length === 0) {
    pages.push([chapter?.content || '스토리가 비어있습니다.']);
  }

  const totalPages = pages.length;

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - (prefs.twoPageSpread ? 2 : 1) && !isFlipping) {
      if (prefs.soundEffect) audioEngine.playPageFlip();
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(prev => prev + (prefs.twoPageSpread ? 2 : 1));
        setIsFlipping(false);
      }, 400);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0 && !isFlipping) {
      if (prefs.soundEffect) audioEngine.playPageFlip();
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(prev => Math.max(0, prev - (prefs.twoPageSpread ? 2 : 1)));
        setIsFlipping(false);
      }, 400);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, totalPages, isFlipping, prefs]);

  // Color theme palettes for realistic paper
  const getPaperStyles = () => {
    switch (prefs.theme) {
      case 'parchment':
        return {
          bookCover: 'from-[#3a2312] via-[#28170b] to-[#1a0f07]',
          coverBorder: 'border-[#613b19]/60',
          paperBg: 'bg-[#fcf7ed]',
          paperShadow: 'shadow-[inset_0_0_40px_rgba(180,140,80,0.18)]',
          spineShadow: 'shadow-[inset_20px_0_25px_rgba(0,0,0,0.15)]',
          textColor: 'text-[#2e2316]',
          pageBorder: 'border-[#e8dec7]',
          accent: 'text-[#96632c]',
          lineColor: '#e0d2b4',
        };
      case 'oled-dark':
        return {
          bookCover: 'from-[#1e1b2e] via-[#110e1c] to-[#08060f]',
          coverBorder: 'border-purple-900/40',
          paperBg: 'bg-[#0f1117]',
          paperShadow: 'shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]',
          spineShadow: 'shadow-[inset_20px_0_25px_rgba(0,0,0,0.6)]',
          textColor: 'text-slate-200',
          pageBorder: 'border-slate-800',
          accent: 'text-amber-400',
          lineColor: '#1e293b',
        };
      case 'frost-glass':
        return {
          bookCover: 'from-slate-900 via-sky-950 to-slate-950',
          coverBorder: 'border-sky-500/30',
          paperBg: 'bg-slate-900/95 backdrop-blur-2xl',
          paperShadow: 'shadow-[inset_0_0_30px_rgba(56,189,248,0.1)]',
          spineShadow: 'shadow-[inset_20px_0_20px_rgba(0,0,0,0.4)]',
          textColor: 'text-slate-100',
          pageBorder: 'border-white/10',
          accent: 'text-sky-300',
          lineColor: '#334155',
        };
      case 'sakura-soft':
        return {
          bookCover: 'from-[#4a1525] via-[#330d19] to-[#20060f]',
          coverBorder: 'border-pink-900/40',
          paperBg: 'bg-[#fff5f6]',
          paperShadow: 'shadow-[inset_0_0_35px_rgba(244,114,182,0.15)]',
          spineShadow: 'shadow-[inset_20px_0_25px_rgba(190,24,93,0.12)]',
          textColor: 'text-[#4c0519]',
          pageBorder: 'border-pink-200/70',
          accent: 'text-pink-600',
          lineColor: '#fbcfe8',
        };
      case 'e-ink':
      default:
        return {
          bookCover: 'from-[#2b2b2b] via-[#1c1c1c] to-[#111111]',
          coverBorder: 'border-stone-700',
          paperBg: 'bg-[#ecebe6]',
          paperShadow: 'shadow-[inset_0_0_30px_rgba(0,0,0,0.06)]',
          spineShadow: 'shadow-[inset_20px_0_20px_rgba(0,0,0,0.15)]',
          textColor: 'text-[#181818]',
          pageBorder: 'border-[#d4d2cb]',
          accent: 'text-[#444444]',
          lineColor: '#d6d3c9',
        };
    }
  };

  const style = getPaperStyles();

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-hidden`}>
      {/* Top Floating Glass Navigation Header */}
      <div className="w-full max-w-5xl flex items-center justify-between px-4 py-3 rounded-2xl glass-panel border border-white/15 shadow-2xl z-20">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>서재로 나가기</span>
        </button>

        <div className="text-center px-2 truncate max-w-xs md:max-w-md">
          <h2 className="text-xs sm:text-sm font-bold text-amber-200 truncate">{story.title}</h2>
          <p className="text-[10px] text-slate-400 font-mono truncate">{chapter?.title} · {story.author}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdatePrefs({ ...prefs, twoPageSpread: !prefs.twoPageSpread })}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all hidden md:flex items-center"
            title={prefs.twoPageSpread ? '단면 페이지 보기' : '양면 펼침책 보기'}
          >
            {prefs.twoPageSpread ? <Square className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onUpdatePrefs({ ...prefs, soundEffect: !prefs.soundEffect })}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all"
            title={prefs.soundEffect ? '책 넘김 사운드 끄기' : '책 넘김 사운드 켜기'}
          >
            {prefs.soundEffect ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all"
            title="독서 설정 (글꼴, 테마, 줄간격)"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Modal Bar */}
      {showSettings && (
        <div className="w-full max-w-4xl p-4 mt-2 rounded-2xl glass-panel border border-white/20 backdrop-blur-3xl shadow-2xl flex flex-wrap items-center justify-between gap-4 z-30 animate-fadeIn">
          {/* Themes */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300">종이 테마:</span>
            {[
              { id: 'parchment', name: '양피지' },
              { id: 'oled-dark', name: '다크' },
              { id: 'frost-glass', name: '글래스' },
              { id: 'e-ink', name: 'e-Ink' },
              { id: 'sakura-soft', name: '사쿠라' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => onUpdatePrefs({ ...prefs, theme: t.id as any })}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  prefs.theme === t.id ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Font Controls */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">크기:</span>
              <input
                type="range"
                min="15"
                max="26"
                value={prefs.fontSize}
                onChange={(e) => onUpdatePrefs({ ...prefs, fontSize: Number(e.target.value) })}
                className="w-20 accent-amber-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">글꼴:</span>
              <button
                onClick={() => onUpdatePrefs({ ...prefs, fontFamily: prefs.fontFamily === 'serif' ? 'sans' : 'serif' })}
                className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-medium"
              >
                {prefs.fontFamily === 'serif' ? '명조/바탕' : '고딕/산세리프'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 3D Realistic Open Hardcover Book Canvas */}
      <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 select-none perspective-[1800px]">
        {/* The Realistic Book Outer Case / Hardcover Leather Body */}
        <div 
          className={`relative w-full max-w-4xl h-[480px] sm:h-[540px] md:h-[580px] rounded-[24px] p-2.5 sm:p-4 bg-gradient-to-r ${style.bookCover} border-2 ${style.coverBorder} shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)] flex items-center justify-center`}
        >
          {/* Decorative Gold Inlay Frame on Book Cover Edge */}
          <div className="absolute inset-2 rounded-[20px] border border-amber-500/20 pointer-events-none" />

          {/* Book Spine Center Crease & Bookmark Ribbon */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 z-30 pointer-events-none flex flex-col items-center">
            {/* Spine Shadow Gradient */}
            <div className="w-full h-full bg-gradient-to-r from-black/40 via-black/10 to-black/40" />
            {/* Hanging Satin Bookmark Ribbon */}
            <div 
              className="absolute -top-3 w-4 h-36 bg-gradient-to-b from-red-600 via-rose-700 to-red-800 shadow-xl rounded-b-sm border-x border-red-900/50 transform -rotate-1 origin-top transition-transform duration-500 hover:rotate-6"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
              }}
            />
          </div>

          {/* Realistic Book Pages Container (Spread / Single) */}
          <div className="relative w-full h-full rounded-[16px] overflow-hidden flex shadow-2xl">
            {/* Left Page (When Two-page Spread) or Main Single Page on Mobile */}
            <div 
              className={`relative flex-1 h-full p-6 sm:p-8 md:p-10 ${style.paperBg} ${style.paperShadow} border-r ${style.pageBorder} flex flex-col justify-between overflow-hidden`}
              style={{
                fontFamily: prefs.fontFamily === 'serif' ? 'Georgia, "Nanum Myeongjo", serif' : 'system-ui, sans-serif',
              }}
            >
              {/* Subtle Paper Texture Lines */}
              <div 
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, ${style.lineColor}, ${style.lineColor} 1px, transparent 1px, transparent 28px)`,
                }}
              />

              {/* Left Page Header */}
              <div className="flex items-center justify-between text-[11px] opacity-60 pb-2 border-b border-black/10">
                <span className="font-serif italic">{story.title}</span>
                <span>Page {currentPageIndex + 1}</span>
              </div>

              {/* Left Page Body Content */}
              <div 
                className={`flex-1 py-4 overflow-y-auto pr-2 space-y-4 text-justify leading-relaxed ${style.textColor}`}
                style={{
                  fontSize: `${prefs.fontSize}px`,
                  lineHeight: prefs.lineHeight,
                }}
              >
                {pages[currentPageIndex] ? (
                  pages[currentPageIndex].map((para, idx) => (
                    <p key={idx} className="indent-4 leading-relaxed">
                      {idx === 0 && currentPageIndex === 0 ? (
                        <span className="float-left text-3xl font-bold font-serif leading-none pr-2 text-amber-600">
                          {para.charAt(0)}
                        </span>
                      ) : null}
                      {idx === 0 && currentPageIndex === 0 ? para.slice(1) : para}
                    </p>
                  ))
                ) : (
                  <p className="opacity-50">끝 페이지입니다.</p>
                )}
              </div>

              {/* Left Page Footer */}
              <div className="flex items-center justify-between text-[10px] opacity-50 pt-2 border-t border-black/10">
                <span>{chapter?.title}</span>
                <span className="font-mono">§ {currentPageIndex + 1}</span>
              </div>
            </div>

            {/* Right Page (Rendered when Two-Page Spread is Active on Tablets/PC) */}
            {prefs.twoPageSpread && (
              <div 
                className={`relative hidden md:flex flex-1 h-full p-6 sm:p-8 md:p-10 ${style.paperBg} ${style.paperShadow} ${style.spineShadow} flex-col justify-between overflow-hidden`}
                style={{
                  fontFamily: prefs.fontFamily === 'serif' ? 'Georgia, "Nanum Myeongjo", serif' : 'system-ui, sans-serif',
                }}
              >
                {/* Paper Texture */}
                <div 
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, ${style.lineColor}, ${style.lineColor} 1px, transparent 1px, transparent 28px)`,
                  }}
                />

                {/* Right Page Header */}
                <div className="flex items-center justify-between text-[11px] opacity-60 pb-2 border-b border-black/10">
                  <span>Page {currentPageIndex + 2}</span>
                  <span className="font-serif italic">{story.author}</span>
                </div>

                {/* Right Page Body Content */}
                <div 
                  className={`flex-1 py-4 overflow-y-auto pr-2 space-y-4 text-justify leading-relaxed ${style.textColor}`}
                  style={{
                    fontSize: `${prefs.fontSize}px`,
                    lineHeight: prefs.lineHeight,
                  }}
                >
                  {pages[currentPageIndex + 1] ? (
                    pages[currentPageIndex + 1].map((para, idx) => (
                      <p key={idx} className="indent-4 leading-relaxed">
                        {para}
                      </p>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <Sparkles className="w-8 h-8 mb-2 text-amber-500" />
                      <p className="text-xs">이 장의 이야기가 끝났습니다.</p>
                      <p className="text-[10px] mt-1">다음 챕터를 열어보세요.</p>
                    </div>
                  )}
                </div>

                {/* Right Page Footer */}
                <div className="flex items-center justify-between text-[10px] opacity-50 pt-2 border-t border-black/10">
                  <span className="font-mono">§ {currentPageIndex + 2}</span>
                  <span>{story.genre}</span>
                </div>
              </div>
            )}

            {/* 3D Realistic Page Curl Turning Overlay Layer */}
            {isFlipping && (
              <div 
                className={`absolute inset-0 ${style.paperBg} z-40 shadow-2xl pointer-events-none origin-left transition-all duration-300 ${
                  flipDirection === 'next' ? 'animate-[pageFlipNext_0.4s_ease-in-out]' : 'animate-[pageFlipPrev_0.4s_ease-in-out]'
                }`}
                style={{
                  boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                }}
              />
            )}
          </div>
        </div>

        {/* Left Page Turn Click Region */}
        <button
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
          className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full glass-panel-light text-white disabled:opacity-0 hover:scale-110 active:scale-95 transition-all shadow-2xl z-30"
          title="이전 페이지 (←)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right Page Turn Click Region */}
        <button
          onClick={handleNextPage}
          disabled={currentPageIndex >= totalPages - (prefs.twoPageSpread ? 2 : 1)}
          className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full glass-panel-light text-white disabled:opacity-0 hover:scale-110 active:scale-95 transition-all shadow-2xl z-30"
          title="다음 페이지 (→)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Bottom Progress Bar & Pagination Indicator */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 py-2 rounded-2xl glass-panel border border-white/10 text-xs text-slate-300 z-20">
        <span className="font-mono text-[11px] text-amber-300">
          {currentPageIndex + 1} {prefs.twoPageSpread ? `- ${Math.min(totalPages, currentPageIndex + 2)}` : ''} / {totalPages} Pages
        </span>

        {/* Progress Slider */}
        <div className="flex-1 mx-4">
          <input
            type="range"
            min="0"
            max={Math.max(0, totalPages - 1)}
            value={currentPageIndex}
            onChange={(e) => {
              setCurrentPageIndex(Number(e.target.value));
              if (prefs.soundEffect) audioEngine.playPageFlip();
            }}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          {Math.round(((currentPageIndex + 1) / totalPages) * 100)}% 완독
        </span>
      </div>
    </div>
  );
};
