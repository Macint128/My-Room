import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search,
  RefreshCw,
  Plus, 
  Trash2, 
  FileText, 
  Sparkles,
  Bookmark,
  LayoutGrid,
  List as ListIcon,
  Globe,
  Tag,
  Compass,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { PdfBook, ReadingPreferences } from '../types.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { PdfRealisticBookViewer } from './PdfRealisticBookViewer.tsx';
import { PdfMangaViewer } from './PdfMangaViewer.tsx';
import { PdfBookUploadModal } from './PdfBookUploadModal.tsx';

// Initial curated library books with high-resolution internet artwork
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
    coverPath: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
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
    coverPath: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
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
    coverPath: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
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
    coverPath: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    pageCount: 3,
    genre: '스파이 코미디'
  }
];

export const MangaReader: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'novels' | 'manga' | 'all'>('novels');
  const [snovels, setSnovels] = useState<PdfBook[]>(INITIAL_SNOVELS);
  const [mangaList, setMangaList] = useState<PdfBook[]>(INITIAL_MANGA);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
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
        const text = await res.text();
        let data: any = {};
        try {
          if (text && (text.startsWith('{') || text.startsWith('['))) {
            data = JSON.parse(text);
          }
        } catch (parseErr) {
          console.warn('Failed to parse books response:', parseErr);
        }
        if (data.snovels && data.snovels.length > 0) setSnovels(data.snovels);
        if (data.manga && data.manga.length > 0) setMangaList(data.manga);
      }
    } catch (e) {
      console.warn('Could not fetch books from server, using initial library', e);
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
    if (!confirm(`'${book.title}' 도서를 보관함에서 삭제하시겠습니까?`)) return;

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

  // Compile full collection
  const allBooks = [...snovels, ...mangaList];

  const currentList = activeCategory === 'novels' 
    ? snovels 
    : activeCategory === 'manga' 
    ? mangaList 
    : allBooks;

  // Extract all genres for quick filter pills
  const availableGenres = Array.from(
    new Set(allBooks.map((b) => b.genre).filter(Boolean))
  ) as string[];

  // Filtered lists
  const filteredBooks = currentList.filter((b) => {
    const matchesSearch = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.vol && b.vol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.genre && b.genre.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'all' || b.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* 1. iTunes-Style Add Book Modal */}
      <PdfBookUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onBookAdded={handleBookUploaded}
      />

      {/* 2. PDF Viewers */}
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

      {/* 3. Main iTunes-Like Media Hub */}
      {!activeReadingBook && (
        <div className="space-y-6">
          {/* iTunes Header Toolbar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-white/15 shadow-xl">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-md">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">도서 보관함 (Library)</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-mono text-slate-300 border border-white/10">
                  총 {allBooks.length}권 소장
                </span>
              </div>
              <p className="text-xs text-slate-400">
                인터넷 고화질 공식 표지와 메타데이터가 매칭된 나만의 라이트노벨 & 만화 미디어 보관함입니다.
              </p>
            </div>

            {/* Actions: Seamlessly Attached Flush Segmented Command Bar */}
            <div className="flex flex-wrap items-center divide-x divide-white/10 rounded-2xl bg-slate-900/90 border border-white/15 p-0.5 backdrop-blur-md shadow-lg overflow-hidden">
              {/* Category Filter */}
              <div className="flex items-center">
                <button
                  onClick={() => setActiveCategory('novels')}
                  className={`px-3 py-2 text-xs font-semibold transition-all ${
                    activeCategory === 'novels' 
                      ? 'bg-amber-500/30 text-amber-200' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  소설 ({snovels.length})
                </button>
                <button
                  onClick={() => setActiveCategory('manga')}
                  className={`px-3 py-2 text-xs font-semibold transition-all ${
                    activeCategory === 'manga' 
                      ? 'bg-emerald-500/30 text-emerald-200' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  만화 ({mangaList.length})
                </button>
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-2 text-xs font-semibold transition-all ${
                    activeCategory === 'all' 
                      ? 'bg-purple-500/30 text-purple-200' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  전체
                </button>
              </div>

              {/* View Mode Toggle: Grid vs List */}
              <div className="flex items-center">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="아트워크 그리드 뷰"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="iTunes 리스트 뷰"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadBooks}
                disabled={isLoadingBooks}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                title="보관함 새로고침"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBooks ? 'animate-spin text-amber-300' : ''}`} />
              </button>

              {/* Add Book Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>도서 추가</span>
              </button>
            </div>
          </div>

          {/* Search, Filter Pills & Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="도서 제목, 작가, 장르 검색..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Genre Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedGenre('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shrink-0 ${
                  selectedGenre === 'all'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                전체 장르
              </button>
              {availableGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all shrink-0 ${
                    selectedGenre === g
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredBooks.length === 0 && (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/5 mx-auto flex items-center justify-center text-slate-500">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-bold text-white">보관함에 일치하는 도서가 없습니다</p>
                <p className="text-xs text-slate-400 mt-1">검색어를 초기화하거나 새로운 도서를 추가해보세요.</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>새 도서 추가하기</span>
              </button>
            </div>
          )}

          {/* 4A. GRID VIEW (Album Artwork Style) */}
          {filteredBooks.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => {
                const isNovel = book.type === 'snovel';
                return (
                  <div
                    key={book.id}
                    onClick={() => handleOpenBook(book)}
                    className={`group relative cursor-pointer glass-panel rounded-3xl overflow-hidden border border-white/10 transition-all duration-300 hover:-translate-y-2 shadow-xl flex flex-col ${
                      isNovel ? 'hover:border-amber-400/50 hover:shadow-amber-500/15' : 'hover:border-emerald-400/50 hover:shadow-emerald-500/15'
                    }`}
                  >
                    {/* Artwork Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img
                        src={book.coverPath}
                        alt={book.title}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = `/api/books/cover-svg?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author || '')}&type=${book.type}`;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                      {/* 3D Book Spine Effect */}
                      <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/70 to-transparent pointer-events-none" />

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                          isNovel
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {isNovel ? '라이트노벨' : '만화'}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteBook(e, book)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="보관함에서 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Book Metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-slate-400">
                            {book.vol || 'Volume 1'}
                          </span>
                          {book.genre && (
                            <span className="text-[10px] text-slate-400">• {book.genre}</span>
                          )}
                        </div>
                        <h3 className={`text-sm font-bold text-white transition-colors line-clamp-2 ${
                          isNovel ? 'group-hover:text-amber-200' : 'group-hover:text-emerald-200'
                        }`}>
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 truncate">{book.author}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                        <span className="text-slate-400 text-[11px]">
                          {isNovel ? '3D 양면 책장' : '웹툰 스크롤'}
                        </span>
                        <span className={`font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 ${
                          isNovel ? 'text-amber-300' : 'text-emerald-300'
                        }`}>
                          읽기 →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4B. LIST VIEW (iTunes Track / Media List Style) */}
          {filteredBooks.length > 0 && viewMode === 'list' && (
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/15">
              <div className="divide-y divide-white/10">
                {filteredBooks.map((book, idx) => {
                  const isNovel = book.type === 'snovel';
                  return (
                    <div
                      key={book.id}
                      onClick={() => handleOpenBook(book)}
                      className="group flex items-center justify-between gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      {/* Left: Index + Artwork + Title/Author */}
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:text-amber-300">
                          {idx + 1}
                        </span>

                        <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/15 shadow">
                          <img
                            src={book.coverPath}
                            alt={book.title}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.src = `/api/books/cover-svg?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author || '')}&type=${book.type}`;
                            }}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              isNovel ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {isNovel ? '소설' : '만화'}
                            </span>
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors truncate">
                              {book.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span>{book.author}</span>
                            <span>•</span>
                            <span className="font-mono">{book.vol || 'Volume 1'}</span>
                            {book.genre && (
                              <>
                                <span>•</span>
                                <span>{book.genre}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          {isNovel ? '📖 3D 양면 책장' : '🎨 웹툰 스크롤'}
                        </span>
                        <button
                          onClick={(e) => handleDeleteBook(e, book)}
                          className="p-2 rounded-xl text-slate-500 hover:text-red-300 hover:bg-red-950/50 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
