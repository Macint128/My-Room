import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Scroll, 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  Loader2, 
  Volume2, 
  VolumeX,
  Languages,
  Sparkles
} from 'lucide-react';
import { PdfBook } from '../types.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { pdfReaderEngine, DialogueBlock } from '../utils/pdfReaderEngine.ts';
import { DialogueLocalizationDock } from './DialogueLocalizationDock.tsx';
import { SpeechBubbleOverlay } from './SpeechBubbleOverlay.tsx';
import type * as pdfjsLib from 'pdfjs-dist';

interface PdfMangaViewerProps {
  book: PdfBook;
  onClose: () => void;
}

export const PdfMangaViewer: React.FC<PdfMangaViewerProps> = ({ book, onClose }) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [readingMode, setReadingMode] = useState<'webtoon' | 'page_flip'>('page_flip');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.4);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Automatic Dialogue Localization State
  const [isLocalizationOpen, setIsLocalizationOpen] = useState<boolean>(false);
  const [isLocalizing, setIsLocalizing] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>('ko');
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'translated' | 'original' | 'dual'>('translated');
  const [dialogues, setDialogues] = useState<DialogueBlock[]>([]);

  const flipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webtoonContainerRef = useRef<HTMLDivElement | null>(null);

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
        setCurrentPage(1);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load Manga PDF:', err);
        setErrorMessage('만화 PDF를 불러오는 데 실패했습니다. 다시 시도해주세요.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [book.pdfPath]);

  // Dialogue extraction & localization handler
  const scanAndLocalizePage = async () => {
    if (!pdfDoc) return;
    setIsLocalizing(true);

    try {
      const raw = await pdfReaderEngine.extractPageDialogues(pdfDoc, currentPage);
      const translated = await pdfReaderEngine.translateDialogues(raw, targetLang);
      setDialogues(translated);
    } catch (err) {
      console.warn('Manga localization notice:', err);
    } finally {
      setIsLocalizing(false);
    }
  };

  useEffect(() => {
    if (isLocalizationOpen && pdfDoc) {
      scanAndLocalizePage();
    }
  }, [currentPage, isLocalizationOpen, targetLang]);

  const handleToggleLocalization = () => {
    const next = !isLocalizationOpen;
    setIsLocalizationOpen(next);
    if (next && pdfDoc) {
      scanAndLocalizePage();
    }
  };

  // Render Page in Flip Mode
  useEffect(() => {
    if (!pdfDoc || readingMode !== 'page_flip' || !flipCanvasRef.current || isLoading) return;
    pdfReaderEngine.renderPageToCanvas(pdfDoc, currentPage, flipCanvasRef.current, zoomScale);
  }, [pdfDoc, currentPage, readingMode, zoomScale, isLoading]);

  // Render All Pages in Webtoon Scroll Mode
  useEffect(() => {
    if (!pdfDoc || readingMode !== 'webtoon' || !webtoonContainerRef.current || isLoading) return;

    const container = webtoonContainerRef.current;
    container.innerHTML = '';

    const renderAllWebtoonPages = async () => {
      for (let p = 1; p <= pdfDoc.numPages; p++) {
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'relative flex flex-col items-center justify-center mb-6 shadow-2xl rounded-2xl overflow-hidden bg-slate-900/90 border border-white/10';
        
        const canvas = document.createElement('canvas');
        canvas.className = 'max-w-full h-auto object-contain';
        pageWrapper.appendChild(canvas);

        const pageLabel = document.createElement('div');
        pageLabel.className = 'w-full text-center py-2 bg-slate-950/80 text-[11px] font-mono text-emerald-400 border-t border-white/5';
        pageLabel.innerText = `PAGE ${p} / ${pdfDoc.numPages}`;
        pageWrapper.appendChild(pageLabel);

        container.appendChild(pageWrapper);

        await pdfReaderEngine.renderPageToCanvas(pdfDoc, p, canvas, zoomScale);
      }
    };

    renderAllWebtoonPages();
  }, [pdfDoc, readingMode, zoomScale, isLoading]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      if (soundEnabled) audioEngine.playPageFlip();
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      if (soundEnabled) audioEngine.playPageFlip();
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readingMode === 'page_flip') {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          handleNextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          handlePrevPage();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, readingMode, soundEnabled]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-2xl animate-fadeIn text-white">
      {/* 1. Header Toolbar (Snugly connected flush controls, zero gaps) */}
      <div className="w-full px-3 sm:px-6 py-2 flex items-center justify-between bg-slate-900/90 border-b border-white/15 shadow-xl z-30">
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
            <h2 className="text-xs font-bold text-white truncate max-w-[200px] lg:max-w-md">
              {book.title}
            </h2>
            <p className="text-[10px] text-emerald-400 font-mono truncate">{book.vol || '단행본'} • {book.author}</p>
          </div>
        </div>

        {/* Right Segment: Flush Connected Tool Group */}
        <div className="flex items-center divide-x divide-white/10 rounded-xl bg-white/5 border border-white/10 p-0.5 overflow-hidden">
          {/* Mode Switch: Webtoon Scroll vs Page Flip */}
          <div className="flex items-center">
            <button
              onClick={() => setReadingMode('page_flip')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all ${
                readingMode === 'page_flip'
                  ? 'bg-emerald-500/30 text-emerald-200'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="페이지 넘김 모드"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">넘김</span>
            </button>
            <button
              onClick={() => setReadingMode('webtoon')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all ${
                readingMode === 'webtoon'
                  ? 'bg-emerald-500/30 text-emerald-200'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="웹툰 스크롤 모드"
            >
              <Scroll className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10px]">스크롤</span>
            </button>
          </div>

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

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={() => setZoomScale((prev) => Math.max(0.8, prev - 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="축소"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-emerald-300 px-1 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((prev) => Math.min(2.4, prev + 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="확대"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="효과음 토글"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
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

      {/* 2. Main Manga Viewport */}
      <div className="flex-1 w-full flex items-center justify-center overflow-auto p-2 sm:p-4 relative min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm font-semibold">만화 로딩 중...</p>
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
        ) : readingMode === 'page_flip' ? (
          /* Page Flip View with Speech Bubble Overlay */
          <div className="relative flex flex-col items-center justify-center max-h-full max-w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/15 p-1 flex items-center justify-center">
              <canvas ref={flipCanvasRef} className="max-h-[75vh] max-w-full object-contain rounded-xl" />
              {isLocalizationOpen && showOverlay && (
                <SpeechBubbleOverlay
                  dialogues={dialogues}
                  displayMode={displayMode}
                  targetLang={targetLang}
                />
              )}
            </div>

            {/* Click zones for flipping */}
            <div 
              onClick={handlePrevPage}
              className="absolute left-0 top-0 bottom-0 w-1/4 cursor-w-resize hover:bg-white/5 transition-colors flex items-center justify-start pl-4"
              title="이전 페이지"
            >
              <div className="p-2 rounded-full bg-black/40 text-white/60 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity">
                <ChevronLeft className="w-6 h-6" />
              </div>
            </div>
            <div 
              onClick={handleNextPage}
              className="absolute right-0 top-0 bottom-0 w-1/4 cursor-e-resize hover:bg-white/5 transition-colors flex items-center justify-end pr-4"
              title="다음 페이지"
            >
              <div className="p-2 rounded-full bg-black/40 text-white/60 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        ) : (
          /* Webtoon Continuous Scroll View */
          <div ref={webtoonContainerRef} className="w-full max-w-2xl mx-auto py-6" />
        )}
      </div>

      {/* 3. Bottom Manga Control Bar (Snug connected controls) */}
      {readingMode === 'page_flip' && !isLoading && (
        <div className="w-full px-4 sm:px-6 py-2.5 bg-slate-900/90 border-t border-white/15 flex items-center justify-between z-30">
          <div className="flex items-center divide-x divide-white/10 rounded-xl bg-slate-950 border border-white/15 p-0.5 overflow-hidden">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-white font-semibold text-xs hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>이전</span>
            </button>
          </div>

          {/* Slider & Page Marker */}
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-950 border border-white/15">
            <input
              type="range"
              min="1"
              max={totalPages || 1}
              value={currentPage}
              onChange={(e) => {
                setCurrentPage(Number(e.target.value));
                if (soundEnabled) audioEngine.playPageFlip();
              }}
              className="w-28 sm:w-60 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="font-mono text-emerald-300 text-xs min-w-[65px] text-right font-bold">
              {currentPage} / {totalPages}
            </span>
          </div>

          <div className="flex items-center divide-x divide-white/10 rounded-xl bg-slate-950 border border-white/15 p-0.5 overflow-hidden">
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-white font-semibold text-xs hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <span>다음</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Automatic Dialogue Localization Dock */}
      <DialogueLocalizationDock
        isOpen={isLocalizationOpen}
        onClose={() => setIsLocalizationOpen(false)}
        dialogues={dialogues}
        isLoading={isLocalizing}
        currentPage={currentPage}
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
