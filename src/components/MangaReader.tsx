import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search,
  RefreshCw,
  Plus, 
  Trash2, 
  FolderOpen, 
  FileText, 
  Layers,
  Sparkles,
  Bookmark,
  Coffee,
  Check
} from 'lucide-react';
import { PdfBook, ReadingPreferences } from '../types.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { PdfRealisticBookViewer } from './PdfRealisticBookViewer.tsx';
import { PdfMangaViewer } from './PdfMangaViewer.tsx';
import { PdfBookUploadModal } from './PdfBookUploadModal.tsx';

// Fallback initial sample books
const INITIAL_SNOVELS: PdfBook[] = [
  {
    id: 'Tensura1',
    folderName: 'Tensura1',
    type: 'snovel',
    title: '전생했더니 슬라임이었던 건에 대하여 1권',
    titleEn: 'That Time I Got Reincarnated as a Slime Vol 1',
    author: 'Fuse (휴즈)',
    vol: 'Volume 01 - Slime Awakening',
    description: '평범한 회사원이 이세계에서 최약체 슬라임으로 환생하면서 시작되는 판타지 대서사시.',
    pdfPath: '/Book/SNovel/Tensura1/main.pdf',
    coverPath: '/Book/SNovel/Tensura1/cover.png',
    pageCount: 5,
    genre: '판타지 / 이세계'
  },
  {
    id: 'Overlord1',
    folderName: 'Overlord1',
    type: 'snovel',
    title: '오버로드 1권: 불사자의 왕',
    titleEn: 'Overlord Vol 1: The Undead King',
    author: 'Kugane Maruyama',
    vol: 'Volume 01 - The Undead King',
    description: '서비스 종료를 맞이한 DMMO-RPG 유그드라실. 길드 본거지 나자릭 지하대분묘와 함께 이세계로 전이된 마왕 모몬가.',
    pdfPath: '/Book/SNovel/Overlord1/main.pdf',
    coverPath: '/Book/SNovel/Overlord1/cover.png',
    pageCount: 4,
    genre: '다크 판타지'
  }
];

const INITIAL_MANGA: PdfBook[] = [
  {
    id: 'Frieren1',
    folderName: 'Frieren1',
    type: 'manga',
    title: '장송의 프리렌 1권 (Manga)',
    titleEn: 'Sousou no Frieren Chapter 1',
    author: 'Kanehito Yamada',
    vol: 'Chapter 01 - The Journey Begins',
    description: '마왕을 쓰러뜨린 용사 일행의 마법사 프리렌. 천 년을 사는 엘프가 인간의 마음을 찾아 떠나는 잔잔한 여정.',
    pdfPath: '/Book/Manga/Frieren1/main.pdf',
    coverPath: '/Book/Manga/Frieren1/cover.png',
    pageCount: 4,
    genre: '힐링 판타지'
  },
  {
    id: 'SpyFamily1',
    folderName: 'SpyFamily1',
    type: 'manga',
    title: '스파이 패밀리 1권 (Manga)',
    titleEn: 'Spy x Family Mission 1',
    author: 'Tatsuya Endo',
    vol: 'Mission 01 - Operation Strix',
    description: '세계 평화를 위해 위장 가족을 만든 일류 스파이 황혼, 초능력자 딸 아냐, 암살자 아내 요르의 패밀리 코미디.',
    pdfPath: '/Book/Manga/SpyFamily1/main.pdf',
    coverPath: '/Book/Manga/SpyFamily1/cover.png',
    pageCount: 3,
    genre: '스파이 코미디'
  }
];

