import React, { useState, useEffect, useRef } from 'react';
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
  Square,
  Loader2,
  ZoomIn,
  ZoomOut,
  FolderOpen
} from 'lucide-react';
import { PdfBook, ReadingPreferences } from '../types.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { pdfReaderEngine } from '../utils/pdfReaderEngine.ts';
import type * as pdfjsLib from 'pdfjs-dist';

interface PdfRealisticBookViewerProps {
  book: PdfBook;
  onClose: () => void;
  prefs: ReadingPreferences;
  onUpdatePrefs: (prefs: ReadingPreferences) => void;
}

export const PdfRealisticBookViewer: React.FC<PdfRealisticBookViewerProps> = ({
  book,
  onClose,
  prefs,
  onUpdatePrefs,
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1); // 1-indexed
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [zoomScale, setZoomScale] = useState<number>(1.2);

  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    pdfReaderEngine.loadPdf(book.pdfPath)
      .then((doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPageIndex(1);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load PDF book:', err);
        setErrorMessage(`PDF를 불러오는 중 오류가 발생했습니다 (${book.pdfPath}). 파일 경로를 확인해주세요.`);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [book.pdfPath]);

  // Render Page(s) when pageIndex, zoom, or spread mode changes
  useEffect(() => {
    if (!pdfDoc || isLoading) return;

    if (prefs.twoPageSpread) {
      // Left Page (currentPageIndex)
      if (leftCanvasRef.current && currentPageIndex <= totalPages) {
        pdfReaderEngine.renderPageToCanvas(pdfDoc, currentPageIndex, leftCanvasRef.current, zoomScale);
      }
      // Right Page (currentPageIndex + 1)
      if (rightCanvasRef.current) {
        if (currentPageIndex + 1 <= totalPages) {
          pdfReaderEngine.renderPageToCanvas(pdfDoc, currentPageIndex + 1, rightCanvasRef.current, zoomScale);
        } else {
          // Clear right canvas if last page is odd
          const ctx = rightCanvasRef.current.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#f8f5ee';
            ctx.fillRect(0, 0, rightCanvasRef.current.width, rightCanvasRef.current.height);
          }
        }
      }
    } else {
      // Single Page
      if (singleCanvasRef.current && currentPageIndex <= totalPages) {
        pdfReaderEngine.renderPageToCanvas(pdfDoc, currentPageIndex, singleCanvasRef.current, zoomScale);
      }
    }
  }, [pdfDoc, currentPageIndex, prefs.twoPageSpread, zoomScale, isLoading, totalPages]);

  const handleNextPage = () => {
    const step = prefs.twoPageSpread ? 2 : 1;
    if (currentPageIndex + step <= totalPages + (prefs.twoPageSpread ? 1 : 0) && !isFlipping) {
      if (prefs.soundEffect) audioEngine.playPageFlip();
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex((prev) => Math.min(totalPages, prev + step));
        setIsFlipping(false);
      }, 350);
    }
  };

  const handlePrevPage = () => {
    const step = prefs.twoPageSpread ? 2 : 1;
    if (currentPageIndex > 1 && !isFlipping) {
      if (prefs.soundEffect) audioEngine.playPageFlip();
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex((prev) => Math.max(1, prev - step));
        setIsFlipping(false);
      }, 350);
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
  }, [currentPageIndex, totalPages, isFlipping, prefs.twoPageSpread]);

  const toggleBookmark = () => {
    if (bookmarkedPages.includes(currentPageIndex)) {
      setBookmarkedPages(bookmarkedPages.filter((p) => p !== currentPageIndex));
    } else {
      setBookmarkedPages([...bookmarkedPages, currentPageIndex]);
      if (prefs.soundEffect) audioEngine.playSingingBowl(528, 1.5);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  // Get paper style colors
  const getPaperStyles = () => {
    switch (prefs.theme) {
      case 'parchment':
        return {
          bookCover: 'from-[#382212] via-[#24150a] to-[#140b05]',
          coverBorder: 'border-[#5c3717]/80',
          paperBg: 'bg-[#fbf7ee]',
          spineShadow: 'shadow-[inset_25px_0_35px_rgba(0,0,0,0.18)]',
          textColor: 'text-[#2a1e12]',
        };
      case 'oled-dark':
        return {
          bookCover: 'from-[#1a1726] via-[#100e1a] to-[#07060d]',
          coverBorder: 'border-purple-950/60',
          paperBg: 'bg-[#0f111a]',
          spineShadow: 'shadow-[inset_25px_0_35px_rgba(0,0,0,0.7)]',
          textColor: 'text-slate-200',
        };
      case 'sakura-soft':
        return {
          bookCover: 'from-[#421220] via-[#2c0b15] to-[#18040a]',
          coverBorder: 'border-pink-900/60',
          paperBg: 'bg-[#fff5f7]',
          spineShadow: 'shadow-[inset_25px_0_35px_rgba(190,24,93,0.15)]',
          textColor: 'text-[#470b1b]',
        };
      default:
        return {
          bookCover: 'from-slate-900 via-sky-950 to-slate-950',
          coverBorder: 'border-sky-500/30',
          paperBg: 'bg-slate-900/95',
          spineShadow: 'shadow-[inset_25px_0_30px_rgba(0,0,0,0.5)]',
          textColor: 'text-slate-100',
        };
    }
  };

  const style = getPaperStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      {/* 1. Top Glass Floating Toolbar */}
      <div className="absolute top-3 sm:top-5 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between z-30 px-4 py-2.5 rounded-2xl bg-slate-950/70 border border-white/15 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>서재로 나가기</span>
          </button>
          <div className="hidden sm:block min-w-0">
            <h2 className="text-sm font-bold text-white truncate max-w-[280px]">
              {book.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{book.author}</span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">{book.pdfPath}</span>
            </div>
          </div>
        </div>

        {/* Right Tools: Page Jump, Zoom, Spread mode, Preferences, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
            <button
              onClick={() => setZoomScale((prev) => Math.max(0.8, prev - 0.2))}
              className="p-1 text-slate-300 hover:text-white"
              title="축소"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-amber-300 w-10 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((prev) => Math.min(2.2, prev + 0.2))}
              className="p-1 text-slate-300 hover:text-white"
              title="확대"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Two-page Spread Switch */}
          <button
            onClick={() => onUpdatePrefs({ ...prefs, twoPageSpread: !prefs.twoPageSpread })}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-slate-200"
            title={prefs.twoPageSpread ? '양면 보기 활성화됨' : '단면 보기 활성화됨'}
          >
            {prefs.twoPageSpread ? <Columns className="w-3.5 h-3.5 text-amber-300" /> : <Square className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{prefs.twoPageSpread ? '양면' : '단면'}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl border transition-all ${
              bookmarkedPages.includes(currentPageIndex)
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
            title="현재 페이지 북마크 책갈피 꽂기"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 transition-all"
            title="독서 테마 및 설정"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Full Screen */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 transition-all"
            title="전체화면"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Theme Settings Popover */}
      {showSettings && (
        <div className="absolute top-16 right-4 sm:right-10 z-40 w-72 rounded-3xl p-5 bg-slate-900/95 border border-white/20 backdrop-blur-2xl shadow-2xl space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-white">3D PDF 서재 설정</span>
            <button onClick={() => setShowSettings(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
          </div>

          {/* Paper Theme */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-2">종이 질감 테마</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdatePrefs({ ...prefs, theme: 'parchment' })}
                className={`px-3 py-2 rounded-xl border text-xs font-medium ${
                  prefs.theme === 'parchment' ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                📜 클래식 양피지
              </button>
              <button
                onClick={() => onUpdatePrefs({ ...prefs, theme: 'oled-dark' })}
                className={`px-3 py-2 rounded-xl border text-xs font-medium ${
                  prefs.theme === 'oled-dark' ? 'bg-purple-500/20 border-purple-400 text-purple-200' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                🌙 다크 OLED
              </button>
              <button
                onClick={() => onUpdatePrefs({ ...prefs, theme: 'sakura-soft' })}
                className={`px-3 py-2 rounded-xl border text-xs font-medium ${
                  prefs.theme === 'sakura-soft' ? 'bg-pink-500/20 border-pink-400 text-pink-200' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                🌸 사쿠라 핑크
              </button>
              <button
                onClick={() => onUpdatePrefs({ ...prefs, theme: 'frost-glass' })}
                className={`px-3 py-2 rounded-xl border text-xs font-medium ${
                  prefs.theme === 'frost-glass' ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                ❄️ 프로스트 글래스
              </button>
            </div>
          </div>

          {/* Sound toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs text-slate-300">책장 넘김 사운드</span>
            <button
              onClick={() => onUpdatePrefs({ ...prefs, soundEffect: !prefs.soundEffect })}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                prefs.soundEffect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-slate-400'
              }`}
            >
              {prefs.soundEffect ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Realistic Book Surface Container with 3D Spine and Leather Bound Texture */}
      <div className="relative w-full max-w-6xl h-[80vh] sm:h-[84vh] flex items-center justify-center pt-8 pb-10 select-none">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-sm font-semibold">PDF 도서 로딩 중... ({book.pdfPath})</p>
          </div>
        ) : errorMessage ? (
          <div className="p-6 rounded-3xl bg-red-950/60 border border-red-500/30 text-center max-w-md">
            <p className="text-sm font-bold text-red-300 mb-2">{errorMessage}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white mt-3"
            >
              닫기
            </button>
          </div>
        ) : (
          <div 
            className={`relative w-full h-full rounded-3xl bg-gradient-to-br ${style.bookCover} p-3 sm:p-5 border-2 ${style.coverBorder} shadow-2xl flex flex-col justify-between transition-all duration-500 overflow-hidden`}
            style={{
              boxShadow: '0 25px 70px -15px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.15)',
            }}
          >
            {/* Satin Red Bookmark Ribbon Hanging from Top */}
            <div 
              className={`absolute top-0 right-16 w-5 h-20 bg-gradient-to-b from-rose-600 via-rose-700 to-rose-900 shadow-lg z-20 transition-all duration-300 ${
                bookmarkedPages.includes(currentPageIndex) ? 'h-24 opacity-100' : 'h-8 opacity-40 hover:h-12'
              }`}
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)',
              }}
            />

            {/* Inner Paper Spreads */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center rounded-2xl overflow-hidden shadow-inner">
              {prefs.twoPageSpread ? (
                /* Two-Page Spread Layout */
                <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center bg-black/20 rounded-2xl overflow-hidden">
                  {/* Left Page */}
                  <div className={`relative flex-1 h-full ${style.paperBg} flex items-center justify-center p-3 sm:p-6 overflow-auto border-r border-black/10 shadow-[inset_-15px_0_20px_rgba(0,0,0,0.06)]`}>
                    <canvas ref={leftCanvasRef} className="max-h-full max-w-full object-contain rounded shadow-sm" />
                    <div className="absolute bottom-2 left-6 text-[10px] font-mono text-slate-500">
                      Page {currentPageIndex}
                    </div>
                  </div>

                  {/* Center Realistic Book Spine Crease & Shadow */}
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-10 pointer-events-none bg-gradient-to-r from-black/20 via-black/40 to-black/20 shadow-lg" />

                  {/* Right Page */}
                  <div className={`relative flex-1 h-full ${style.paperBg} flex items-center justify-center p-3 sm:p-6 overflow-auto shadow-[inset_15px_0_20px_rgba(0,0,0,0.06)]`}>
                    {currentPageIndex + 1 <= totalPages ? (
                      <>
                        <canvas ref={rightCanvasRef} className="max-h-full max-w-full object-contain rounded shadow-sm" />
                        <div className="absolute bottom-2 right-6 text-[10px] font-mono text-slate-500">
                          Page {currentPageIndex + 1}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                        <span className="text-xs font-semibold">도서의 마지막 장입니다</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Single Page Layout */
                <div className={`relative w-full h-full ${style.paperBg} flex items-center justify-center p-4 sm:p-8 overflow-auto`}>
                  <canvas ref={singleCanvasRef} className="max-h-full max-w-full object-contain rounded shadow-md" />
                  <div className="absolute bottom-3 right-6 text-[10px] font-mono text-slate-500">
                    Page {currentPageIndex} / {totalPages}
                  </div>
                </div>
              )}

              {/* 3D Page Turn Animation Effect Overlay */}
              {isFlipping && (
                <div 
                  className={`absolute inset-0 z-30 pointer-events-none transition-all duration-300 bg-gradient-to-r ${
                    flipDirection === 'next' 
                      ? 'from-transparent via-white/15 to-black/25 animate-curlNext' 
                      : 'from-black/25 via-white/15 to-transparent animate-curlPrev'
                  }`}
                />
              )}
            </div>

            {/* Bottom Book Navigation Bar */}
            <div className="relative z-20 flex items-center justify-between pt-3 px-2 text-xs">
              <button
                onClick={handlePrevPage}
                disabled={currentPageIndex <= 1 || isFlipping}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white font-semibold transition-all hover:scale-105"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 장</span>
              </button>

              {/* Progress Slider */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max={totalPages || 1}
                  value={currentPageIndex}
                  onChange={(e) => {
                    setCurrentPageIndex(Number(e.target.value));
                    if (prefs.soundEffect) audioEngine.playPageFlip();
                  }}
                  className="w-32 sm:w-56 h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="font-mono text-amber-300 text-xs min-w-[70px] text-right">
                  {currentPageIndex} / {totalPages} p
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPageIndex >= totalPages || isFlipping}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white font-semibold transition-all hover:scale-105"
              >
                <span>다음 장</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
