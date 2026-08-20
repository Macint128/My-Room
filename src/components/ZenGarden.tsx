import React, { useState } from 'react';
import { 
  Flower2, 
  Droplets, 
  Sun, 
  Sparkles, 
  Scissors, 
  Music, 
  Coffee, 
  Check, 
  Plus, 
  Heart,
  Leaf,
  Wind,
  Calendar,
  Layers,
  Palette,
  Bell,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GardenPlant, GardenSeason, GardenDecoration, GardenEvent, TeaOption } from '../types.ts';
import { 
  INITIAL_GARDEN_PLANTS, 
  AVAILABLE_SEEDS, 
  GARDEN_DECORATIONS, 
  GARDEN_EVENTS, 
  TEA_OPTIONS 
} from '../data/initialData.ts';
import { audioEngine } from '../utils/audioEngine.ts';
import { SwayingGrassCanvas } from './SwayingGrassCanvas.tsx';

interface ZenGardenProps {
  onBrewHarvestedTea: (tea: TeaOption) => void;
  onSeasonChange?: (season: GardenSeason) => void;
}

export const ZenGarden: React.FC<ZenGardenProps> = ({ 
  onBrewHarvestedTea,
  onSeasonChange 
}) => {
  const [plants, setPlants] = useState<GardenPlant[]>(INITIAL_GARDEN_PLANTS);
  const [selectedPlantId, setSelectedPlantId] = useState<string>(plants[0]?.id || '');
  const [season, setSeason] = useState<GardenSeason>('spring');
  const [decorations, setDecorations] = useState<GardenDecoration[]>(GARDEN_DECORATIONS);
  const [activeEvent, setActiveEvent] = useState<GardenEvent | null>(null);
  const [careActionFeedback, setCareActionFeedback] = useState<string | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [windStrength, setWindStrength] = useState(1.0);
  const [activeTab, setActiveTab] = useState<'care' | 'decor' | 'events'>('care');

  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || plants[0];

  const triggerFeedback = (msg: string) => {
    setCareActionFeedback(msg);
    setTimeout(() => setCareActionFeedback(null), 3000);
  };

  // Season change handler
  const handleSelectSeason = (newSeason: GardenSeason) => {
    setSeason(newSeason);
    if (onSeasonChange) onSeasonChange(newSeason);
    const seasonNames = { spring: '봄 (벚꽃 만개)', summer: '여름 (청량한 녹음)', autumn: '가을 (황금빛 단풍)', winter: '겨울 (포근한 온실)' };
    triggerFeedback(`🍂 정원의 계절이 [${seasonNames[newSeason]}] (으)로 바뀌었습니다.`);
  };

  // Water Plant
  const handleWaterPlant = (id: string) => {
    audioEngine.playWaterDrops();
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        const nextWater = Math.min(100, p.waterLevel + 25);
        const nextHappiness = Math.min(100, p.happiness + 15);
        return {
          ...p,
          waterLevel: nextWater,
          happiness: nextHappiness,
          lastWatered: '방금 전',
        };
      }
      return p;
    }));
    triggerFeedback('💧 촉촉한 물을 주었습니다. 물방울이 잎사귀에 영롱하게 맺힙니다.');
  };

  // Give Sunlight
  const handleSunlight = (id: string) => {
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          sunLevel: Math.min(100, p.sunLevel + 20),
          happiness: Math.min(100, p.happiness + 10),
        };
      }
      return p;
    }));
    triggerFeedback('☀️ 따스한 햇살을 듬뿍 쬐어주었습니다. 식물이 광합성을 시작합니다.');
  };

  // Fertilize & Grow to Next Stage
  const handleFertilize = (id: string) => {
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        const nextStage = Math.min(p.maxStage, p.stage + 1);
        if (nextStage === p.maxStage) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#34d399', '#f472b6', '#fbbf24', '#38bdf8'],
          });
        }
        return {
          ...p,
          stage: nextStage,
          happiness: 100,
          isHarvestable: nextStage >= 3 && p.harvestYield.includes('찻잎'),
        };
      }
      return p;
    }));
    triggerFeedback('✨ 천연 영양분을 주어 식물이 쑥쑥 자라났습니다!');
  };

  // Play Singing Bowl to Plant
  const handlePlayMusicToPlant = (id: string) => {
    audioEngine.playSingingBowl(528, 4.5);
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, happiness: 100 };
      }
      return p;
    }));
    triggerFeedback('🎵 528Hz 사랑 주파수를 들려주었습니다. 행복도가 100%가 되었습니다!');
  };

  // Pruning
  const handlePruning = (id: string) => {
    audioEngine.playWindChime();
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, happiness: Math.min(100, p.happiness + 10) };
      }
      return p;
    }));
    triggerFeedback('✂️ 가지를 정돈하여 식물이 더 건강하고 단정해졌습니다.');
  };

  // Harvest for Tea
  const handleHarvest = (plant: GardenPlant) => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#a855f7', '#10b981', '#fbbf24'],
    });

    let matchedTea = TEA_OPTIONS[0];
    if (plant.flowerType === 'lavender') {
      matchedTea = TEA_OPTIONS.find(t => t.id === 'lavender-mint') || TEA_OPTIONS[0];
    } else if (plant.flowerType === 'mint') {
      matchedTea = TEA_OPTIONS.find(t => t.id === 'lavender-mint') || TEA_OPTIONS[0];
    } else if (plant.flowerType === 'sakura') {
      matchedTea = TEA_OPTIONS.find(t => t.id === 'chamomile') || TEA_OPTIONS[0];
    } else if (plant.flowerType === 'chrysanthemum') {
      matchedTea = TEA_OPTIONS.find(t => t.id === 'chamomile') || TEA_OPTIONS[0];
    }

    onBrewHarvestedTea(matchedTea);
    audioEngine.playTeaPour();
    triggerFeedback(`🌸 [${plant.harvestYield}]을(를) 정성껏 수확하여 나만의 방에 신선한 차로 우려냈습니다!`);
  };

  // Plant a new seed
  const handlePlantNewSeed = (seed: typeof AVAILABLE_SEEDS[0]) => {
    const newPlant: GardenPlant = {
      id: `plant-${Date.now()}`,
      name: seed.nameKo,
      nameKo: seed.nameKo,
      species: seed.species,
      stage: 1,
      maxStage: 5,
      waterLevel: 50,
      sunLevel: 60,
      happiness: 80,
      plantedDate: '방금 심음',
      isHarvestable: false,
      harvestYield: seed.harvestYield,
      icon: seed.icon,
      color: seed.color,
      description: seed.description,
      flowerType: seed.flowerType,
    };
    setPlants([newPlant, ...plants]);
    setSelectedPlantId(newPlant.id);
    setIsSeedModalOpen(false);
    audioEngine.playWaterDrops();
    triggerFeedback(`🌱 [${seed.nameKo}] 새싹을 화분에 정성껏 심었습니다!`);
  };

  // Toggle decoration item
  const handleToggleDecoration = (id: string) => {
    setDecorations(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.isActive;
        if (d.id === 'deco-wind-bell' && nextState) {
          audioEngine.playWindChime();
        } else if (d.id === 'deco-water-fountain' && nextState) {
          audioEngine.playWaterDrops();
        }
        return { ...d, isActive: nextState };
      }
      return d;
    }));
  };

  // Trigger Seasonal Garden Event
  const handleTriggerEvent = (event: GardenEvent) => {
    setActiveEvent(event);
    setSeason(event.season);
    if (onSeasonChange) onSeasonChange(event.season);
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: [event.ambientColor, '#fbbf24', '#ffffff'],
    });
    triggerFeedback(`🎉 [${event.title}] 특별 정원 이벤트가 시작되었습니다!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-6">
      {/* 1. Main Interactive Zen Garden Stage with Real Grass & Atmosphere */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl transition-all duration-700"
        style={{
          background: season === 'spring'
            ? 'radial-gradient(circle at 50% 30%, rgba(244, 114, 182, 0.2) 0%, rgba(15, 23, 42, 0.85) 80%)'
            : season === 'summer'
            ? 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.85) 80%)'
            : season === 'autumn'
            ? 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.22) 0%, rgba(15, 23, 42, 0.85) 80%)'
            : 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.18) 0%, rgba(15, 23, 42, 0.85) 80%)',
        }}
      >
        {/* Garden Header & Season Selector */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🌿 나만의 테라스 정원
              </span>
              <span className="text-[11px] text-slate-300 font-mono">
                총 {plants.length}그루의 반려 식물 재배 중
              </span>
              {activeEvent && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-200 border border-pink-400/40 animate-pulse">
                  {activeEvent.title}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              나만의 가상 정원 & 온실
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              바람에 흩날리는 풀과 꽃잎을 감상하고, 씨앗을 심어 찻잎을 수확하세요. 계절 변화와 특별 이벤트로 정원을 꾸며보세요.
            </p>
          </div>

          {/* Season Switcher & Seed Planting Action */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Season Pills */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
              {[
                { id: 'spring', label: '🌸 봄', color: 'text-pink-300' },
                { id: 'summer', label: '🌿 여름', color: 'text-emerald-300' },
                { id: 'autumn', label: '🍁 가을', color: 'text-amber-300' },
                { id: 'winter', label: '❄️ 겨울', color: 'text-sky-300' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSeason(s.id as GardenSeason)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    season === s.id
                      ? 'bg-white/20 text-white shadow-md border border-white/25 scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Plant New Seed Button */}
            <button
              onClick={() => setIsSeedModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>새 씨앗 심기</span>
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {careActionFeedback && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-xl animate-fadeIn flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{careActionFeedback}</span>
          </div>
        )}

        {/* 2. Spotlight: Interactive Plant & Garden Diorama */}
        <div className="relative z-10 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Plant Visual Avatar with Growth Stage Scale & Aura */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div 
              className="relative w-60 h-60 rounded-full glass-panel-light border-2 border-white/30 flex items-center justify-center shadow-2xl transition-transform duration-500 hover:scale-105"
              style={{
                boxShadow: `0 0 60px ${selectedPlant.color}55, inset 0 0 30px rgba(255,255,255,0.2)`,
              }}
            >
              {/* Plant Growth Icon */}
              <span 
                className="text-8xl transition-all duration-700 animate-breathe-glow select-none"
                style={{
                  transform: `scale(${0.65 + (selectedPlant.stage / selectedPlant.maxStage) * 0.5})`,
                }}
              >
                {selectedPlant.icon}
              </span>

              {/* Stage Badge */}
              <span className="absolute bottom-3 px-3.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-emerald-300 border border-white/20 shadow-lg">
                성장 단계 {selectedPlant.stage} / {selectedPlant.maxStage}
              </span>

              {/* Active Decorations Visual Badges */}
              {decorations.filter(d => d.isActive).map((deco, idx) => (
                <div 
                  key={deco.id}
                  className="absolute p-2 rounded-full glass-panel border border-white/20 shadow-lg animate-bounce"
                  style={{
                    top: `${15 + idx * 25}%`,
                    left: idx % 2 === 0 ? '-10px' : 'auto',
                    right: idx % 2 !== 0 ? '-10px' : 'auto',
                    animationDuration: `${2.5 + idx * 0.5}s`,
                  }}
                  title={deco.nameKo}
                >
                  <span className="text-base">{deco.icon}</span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold text-white mt-4">{selectedPlant.nameKo}</h3>
            <p className="text-xs text-slate-400 font-mono">{selectedPlant.species} · 심은 날: {selectedPlant.plantedDate}</p>
          </div>

          {/* Plant Stats & Care Toolkit */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/10">
                {selectedPlant.description}
              </p>
            </div>

            {/* Vitality Gauges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-1 text-sky-300 mb-1">
                  <Droplets className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">수분도</span>
                </div>
                <span className="text-base font-bold font-mono text-white">{selectedPlant.waterLevel}%</span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full transition-all duration-500" style={{ width: `${selectedPlant.waterLevel}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-300 mb-1">
                  <Sun className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">일조량</span>
                </div>
                <span className="text-base font-bold font-mono text-white">{selectedPlant.sunLevel}%</span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${selectedPlant.sunLevel}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="flex items-center justify-center gap-1 text-pink-300 mb-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">행복도</span>
                </div>
                <span className="text-base font-bold font-mono text-white">{selectedPlant.happiness}%</span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-pink-400 rounded-full transition-all duration-500" style={{ width: `${selectedPlant.happiness}%` }} />
                </div>
              </div>
            </div>

            {/* Interactive Care Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => handleWaterPlant(selectedPlant.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Droplets className="w-4 h-4 text-sky-300" />
                <span>물주기</span>
              </button>

              <button
                onClick={() => handleSunlight(selectedPlant.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Sun className="w-4 h-4 text-amber-300" />
                <span>햇살 쬐기</span>
              </button>

              <button
                onClick={() => handleFertilize(selectedPlant.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>영양분 주기</span>
              </button>

              <button
                onClick={() => handlePlayMusicToPlant(selectedPlant.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Music className="w-4 h-4 text-purple-300" />
                <span>싱잉볼 들려주기</span>
              </button>

              <button
                onClick={() => handlePruning(selectedPlant.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <Scissors className="w-4 h-4 text-teal-300" />
                <span>가지치기</span>
              </button>

              {/* Harvest Button if Ready */}
              {selectedPlant.isHarvestable && (
                <button
                  onClick={() => handleHarvest(selectedPlant)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-pink-500/30 transition-all hover:scale-105 animate-pulse"
                >
                  <Leaf className="w-4 h-4" />
                  <span>찻잎 수확 & 차 우리기</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Realistic Swaying Grass & Flora Canvas Bottom Layer */}
        <div className="relative h-28 w-full overflow-hidden border-t border-white/10 bg-slate-950/40">
          <SwayingGrassCanvas season={season} windSpeed={windStrength} />
          <div className="absolute top-2 right-4 flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-white/10 text-[10px] text-slate-300">
            <Wind className="w-3 h-3 text-emerald-300" />
            <span>바람 세기</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.2"
              value={windStrength}
              onChange={(e) => setWindStrength(Number(e.target.value))}
              className="w-16 h-1 accent-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* 2. Secondary Sections: Plant Nursery Rack & Garden Decor / Event Studio */}
      <div className="space-y-4">
        {/* Sub-tab switcher */}
        <div className="flex items-center justify-between glass-panel p-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('care')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'care' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🪴 화분 보관대 ({plants.length})
            </button>
            <button
              onClick={() => setActiveTab('decor')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'decor' ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏮 정원 꾸미기 데코 ({decorations.filter(d => d.isActive).length}개 활성)
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'events' ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ 계절 특별 축제 ({GARDEN_EVENTS.length})
            </button>
          </div>
        </div>

        {/* Tab Content 1: Plant Nursery Rack */}
        {activeTab === 'care' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {plants.map((p) => {
              const isSelected = selectedPlantId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlantId(p.id)}
                  className={`cursor-pointer p-4 rounded-3xl border transition-all duration-200 text-center flex flex-col items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'glass-panel border-emerald-400/60 shadow-xl scale-105'
                      : 'bg-slate-900/50 border-white/10 hover:bg-slate-900/80 text-slate-400'
                  }`}
                >
                  <span className="text-4xl my-1 transition-transform hover:scale-110">{p.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{p.nameKo.split(' ')[0]}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">단계 {p.stage}/{p.maxStage}</span>
                  </div>
                  {p.isHarvestable && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 animate-pulse">
                      수확 가능
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Content 2: Garden Decorations */}
        {activeTab === 'decor' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {decorations.map((deco) => (
              <div
                key={deco.id}
                onClick={() => handleToggleDecoration(deco.id)}
                className={`cursor-pointer p-4 rounded-3xl border transition-all flex items-start justify-between gap-3 ${
                  deco.isActive
                    ? 'glass-panel border-amber-400/50 bg-amber-500/10 shadow-lg'
                    : 'bg-slate-900/50 border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                    {deco.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{deco.nameKo}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{deco.description}</p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  deco.isActive ? 'bg-amber-400 border-amber-300 text-slate-950 font-bold' : 'border-white/20'
                }`}>
                  {deco.isActive && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Special Garden Festival Events */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GARDEN_EVENTS.map((event) => {
              const isCurrent = activeEvent?.id === event.id;
              return (
                <div
                  key={event.id}
                  onClick={() => handleTriggerEvent(event)}
                  className={`cursor-pointer p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                    isCurrent
                      ? 'glass-panel border-purple-400/60 bg-purple-500/15 shadow-xl scale-[1.01]'
                      : 'glass-panel border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{event.title}</h4>
                      <p className="text-xs text-purple-300 font-mono mt-0.5">{event.subtitle}</p>
                    </div>
                    <span className="text-3xl">{event.icon}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-slate-400 font-mono">계절: {event.season}</span>
                    <button className="px-3 py-1 rounded-xl bg-purple-500/30 text-purple-200 font-bold border border-purple-400/40 hover:bg-purple-500/50 transition-all">
                      {isCurrent ? '진행 중인 축제' : '축제 개최하기 →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seed Planting Selection Modal */}
      {isSeedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Flower2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">새로운 씨앗 심기</h3>
                  <p className="text-xs text-slate-400">정원에 심을 향기로운 식물 씨앗을 선택하세요.</p>
                </div>
              </div>
              <button
                onClick={() => setIsSeedModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {AVAILABLE_SEEDS.map((seed) => (
                <div
                  key={seed.id}
                  onClick={() => handlePlantNewSeed(seed)}
                  className="cursor-pointer p-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all hover:scale-[1.02] flex items-center gap-3"
                >
                  <span className="text-3xl">{seed.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{seed.nameKo}</h4>
                    <p className="text-[10px] text-slate-400">{seed.species}</p>
                    <span className="text-[9px] font-mono text-emerald-300 mt-1 block">
                      수확물: {seed.harvestYield}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
