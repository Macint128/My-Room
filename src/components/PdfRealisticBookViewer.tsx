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
  Languages,
  MessageSquare
} from 'lucide-react';
import { PdfBook, ReadingPreferences } from '../types.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { pdfReaderEngine, DialogueBlock } from '../utils/pdfReaderEngine.ts';
import { DialogueLocalizationDock } from './DialogueLocalizationDock.tsx';
import { SpeechBubbleOverlay } from './SpeechBubbleOverlay.tsx';
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

  // Automatic Dialogue Localization State
  const [isLocalizationOpen, setIsLocalizationOpen] = useState<boolean>(false);
  const [isLocalizing, setIsLocalizing] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>('ko');
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'translated' | 'original' | 'dual'>('translated');
  const [leftDialogues, setLeftDialogues] = useState<DialogueBlock[]>([]);
  const [rightDialogues, setRightDialogues] = useState<DialogueBlock[]>([]);

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
        setErrorMessage('PDF 도서를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
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

  // Dialogue extraction & localization handler
  const scanAndLocalizePage = async () => {
    if (!pdfDoc) return;
    setIsLocalizing(true);

    try {
      // Extract left / active page dialogues
      const leftRaw = await pdfReaderEngine.extractPageDialogues(pdfDoc, currentPageIndex);
      const leftTranslated = await pdfReaderEngine.translateDialogues(leftRaw, targetLang);
      setLeftDialogues(leftTranslated);

      // If two page spread, also extract right page
      if (prefs.twoPageSpread && currentPageIndex + 1 <= totalPages) {
        const rightRaw = await pdfReaderEngine.extractPageDialogues(pdfDoc, currentPageIndex + 1);
        const rightTranslated = await pdfReaderEngine.translateDialogues(rightRaw, targetLang);
        setRightDialogues(rightTranslated);
      } else {
        setRightDialogues([]);
      }
    } catch (err) {
      console.warn('Localization error:', err);
    } finally {
      setIsLocalizing(false);
    }
  };

  // Re-scan dialogues when page changes if localization dock is open
  useEffect(() => {
    if (isLocalizationOpen && pdfDoc) {
      scanAndLocalizePage();
    }
  }, [currentPageIndex, isLocalizationOpen, targetLang, prefs.twoPageSpread]);

  const handleToggleLocalization = () => {
    const nextState = !isLocalizationOpen;
    setIsLocalizationOpen(nextState);
    if (nextState && pdfDoc) {
      scanAndLocalizePage();
    }
  };

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

  const getPaperStyles = () => {
    switch (prefs.theme) {
      case 'oled-dark':
        return {
          bookCover: 'from-slate-950 via-zinc-950 to-black',
          coverBorder: 'border-zinc-800',
          paperBg: 'bg-black text-slate-100',
          spineShadow: 'shadow-[inset_25px_0_30px_rgba(0,0,0,0.9)]',
          textColor: 'text-slate-200',
        };
      case 'sakura-soft':
        return {
          bookCover: 'from-pink-950 via-rose-900 to-slate-950',
          coverBorder: 'border-pink-500/30',
          paperBg: 'bg-[#fff5f5]',
          spineShadow: 'shadow-[inset_25px_0_30px_rgba(150,50,50,0.1)]',
          textColor: 'text-slate-800',
        };
      case 'parchment':
      default:
        return {
          bookCover: 'from-stone-900 via-amber-950 to-slate-950',
          coverBorder: 'border-amber-700/40',
          paperBg: 'bg-[#f8f4eb]',
          spineShadow: 'shadow-[inset_25px_0_30px_rgba(0,0,0,0.15)]',
          textColor: 'text-stone-900',
        };
    }
  };

  const style = getPaperStyles();
  const allCurrentDialogues = [...leftDialogues, ...rightDialogues];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn">
      {/* 1. Top Snug Flush Connected Floating Toolbar (Zero gaps, Densely Packed) */}
      <div className="absolute top-3 sm:top-4 left-3 right-3 sm:left-6 sm:right-6 max-w-6xl mx-auto flex items-center justify-between z-30 p-1 rounded-2xl bg-slate-950/80 border border-white/20 backdrop-blur-2xl shadow-2xl">
        {/* Left Segment: Back button + Title */}
        <div className="flex items-center divide-x divide-white/10 rounded-xl bg-white/5 border border-white/10 p-0.5 overflow-hidden">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>서재</span>
          </button>
          <div className="px-3 py-1 text-left hidden sm:block">
            <h2 className="text-xs font-bold text-white truncate max-w-[200px] lg:max-w-xs">
              {book.title}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono truncate">{book.author} • {book.vol || 'Volume 1'}</p>
          </div>
        </div>

        {/* Right Segment: Dense Flush Connected Control Group */}
        <div className="flex items-center divide-x divide-white/10 rounded-xl bg-white/5 border border-white/10 p-0.5 overflow-hidden">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setZoomScale((prev) => Math.max(0.8, prev - 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="축소"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-amber-300 px-1 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((prev) => Math.min(2.2, prev + 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="확대"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Two-page Spread Switch */}
          <button
            onClick={() => onUpdatePrefs({ ...prefs, twoPageSpread: !prefs.twoPageSpread })}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 transition-colors"
            title={prefs.twoPageSpread ? '양면 보기 활성화' : '단면 보기 활성화'}
          >
            {prefs.twoPageSpread ? <Columns className="w-3.5 h-3.5 text-amber-300" /> : <Square className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-semibold">{prefs.twoPageSpread ? '양면' : '단면'}</span>
          </button>

          {/* Automatic Dialogue Localization Trigger Capsule */}
          <button
            onClick={handleToggleLocalization}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all ${
              isLocalizationOpen
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                : 'text-amber-300 hover:bg-white/10'
            }`}
            title="자동 대사 로컬라이징 번역 열기"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="text-[10px]">대사 번역</span>
            {isLocalizing && <Loader2 className="w-3 h-3 animate-spin" />}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-1.5 text-xs transition-colors ${
              bookmarkedPages.includes(currentPageIndex)
                ? 'text-amber-300 bg-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="북마크 책갈피"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="서재 테마 설정"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          {/* Full Screen */}
          <button
            onClick={toggleFullScreen}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="전체화면"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
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

      {/* 3. Main Realistic Book Surface Container */}
      <div className="relative w-full max-w-6xl h-[80vh] sm:h-[84vh] flex items-center justify-center pt-8 pb-10 select-none">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-sm font-semibold">도서 로딩 중...</p>
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
            className={`relative w-full h-full rounded-3xl bg-gradient-to-br ${style.bookCover} p-3 sm:p-4 border-2 ${style.coverBorder} shadow-2xl flex flex-col justify-between transition-all duration-500 overflow-hidden`}
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
                  {/* Left Page with Speech Bubble Overlay */}
                  <div className={`relative flex-1 h-full ${style.paperBg} flex items-center justify-center p-3 sm:p-6 overflow-auto border-r border-black/10 shadow-[inset_-15px_0_20px_rgba(0,0,0,0.06)]`}>
                    <canvas ref={leftCanvasRef} className="max-h-full max-w-full object-contain rounded shadow-sm" />
                    {isLocalizationOpen && showOverlay && (
                      <SpeechBubbleOverlay
                        dialogues={leftDialogues}
                        displayMode={displayMode}
                        targetLang={targetLang}
                      />
                    )}
                    <div className="absolute bottom-2 left-6 text-[10px] font-mono text-slate-500">
                      Page {currentPageIndex}
                    </div>
                  </div>

                  {/* Center Spine Crease */}
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-10 pointer-events-none bg-gradient-to-r from-black/20 via-black/40 to-black/20 shadow-lg" />

                  {/* Right Page with Speech Bubble Overlay */}
                  <div className={`relative flex-1 h-full ${style.paperBg} flex items-center justify-center p-3 sm:p-6 overflow-auto shadow-[inset_15px_0_20px_rgba(0,0,0,0.06)]`}>
                    {currentPageIndex + 1 <= totalPages ? (
                      <>
                        <canvas ref={rightCanvasRef} className="max-h-full max-w-full object-contain rounded shadow-sm" />
                        {isLocalizationOpen && showOverlay && (
                          <SpeechBubbleOverlay
                            dialogues={rightDialogues}
                            displayMode={displayMode}
                            targetLang={targetLang}
                          />
                        )}
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
                  {isLocalizationOpen && showOverlay && (
                    <SpeechBubbleOverlay
                      dialogues={leftDialogues}
                      displayMode={displayMode}
                      targetLang={targetLang}
                    />
                  )}
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

            {/* Bottom Book Navigation Bar (Snugly packed connected control bar) */}
            <div className="relative z-20 flex items-center justify-between pt-2.5 px-2 text-xs">
              <div className="flex items-center divide-x divide-white/10 rounded-xl bg-slate-900/90 border border-white/15 p-0.5 overflow-hidden">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndex <= 1 || isFlipping}
                  className="flex items-center gap-1 px-3 py-1.5 text-white font-semibold hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>이전 장</span>
                </button>
              </div>

              {/* Progress Slider capsule */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-white/15">
                <input
                  type="range"
                  min="1"
                  max={totalPages || 1}
                  value={currentPageIndex}
                  onChange={(e) => {
                    setCurrentPageIndex(Number(e.target.value));
                    if (prefs.soundEffect) audioEngine.playPageFlip();
                  }}
                  className="w-24 sm:w-48 h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="font-mono text-amber-300 text-[11px] min-w-[65px] text-right">
                  {currentPageIndex} / {totalPages} p
                </span>
              </div>

              <div className="flex items-center divide-x divide-white/10 rounded-xl bg-slate-900/90 border border-white/15 p-0.5 overflow-hidden">
                <button
                  onClick={handleNextPage}
                  disabled={currentPageIndex >= totalPages || isFlipping}
                  className="flex items-center gap-1 px-3 py-1.5 text-white font-semibold hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <span>다음 장</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Automatic Dialogue Localization Dock (Floating Subtitle & Script Reader Bar) */}
      <DialogueLocalizationDock
        isOpen={isLocalizationOpen}
        onClose={() => setIsLocalizationOpen(false)}
        dialogues={allCurrentDialogues}
        isLoading={isLocalizing}
        currentPage={currentPageIndex}
        totalPages={totalPages}
        targetLang={targetLang}
        onChangeTargetLang={setTargetLang}
        showOverlay={showOverlay}
        onToggleOverlay={() => setShowOverlay(!showOverlay)}
        displayMode={displayMode}
        onChangeDisplayMode={setDisplayMode}
        onRescan={scanAndLocalizePage}
      />
    </div>
  );
};