export const MangaReader: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'novels' | 'manga'>('novels');
  const [snovels, setSnovels] = useState<PdfBook[]>(INITIAL_SNOVELS);
  const [mangaList, setMangaList] = useState<PdfBook[]>(INITIAL_MANGA);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingBooks, setIsLoadingBooks] = useState<boolean>(false);

  // Active Reader State
  const [activeReadingBook, setActiveReadingBook] = useState<PdfBook | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Reading Preferences
  const [prefs, setPrefs] = useState<ReadingPreferences>({
    theme: 'parchment',
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 1.8,
    soundEffect: true,
    backgroundMusic: true,
    twoPageSpread: true,
  });

  // Fetch books from server
  const loadBooks = async () => {
    try {
      setIsLoadingBooks(true);
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        if (data.snovels && data.snovels.length > 0) setSnovels(data.snovels);
        if (data.manga && data.manga.length > 0) setMangaList(data.manga);
      }
    } catch (e) {
      console.warn('Could not fetch books from server, using initial list', e);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleOpenBook = (book: PdfBook) => {
    setActiveReadingBook(book);
    if (prefs.soundEffect) audioEngine.playPageFlip();
  };

  const handleBookUploaded = (newBook: PdfBook) => {
    if (newBook.type === 'snovel') {
      setSnovels((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);
      setActiveCategory('novels');
    } else {
      setMangaList((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);
      setActiveCategory('manga');
    }
    handleOpenBook(newBook);
  };

  const handleDeleteBook = async (e: React.MouseEvent, book: PdfBook) => {
    e.stopPropagation();
    if (!confirm(`'${book.title}' 도서를 서재에서 삭제하시겠습니까?`)) return;

    try {
      await fetch(`/api/books/${book.type}/${book.folderName || book.id}`, {
        method: 'DELETE',
      });
      if (book.type === 'snovel') {
        setSnovels((prev) => prev.filter((b) => b.id !== book.id));
      } else {
        setMangaList((prev) => prev.filter((b) => b.id !== book.id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filtered lists
  const filteredNovels = snovels.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.vol && b.vol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.genre && b.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredManga = mangaList.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.vol && b.vol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.genre && b.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* 1. PDF Book Upload Modal with Auto Cover Matching */}
      <PdfBookUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onBookAdded={handleBookUploaded}
      />

      {/* 2. PDF Viewers (Light Novel 3D Paper vs Manga Continuous Viewer) */}
      {activeReadingBook && activeReadingBook.type === 'snovel' && (
        <PdfRealisticBookViewer
          book={activeReadingBook}
          onClose={() => setActiveReadingBook(null)}
          prefs={prefs}
          onUpdatePrefs={setPrefs}
        />
      )}

      {activeReadingBook && activeReadingBook.type === 'manga' && (
        <PdfMangaViewer
          book={activeReadingBook}
          onClose={() => setActiveReadingBook(null)}
        />
      )}

      {/* 3. Main Library Hub */}
      {!activeReadingBook && (
        <div className="space-y-6">
          {/* Library Header Navigation Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-white/15">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <h1 className="text-2xl font-bold text-white">PDF 서재 & 만화 라운지</h1>
              </div>
              <p className="text-xs text-slate-400">
                <code className="text-amber-300 font-mono">public/Book/</code> 폴더의 PDF 라이트노벨과 만화책을 3D 양면 책장 넘김 및 웹툰 스크롤로 감상하세요. (1페이지 표지 자동 매칭)
              </p>
            </div>

            {/* Actions: Segmented Category Buttons + Refresh + Add PDF Button */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <button
                  onClick={() => setActiveCategory('novels')}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeCategory === 'novels' ? 'bg-amber-500/30 text-amber-200 shadow border border-amber-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📖 라이트노벨 ({snovels.length})
                </button>
                <button
                  onClick={() => setActiveCategory('manga')}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeCategory === 'manga' ? 'bg-emerald-500/30 text-emerald-200 shadow border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎨 만화책 ({mangaList.length})
                </button>
              </div>

              {/* Refresh / Rescan Button */}
              <button
                onClick={loadBooks}
                disabled={isLoadingBooks}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-50"
                title="서재 새로고침 (폴더 재검색)"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBooks ? 'animate-spin text-amber-300' : ''}`} />
              </button>

              {/* Upload PDF Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all hover:scale-105 shadow ml-auto sm:ml-0"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>PDF 도서 등록</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="도서명, 작가명, 권수 검색..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              {activeCategory === 'novels' ? `라이트노벨 ${filteredNovels.length}권` : `만화책 ${filteredManga.length}편`}
            </div>
          </div>

          {/* 4. Light Novels Showcase (Realistic Hardcover PDF Cards with Auto Cover) */}
          {activeCategory === 'novels' && (
            <div>
              {filteredNovels.length === 0 ? (
                <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm">검색 결과 또는 등록된 라이트노벨이 없습니다.</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all"
                  >
                    새 PDF 소설 추가하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredNovels.map((novel) => (
                    <div
                      key={novel.id}
                      onClick={() => handleOpenBook(novel)}
                      className="group relative cursor-pointer glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-amber-500/15 flex flex-col"
                    >
                      {/* Cover Image with Auto Fallback */}
                      <div className="relative h-64 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                        <img
                          src={novel.coverPath}
                          alt={novel.title}
                          onError={(e) => {
                            // Fallback to dynamic SVG cover if image not found
                            const target = e.currentTarget;
                            target.src = `/api/books/cover-svg?title=${encodeURIComponent(novel.title)}&author=${encodeURIComponent(novel.author || '')}&type=snovel`;
                          }}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent pointer-events-none" />
                        
                        {/* Realistic 3D Book Spine Shadow on Left */}
                        <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-gradient-to-r from-black/70 to-transparent pointer-events-none" />

                        {/* PDF Path Badge */}
                        <div className="absolute top-3 left-4 flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-950/80 text-amber-300 backdrop-blur-md border border-amber-500/30">
                          <FolderOpen className="w-3 h-3 text-amber-400" />
                          <span className="truncate max-w-[140px]">{novel.pdfPath}</span>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteBook(e, novel)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="도서 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Book Metadata */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {novel.vol || 'Volume 1'}
                            </span>
                            {novel.genre && (
                              <span className="text-[10px] text-slate-400">{novel.genre}</span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-2">
                            {novel.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{novel.author}</p>
                          <p className="text-xs text-slate-300/80 mt-2 line-clamp-2 leading-relaxed">
                            {novel.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                          <span className="text-slate-400 font-mono text-[11px]">3D 양면 책장 넘김</span>
                          <span className="text-amber-300 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            소설 펼치기 📖 →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Manga Comics Showcase (PDF Comic Cards) */}
          {activeCategory === 'manga' && (
            <div>
              {filteredManga.length === 0 ? (
                <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <FileText className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm">검색 결과 또는 등록된 만화책이 없습니다.</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all"
                  >
                    새 PDF 만화 추가하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                  {filteredManga.map((manga) => (
                    <div
                      key={manga.id}
                      onClick={() => handleOpenBook(manga)}
                      className="group relative cursor-pointer glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-emerald-500/15 flex flex-col sm:flex-row"
                    >
                      <div className="relative sm:w-56 h-60 sm:h-auto shrink-0 overflow-hidden bg-slate-950 flex items-center justify-center">
                        <img
                          src={manga.coverPath}
                          alt={manga.title}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = `/api/books/cover-svg?title=${encodeURIComponent(manga.title)}&author=${encodeURIComponent(manga.author || '')}&type=manga`;
                          }}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/60 sm:block hidden pointer-events-none" />
                        
                        <button
                          onClick={(e) => handleDeleteBook(e, manga)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="만화 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {manga.vol || 'Chapter 1'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                              {manga.pdfPath}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-200 transition-colors">
                            {manga.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">{manga.author}</p>
                          <p className="text-xs text-slate-300/80 mt-2 line-clamp-3 leading-relaxed">
                            {manga.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                          <span className="text-slate-400 font-mono text-[11px]">웹툰 스크롤 / 양면 넘김</span>
                          <span className="text-emerald-300 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            만화 뷰어 열기 🎨 →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

