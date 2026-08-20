import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  Maximize2, 
  Minimize2, 
  Bookmark, 
  Volume2, 
  Coffee,
  Check,
  Send,
  Loader2,
  Library,
  FileText
} from 'lucide-react';
import { LightNovelStory, MangaComic, ReadingPreferences } from '../types.ts';
import { SAMPLE_LIGHT_NOVELS, SAMPLE_MANGA_COMICS } from '../data/initialData.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { RealisticBookViewer } from './RealisticBookViewer.tsx';

export const MangaReader: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'novels' | 'manga' | 'ai_creator'>('novels');
  const [novels, setNovels] = useState<LightNovelStory[]>(SAMPLE_LIGHT_NOVELS);
  const [mangaList] = useState<MangaComic[]>(SAMPLE_MANGA_COMICS);

  // Active Reader State
  const [selectedNovel, setSelectedNovel] = useState<LightNovelStory | null>(null);
  const [selectedManga, setSelectedManga] = useState<MangaComic | null>(null);
  const [currentMangaEpisodeIndex, setCurrentMangaEpisodeIndex] = useState(0);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  // AI Story Generator State
  const [aiGenre, setAiGenre] = useState('판타지 힐링');
  const [aiCharacter, setAiCharacter] = useState('별을 모으는 밤의 여행자');
  const [aiMood, setAiMood] = useState('따스하고 몽환적인 힐링');
  const [aiPrompt, setAiPrompt] = useState('비 내리는 다락방에서 발견한 마법의 서적과 따뜻한 차');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{
    title: string;
    genre: string;
    content: string;
    cozyTip?: string;
  } | null>(null);

  const handleOpenNovel = (novel: LightNovelStory) => {
    setSelectedNovel(novel);
    setSelectedManga(null);
    if (prefs.soundEffect) audioEngine.playPageFlip();
  };

  const handleOpenManga = (manga: MangaComic) => {
    setSelectedManga(manga);
    setSelectedNovel(null);
    setCurrentMangaEpisodeIndex(0);
    setCurrentPanelIndex(0);
    if (prefs.soundEffect) audioEngine.playPageFlip();
  };

  const handleNextPanel = () => {
    if (!selectedManga) return;
    const currentEp = selectedManga.episodes[currentMangaEpisodeIndex];
    if (currentPanelIndex < currentEp.panels.length - 1) {
      setCurrentPanelIndex(prev => prev + 1);
      if (prefs.soundEffect) audioEngine.playPageFlip();
    }
  };

  const handlePrevPanel = () => {
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(prev => prev - 1);
      if (prefs.soundEffect) audioEngine.playPageFlip();
    }
  };

  // Generate Custom Story using Gemini API
  const handleGenerateStory = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: aiGenre,
          character: aiCharacter,
          mood: aiMood,
          prompt: aiPrompt,
        }),
      });
      const data = await response.json();
      setGeneratedStory(data);
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedStory) return;
    const newNovel: LightNovelStory = {
      id: `ai-novel-${Date.now()}`,
      title: generatedStory.title,
      author: 'Gemini AI 작가',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      genre: generatedStory.genre || aiGenre,
      description: generatedStory.cozyTip || '내가 직접 AI와 함께 지어낸 감성 단편 소설',
      readTime: '5분 읽기',
      chapters: [
        {
          id: 'ch-1',
          title: '제1장: 온기 어린 서막',
          content: generatedStory.content,
        },
      ],
      isAiCustom: true,
    };
    setNovels([newNovel, ...novels]);
    handleOpenNovel(newNovel);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* 1. Realistic 3D Book Viewer Modal when Novel is Selected */}
      {selectedNovel && (
        <RealisticBookViewer
          story={selectedNovel}
          onClose={() => setSelectedNovel(null)}
          prefs={prefs}
          onUpdatePrefs={setPrefs}
        />
      )}

      {/* 2. Manga Reader View when Comic is Selected */}
      {selectedManga && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/15 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <button
              onClick={() => setSelectedManga(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>서재로 나가기</span>
            </button>

            <div className="text-center">
              <h2 className="text-base font-bold text-white">{selectedManga.title}</h2>
              <p className="text-xs text-sky-300 font-mono">
                {selectedManga.episodes[currentMangaEpisodeIndex]?.title} · 컷 {currentPanelIndex + 1} / {selectedManga.episodes[currentMangaEpisodeIndex]?.panels.length}
              </p>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {selectedManga.genre}
            </span>
          </div>

          {/* Comic Panel Container */}
          {(() => {
            const ep = selectedManga.episodes[currentMangaEpisodeIndex];
            const panel = ep?.panels[currentPanelIndex];
            if (!panel) return null;
            return (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                  <img
                    src={panel.image}
                    alt={`Manga panel ${currentPanelIndex + 1}`}
                    className="w-full max-h-[500px] object-cover mx-auto select-none"
                  />

                  {/* Speech Bubble Overlay */}
                  {panel.dialogue && panel.dialogue.map((d, idx) => (
                    <div
                      key={idx}
                      className={`absolute ${
                        d.side === 'left' ? 'top-6 left-6' : 'bottom-6 right-6'
                      } max-w-[260px] p-3.5 rounded-2xl bg-white/95 text-slate-900 text-xs font-medium shadow-2xl border border-slate-300 animate-fadeIn`}
                    >
                      <span className="font-bold block text-[10px] text-amber-700 uppercase tracking-wider mb-0.5">{d.speaker}</span>
                      <p>{d.text}</p>
                    </div>
                  ))}
                </div>

                {panel.caption && (
                  <p className="text-center text-xs font-serif italic text-slate-300 px-4">
                    "{panel.caption}"
                  </p>
                )}

                {/* Panel Navigation Bar */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrevPanel}
                    disabled={currentPanelIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-semibold text-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>이전 컷</span>
                  </button>

                  <span className="text-xs font-mono text-slate-400">
                    {currentPanelIndex + 1} / {ep.panels.length}
                  </span>

                  <button
                    onClick={handleNextPanel}
                    disabled={currentPanelIndex === ep.panels.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-semibold text-white transition-all"
                  >
                    <span>다음 컷</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. Main Library & Story Creator Hub */}
      {!selectedNovel && !selectedManga && (
        <div className="space-y-6">
          {/* Library Navigation & Category Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-white/15">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <h1 className="text-2xl font-bold text-white">서재 & 만화 라운지</h1>
              </div>
              <p className="text-xs text-slate-400">
                현실적인 3D 책장 넘김 효과로 감성 라이트노벨과 만화를 감상하고, AI로 나만의 스토리를 창작하세요.
              </p>
            </div>

            {/* Segmented Category Buttons */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveCategory('novels')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === 'novels' ? 'bg-amber-500/30 text-amber-200 shadow border border-amber-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                📖 라이트노벨 ({novels.length})
              </button>
              <button
                onClick={() => setActiveCategory('manga')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === 'manga' ? 'bg-sky-500/30 text-sky-200 shadow border border-sky-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                🎨 만화 코믹스 ({mangaList.length})
              </button>
              <button
                onClick={() => setActiveCategory('ai_creator')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === 'ai_creator' ? 'bg-purple-500/30 text-purple-200 shadow border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>AI 스토리 창작</span>
              </button>
            </div>
          </div>

          {/* 4. Light Novels Showcase (Realistic Hardcover Cards) */}
          {activeCategory === 'novels' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {novels.map((novel) => (
                <div
                  key={novel.id}
                  onClick={() => handleOpenNovel(novel)}
                  className="group relative cursor-pointer glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-amber-500/10 flex flex-col"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={novel.coverImage}
                      alt={novel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    {/* Realistic 3D Book Spine Indicator on left side */}
                    <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/60 to-transparent shadow-inner" />

                    <span className="absolute top-3 right-3 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-md border border-white/15">
                      {novel.genre}
                    </span>
                    {novel.isAiCustom && (
                      <span className="absolute top-3 left-4 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 backdrop-blur-md border border-purple-500/40">
                        AI Generated
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                        {novel.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{novel.author} · {novel.readTime}</p>
                      <p className="text-xs text-slate-300/80 mt-2 line-clamp-3 leading-relaxed">
                        {novel.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <span className="text-slate-400 font-mono">3D 양면 책 넘김 지원</span>
                      <span className="text-amber-300 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        책 펼치기 📖 →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. Manga Comics Showcase */}
          {activeCategory === 'manga' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mangaList.map((manga) => (
                <div
                  key={manga.id}
                  onClick={() => handleOpenManga(manga)}
                  className="group relative cursor-pointer glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-sky-400/40 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-sky-500/10 flex flex-col sm:flex-row"
                >
                  <div className="relative sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
                    <img
                      src={manga.coverImage}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/60 sm:block hidden" />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {manga.genre}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-sky-200 transition-colors">
                        {manga.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{manga.author}</p>
                      <p className="text-xs text-slate-300/80 mt-2 line-clamp-2 leading-relaxed">
                        {manga.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <span className="text-slate-400 font-mono">제1화 수록</span>
                      <span className="text-sky-300 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        만화 뷰어 열기 🎨 →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6. AI Light Novel Story Studio (Gemini Powered) */}
          {activeCategory === 'ai_creator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-purple-500/20 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">AI 라노벨 창작 스튜디오</h2>
                    <p className="text-xs text-purple-200/70">Gemini 3.7 Flash 모델이 맞춤형 감성 소설을 지어드립니다.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">선택 장르</label>
                    <div className="flex flex-wrap gap-2">
                      {['판타지 힐링', '어반 판타지', '일상 찻집', 'SF 코지 젠', '추리 미스터리', '이세계 베이커리'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setAiGenre(g)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            aiGenre === g
                              ? 'bg-purple-500/30 border-purple-400 text-purple-200 font-semibold'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">주인공 / 등장인물</label>
                    <input
                      type="text"
                      value={aiCharacter}
                      onChange={(e) => setAiCharacter(e.target.value)}
                      placeholder="예: 별빛을 모으는 밤의 사서, 다락방 고양이"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">분위기 & 키워드</label>
                    <input
                      type="text"
                      value={aiMood}
                      onChange={(e) => setAiMood(e.target.value)}
                      placeholder="예: 포근하고 신비로우며 따뜻한 온기"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">상세 플롯 / 소원하는 장면</label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={3}
                      placeholder="예: 비 오는 밤, 다락방 서재에서 차를 마시며 책을 펼쳤는데 신비한 빛이 뿜어져 나오는 이야기"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleGenerateStory}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gemini가 감성적인 이야기를 집필하고 있습니다...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>스토리 생성하기</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Story Result Preview */}
              <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <h3 className="text-sm font-semibold text-white">생성된 스토리 미리보기</h3>
                    {generatedStory && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {generatedStory.genre}
                      </span>
                    )}
                  </div>

                  {generatedStory ? (
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                      <h4 className="text-lg font-bold text-amber-200">{generatedStory.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-serif">
                        {generatedStory.content}
                      </p>
                      {generatedStory.cozyTip && (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                          <Coffee className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block mb-0.5">작가의 독서 페어링 팁</span>
                            <span className="text-amber-200/90">{generatedStory.cozyTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
                      <p className="text-xs">왼쪽에서 원하는 설정을 고르고 스토리를 생성해보세요.</p>
                      <p className="text-[11px] text-slate-500">완성된 작품은 3D 양장본 책으로 바로 감상할 수 있습니다.</p>
                    </div>
                  )}
                </div>

                {generatedStory && (
                  <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                    <button
                      onClick={handleSaveToLibrary}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/40 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>서재에 저장하고 3D 책으로 읽기</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
