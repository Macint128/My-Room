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
  FolderPlus,
  Layers
} from 'lucide-react';
import { BookCategory, PdfBook } from '../types.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { pdfReaderEngine } from '../utils/pdfReaderEngine.ts';

interface PdfBookUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (book: PdfBook) => void;
}

export const PdfBookUploadModal: React.FC<PdfBookUploadModalProps> = ({
  isOpen,
  onClose,
  onBookAdded,
}) => {
  const [category, setCategory] = useState<BookCategory>('snovel');
  const [folderId, setFolderId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [vol, setVol] = useState<string>('Volume 1');
  const [description, setDescription] = useState<string>('');
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [isAutoExtractedCover, setIsAutoExtractedCover] = useState<boolean>(false);
  const [detectedPageCount, setDetectedPageCount] = useState<number | null>(null);

  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

      const rawFileName = file.name.replace(/\.pdf$/i, '');
      if (!title) {
        setTitle(rawFileName);
      }
      if (!folderId) {
        const cleanName = rawFileName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
        setFolderId(cleanName || `Book_${Date.now()}`);
      }

      // Convert to ArrayBuffer for PDF.js and Base64 for upload
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Auto-extract Cover and Metadata from Page 1 of the PDF!
        try {
          const { coverBase64: autoCover, numPages, title: metaTitle, author: metaAuthor } = 
            await pdfReaderEngine.extractCoverImageFromPdf(arrayBuffer, 1.8);
          
          setCoverBase64(autoCover);
          setIsAutoExtractedCover(true);
          setDetectedPageCount(numPages);
          
          if (metaTitle && metaTitle.trim()) {
            setTitle(metaTitle.trim());
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
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('PDF file read error:', err);
        setError('PDF 파일을 읽는 도중 오류가 발생했습니다.');
        setIsProcessingPdf(false);
      }
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverBase64(reader.result as string);
        setIsAutoExtractedCover(false);
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

    try {
      const response = await fetch('/api/books/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: category,
          folderId: folderId.trim() || `Book_${Date.now()}`,
          title: title.trim(),
          author: author.trim() || '알 수 없는 작가',
          vol: vol.trim() || 'Volume 1',
          description: description.trim() || (detectedPageCount ? `총 ${detectedPageCount}페이지 PDF 서적` : '사용자 지정 PDF 도서'),
          pdfBase64,
          coverBase64,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      audioEngine.playPageFlip();
      onBookAdded(data.book);
      onClose();
    } catch (err: any) {
      console.error('Upload book error:', err);
      setError(err.message || '도서 등록 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-slate-900/95 border border-white/20 backdrop-blur-2xl shadow-2xl space-y-5 animate-scaleUp text-white scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">PDF 도서 및 만화 등록</h2>
              <p className="text-xs text-slate-400">
                PDF의 1페이지를 표지로 자동 추출 & 매칭하여 <code className="text-amber-300 font-mono">public/Book/</code>에 보관합니다.
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
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">분류 (저장 디렉터리)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('snovel')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  category === 'snovel'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>라이트노벨 (Book/SNovel)</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('manga')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  category === 'manga'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>만화책 (Book/Manga)</span>
              </button>
            </div>
          </div>

          {/* PDF File Picker (Required) with Auto Cover Extraction */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              PDF 파일 선택 (main.pdf) <span className="text-amber-400">*</span>
            </label>
            <div className="relative border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white/5 hover:bg-white/10">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {isProcessingPdf ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin mb-1" />
                  <p className="text-xs text-amber-200 font-semibold">1페이지 표지 자동 추출 & 분석 중...</p>
                </div>
              ) : pdfFile ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="truncate max-w-xs">{pdfFile.name}</span>
                  {detectedPageCount && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300">
                      총 {detectedPageCount}p
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto text-amber-300 mb-1" />
                  <p className="text-xs text-slate-300">
                    클릭하거나 PDF 파일을 이곳에 드래그하세요
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    1페이지가 표지로 자동 추출 및 매칭됩니다.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Auto Matched Cover Preview & Optional Override */}
          {coverBase64 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={coverBase64}
                  alt="Auto matched cover preview"
                  className="w-12 h-16 rounded-lg object-cover border border-white/20 shadow-md flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAutoExtractedCover ? '1페이지 표지 자동 매칭 완료' : '사용자 지정 표지'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAutoExtractedCover 
                      ? 'PDF 첫 페이지가 표지 이미지로 자동 생성되었습니다.' 
                      : '업로드한 표지 이미지가 적용되었습니다.'}
                  </p>
                </div>
              </div>

              <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] text-slate-200 cursor-pointer transition-colors flex-shrink-0 border border-white/15">
                <span>표지 변경</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Folder Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                도서 제목 <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 전생했더니 슬라임 1권"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                폴더명 (영문/숫자/한글)
              </label>
              <input
                type="text"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="예: Tensura1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-amber-300 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Author & Vol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">작가명</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: Fuse, Kugane"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">권수 / 챕터</label>
              <input
                type="text"
                value={vol}
                onChange={(e) => setVol(e.target.value)}
                placeholder="예: Volume 1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading || isProcessingPdf}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>도서 저장 중 (public/Book/ 에 기록)...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>서재에 PDF 등록하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

