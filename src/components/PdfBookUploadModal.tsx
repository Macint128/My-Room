import React, { useState } from 'react';
import { 
  Upload, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  Loader2, 
  X, 
  Sparkles,
  Globe,
  Search,
  PlusCircle,
  Link,
  RefreshCw
} from 'lucide-react';
import { BookCategory, PdfBook } from '../types.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { pdfReaderEngine } from '../utils/pdfReaderEngine.ts';

interface PdfBookUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (book: PdfBook) => void;
}

interface InternetCoverResult {
  id: string;
  title: string;
  author?: string;
  coverUrl: string;
  source: string;
}

export const PdfBookUploadModal: React.FC<PdfBookUploadModalProps> = ({
  isOpen,
  onClose,
  onBookAdded,
}) => {
  const [category, setCategory] = useState<BookCategory>('snovel');
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [vol, setVol] = useState<string>('Volume 1');
  const [genre, setGenre] = useState<string>('판타지 / 힐링');
  const [description, setDescription] = useState<string>('');
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string>('');
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [detectedPageCount, setDetectedPageCount] = useState<number | null>(null);

  // Internet Cover Search State
  const [coverSearchQuery, setCoverSearchQuery] = useState<string>('');
  const [isSearchingCovers, setIsSearchingCovers] = useState<boolean>(false);
  const [internetCovers, setInternetCovers] = useState<InternetCoverResult[]>([]);
  const [isCoverGalleryOpen, setIsCoverGalleryOpen] = useState<boolean>(false);

  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Search covers on the internet via Apple Books, Google Books, and Open Library
  const searchInternetCovers = async (customQuery?: string) => {
    const q = (customQuery || coverSearchQuery || title).trim();
    if (!q) return;

    setIsSearchingCovers(true);
    setError(null);
    setIsCoverGalleryOpen(true);

    try {
      const res = await fetch(`/api/covers/search?query=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setInternetCovers([]);
        return;
      }
      const rawText = await res.text();
      let data: any = {};
      try {
        if (rawText && (rawText.startsWith('{') || rawText.startsWith('['))) {
          data = JSON.parse(rawText);
        }
      } catch (parseErr) {
        console.warn('Covers search parse error:', parseErr);
      }
      if (data.results && Array.isArray(data.results)) {
        setInternetCovers(data.results);
      } else {
        setInternetCovers([]);
      }
    } catch (err) {
      console.error('Failed to search covers:', err);
      setInternetCovers([]);
    } finally {
      setIsSearchingCovers(false);
    }
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setError('PDF 형식의 파일만 등록할 수 있습니다.');
        return;
      }
      setPdfFile(file);
      setError(null);
      setIsProcessingPdf(true);

      const rawFileName = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ');
      const nextTitle = title || rawFileName;
      if (!title) {
        setTitle(rawFileName);
        setCoverSearchQuery(rawFileName);
      }

      // Convert to ArrayBuffer for PDF.js and Base64 for storage
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Auto-extract Cover from Page 1 of the PDF
        try {
          const { coverBase64: autoCover, numPages, title: metaTitle, author: metaAuthor } = 
            await pdfReaderEngine.extractCoverImageFromPdf(arrayBuffer, 1.8);
          
          if (!selectedCoverUrl) {
            setCoverBase64(autoCover);
          }
          setDetectedPageCount(numPages);
          
          if (metaTitle && metaTitle.trim()) {
            setTitle(metaTitle.trim());
            setCoverSearchQuery(metaTitle.trim());
          }
          if (metaAuthor && metaAuthor.trim() && !author) {
            setAuthor(metaAuthor.trim());
          }
        } catch (coverErr) {
          console.warn('Could not auto-extract cover from PDF:', coverErr);
        }

        const reader = new FileReader();
        reader.onload = () => {
          setPdfBase64(reader.result as string);
          setIsProcessingPdf(false);
          // Automatically trigger internet cover search in background for best quality cover!
          searchInternetCovers(nextTitle);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('PDF file read error:', err);
        setError('PDF 파일을 읽는 도중 오류가 발생했습니다.');
        setIsProcessingPdf(false);
      }
    }
  };

  const handleSelectInternetCover = (cover: InternetCoverResult) => {
    setSelectedCoverUrl(cover.coverUrl);
    setCoverBase64(null); // Use the direct URL
    audioEngine.playUiClick();
  };

  const handleDirectCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverBase64(reader.result as string);
        setSelectedCoverUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfBase64) {
      setError('PDF 파일을 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      setError('도서 제목을 입력해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const safeId = `Book_${Date.now()}`;

    try {
      const response = await fetch('/api/books/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: category,
          folderId: safeId,
          title: title.trim(),
          author: author.trim() || '알 수 없는 작가',
          vol: vol.trim() || 'Volume 1',
          genre: genre.trim() || '라이트노벨 / 만화',
          description: description.trim() || (detectedPageCount ? `총 ${detectedPageCount}페이지 도서` : '내 보관함 도서'),
          pdfBase64,
          coverBase64: selectedCoverUrl ? undefined : (coverBase64 || undefined),
          coverUrl: selectedCoverUrl || undefined,
        }),
      });

      const rawText = await response.text();
      let data: any = {};
      try {
        if (rawText && (rawText.startsWith('{') || rawText.startsWith('['))) {
          data = JSON.parse(rawText);
        }
      } catch (parseErr) {
        console.warn('Upload parse error:', parseErr);
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || '보관함 등록에 실패했습니다. (서버 응답 오류)');
      }

      // If user selected an internet cover URL, override coverPath
      const finalBook: PdfBook = {
        ...data.book,
        genre: genre.trim(),
        coverPath: selectedCoverUrl || data.book.coverPath,
      };

      audioEngine.playPageFlip();
      onBookAdded(finalBook);
      onClose();
    } catch (err: any) {
      console.error('Upload book error:', err);
      setError(err.message || '보관함 등록 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const activeDisplayCover = selectedCoverUrl || coverBase64;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-slate-900/95 border border-white/20 backdrop-blur-2xl shadow-2xl space-y-5 animate-scaleUp text-white scrollbar-thin">
        {/* iTunes Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-amber-300/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-lg">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">보관함에 도서 추가</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  iTunes Library
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PDF 도서를 내 서재에 보관하고, 인터넷에서 고화질 공식 표지를 찾아 매칭합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">보관함 카테고리</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('snovel')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  category === 'snovel'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md scale-[1.01]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>라이트노벨 보관함</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('manga')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  category === 'manga'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md scale-[1.01]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>만화 / 웹툰 보관함</span>
              </button>
            </div>
          </div>

          {/* PDF File Picker (Drag & Drop) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              도서 파일 선택 (PDF) <span className="text-amber-400">*</span>
            </label>
            <div className="relative border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-white/5 hover:bg-white/10">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {isProcessingPdf ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin mb-1" />
                  <p className="text-xs text-amber-200 font-semibold">도서 파일 분석 & 인터넷 표지 탐색 중...</p>
                </div>
              ) : pdfFile ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="truncate max-w-sm">{pdfFile.name}</span>
                  {detectedPageCount && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300 font-mono">
                      총 {detectedPageCount}페이지
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 mx-auto text-amber-300 mb-1.5" />
                  <p className="text-xs text-slate-200 font-semibold">
                    클릭하여 PDF를 선택하거나 여기에 끌어다 놓으세요
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    iTunes처럼 편리하게 서재에 보관하고 언제든 3D 책 넘김으로 읽을 수 있습니다.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Book Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                도서 제목 <span className="text-amber-400">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setCoverSearchQuery(e.target.value);
                  }}
                  placeholder="예: 전생했더니 슬라임이었던 건에 대하여"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => searchInternetCovers()}
                  disabled={!title.trim() || isSearchingCovers}
                  className="px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all flex items-center gap-1 shrink-0 disabled:opacity-40"
                  title="인터넷에서 표지 검색"
                >
                  {isSearchingCovers ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>표지 검색</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">작가명</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: Fuse, 야마다 카네히토"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Volume & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">권수 / 챕터</label>
              <input
                type="text"
                value={vol}
                onChange={(e) => setVol(e.target.value)}
                placeholder="예: Volume 1 또는 Chapter 1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">장르 / 카테고리</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="예: 판타지, 일상, 코미디, SF"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Cover Section: Current Selected Cover Preview & Internet Cover Search Results */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-white">표지 아트워크 (인터넷 검색 & 선택)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] text-slate-300 cursor-pointer transition-colors border border-white/15">
                  <span>내 사진 파일</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDirectCoverFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Currently Active Cover Display */}
            {activeDisplayCover ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <img
                  src={activeDisplayCover}
                  alt="Selected Cover"
                  className="w-12 h-16 rounded-lg object-cover border border-white/20 shadow-md shrink-0 bg-slate-950"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = `/api/books/cover-svg?title=${encodeURIComponent(title || 'Book')}&author=${encodeURIComponent(author || '')}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedCoverUrl ? '인터넷 고화질 표지 적용됨' : '표지 이미지 준비됨'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    {selectedCoverUrl || '파일에서 추출된 표지가 서재에 표시됩니다.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-slate-400">
                인터넷에서 책 표지를 검색하거나 PDF 파일을 등록하세요.
              </div>
            )}

            {/* Internet Search Controls */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={coverSearchQuery}
                  onChange={(e) => setCoverSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchInternetCovers();
                    }
                  }}
                  placeholder="인터넷 표지 검색어 (예: 귀멸의 칼날, 원피스, 나루토)..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => searchInternetCovers()}
                disabled={isSearchingCovers}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all flex items-center gap-1 shrink-0"
              >
                {isSearchingCovers ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>검색</span>
              </button>
            </div>

            {/* Internet Covers Gallery (Grid) */}
            {isCoverGalleryOpen && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span>인터넷 검색 결과 (클릭하여 표지로 적용)</span>
                  <span className="text-[10px] text-slate-400 font-mono">{internetCovers.length}개 발견</span>
                </div>

                {isSearchingCovers ? (
                  <div className="py-8 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Apple Books 및 인터넷에서 고화질 표지를 찾는 중...</span>
                  </div>
                ) : internetCovers.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                    {internetCovers.map((item) => {
                      const isSelected = selectedCoverUrl === item.coverUrl;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectInternetCover(item)}
                          className={`relative group rounded-xl overflow-hidden border transition-all text-left flex flex-col ${
                            isSelected 
                              ? 'ring-2 ring-amber-400 border-transparent shadow-lg scale-95' 
                              : 'border-white/10 hover:border-amber-400/60 hover:scale-105'
                          }`}
                        >
                          <div className="aspect-[3/4] w-full bg-slate-950 relative overflow-hidden">
                            <img
                              src={item.coverUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                                <div className="p-1 rounded-full bg-amber-400 text-slate-950 font-bold">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-1 bg-slate-900/90 text-[9px] truncate">
                            <span className="text-white font-medium block truncate">{item.title}</span>
                            <span className="text-slate-400 block truncate">{item.source}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    검색 결과가 없습니다. 검색어를 변경해보세요.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">작품 소개 / 메모</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="작품의 줄거리나 감상 포인트를 기록해보세요."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading || isProcessingPdf}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>보관함에 저장 중...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>iTunes 스타일 보관함에 추가</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
