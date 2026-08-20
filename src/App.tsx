import React, { useState } from 'react';
import { 
  TabType, 
  TimeOfDay, 
  WeatherType, 
  RoomLightingState, 
  AmbientSoundTrack, 
  TeaOption,
  GardenSeason
} from './types.ts';
import { 
  DEFAULT_LIGHTING, 
  AMBIENT_SOUND_TRACKS, 
  TEA_OPTIONS 
} from './data/initialData.ts';
import { audioEngine } from './utils/audioEngine.ts';
import { AmbientBackdrop } from './components/AmbientBackdrop.tsx';
import { Header } from './components/Header.tsx';
import { DesktopSidebar } from './components/DesktopSidebar.tsx';
import { FloatingMobileTabBar } from './components/FloatingMobileTabBar.tsx';
import { RoomHub } from './components/RoomHub.tsx';
import { MangaReader } from './components/MangaReader.tsx';
import { MusicLounge } from './components/MusicLounge.tsx';
import { CinemaLounge } from './components/CinemaLounge.tsx';
import { ZenGarden } from './components/ZenGarden.tsx';
import { TeaBrewModal } from './components/TeaBrewModal.tsx';
import { SoundMixerModal } from './components/SoundMixerModal.tsx';

export function App() {
  // Navigation State (Mobile bottom bar / Desktop sidebar)
  const [activeTab, setActiveTab] = useState<TabType>('room');

  // Environment & Lighting State
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('sunset');
  const [weather, setWeather] = useState<WeatherType>('rain');
  const [lighting, setLighting] = useState<RoomLightingState>(DEFAULT_LIGHTING);

  // Audio & Ambient Sounds Engine State
  const [ambientSounds, setAmbientSounds] = useState<AmbientSoundTrack[]>(AMBIENT_SOUND_TRACKS);
  const [isMuted, setIsMuted] = useState(false);

  // Tea Bar State
  const [currentTea, setCurrentTea] = useState<TeaOption | null>(TEA_OPTIONS[0]);
  const [isTeaModalOpen, setIsTeaModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);

  // Synchronize Ambient Audio Engine with sound state
  const handleToggleAmbientSound = (id: string) => {
    setAmbientSounds((prev) =>
      prev.map((sound) => {
        if (sound.id === id) {
          const nextPlaying = !sound.isPlaying;
          if (nextPlaying) {
            audioEngine.startProceduralAmbient(sound.type, sound.volume);
          } else {
            audioEngine.stopProceduralAmbient(sound.type);
          }
          return { ...sound, isPlaying: nextPlaying };
        }
        return sound;
      })
    );
  };

  const handleUpdateAmbientVolume = (id: string, vol: number) => {
    setAmbientSounds((prev) =>
      prev.map((sound) => {
        if (sound.id === id) {
          if (sound.isPlaying) {
            audioEngine.updateAmbientVolume(sound.type, vol);
          }
          return { ...sound, volume: vol };
        }
        return sound;
      })
    );
  };

  const handleApplySoundPreset = (config: { [id: string]: number }) => {
    setAmbientSounds((prev) =>
      prev.map((sound) => {
        if (config[sound.id] !== undefined) {
          const vol = config[sound.id];
          audioEngine.startProceduralAmbient(sound.type, vol);
          return { ...sound, isPlaying: true, volume: vol };
        } else {
          audioEngine.stopProceduralAmbient(sound.type);
          return { ...sound, isPlaying: false };
        }
      })
    );
  };

  const handleMuteAllSounds = () => {
    ambientSounds.forEach((s) => {
      if (s.isPlaying) audioEngine.stopProceduralAmbient(s.type);
    });
    setAmbientSounds((prev) => prev.map((s) => ({ ...s, isPlaying: false })));
  };

  const handleToggleMasterMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      handleMuteAllSounds();
    }
  };

  const handleUpdateLighting = (newLighting: Partial<RoomLightingState>) => {
    setLighting((prev) => ({ ...prev, ...newLighting }));
  };

  // When tea is brewed from Garden harvest
  const handleBrewHarvestedTea = (tea: TeaOption) => {
    setCurrentTea(tea);
    setActiveTab('room');
  };

  // When season changes in Garden, adjust atmosphere
  const handleGardenSeasonChange = (season: GardenSeason) => {
    if (season === 'spring') {
      setWeather('sakura');
      setLighting((prev) => ({ ...prev, color: '#ec4899', glowColor: '#f472b6', temperature: 3200 }));
    } else if (season === 'summer') {
      setWeather('fireflies');
      setLighting((prev) => ({ ...prev, color: '#10b981', glowColor: '#34d399', temperature: 4000 }));
    } else if (season === 'autumn') {
      setWeather('rain');
      setLighting((prev) => ({ ...prev, color: '#f59e0b', glowColor: '#fbbf24', temperature: 2600 }));
    } else if (season === 'winter') {
      setWeather('snow');
      setLighting((prev) => ({ ...prev, color: '#38bdf8', glowColor: '#7dd3fc', temperature: 5600 }));
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 font-sans selection:bg-amber-400 selection:text-black overflow-x-hidden">
      {/* 1. Dynamic Atmosphere & Particles Canvas Backdrop */}
      <AmbientBackdrop
        timeOfDay={timeOfDay}
        weather={weather}
        lighting={lighting}
      />

      {/* 2. Top Header Toolbar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={setTimeOfDay}
        weather={weather}
        onChangeWeather={setWeather}
        currentTea={currentTea}
        onOpenTeaModal={() => setIsTeaModalOpen(true)}
        onOpenSoundMixer={() => setIsSoundModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMasterMute}
        lighting={lighting}
      />

      {/* 3. Main Responsive Shell (Desktop Sidebar + Main Content Container + Mobile Tab Bar) */}
      <div className="relative z-10 flex w-full max-w-[1600px] mx-auto">
        {/* Desktop Sidebar (Auto-transforms from Tab Switcher on PC) */}
        <DesktopSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          timeOfDay={timeOfDay}
          onChangeTimeOfDay={setTimeOfDay}
          weather={weather}
          onChangeWeather={setWeather}
          lighting={lighting}
          onUpdateLighting={handleUpdateLighting}
          currentTea={currentTea}
          onOpenTeaModal={() => setIsTeaModalOpen(true)}
          onOpenSoundModal={() => setIsSoundModalOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMasterMute}
          gardenBloomingCount={3}
        />

        {/* Main Workspace Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'room' && (
            <RoomHub
              onSelectTab={setActiveTab}
              lighting={lighting}
              onUpdateLighting={handleUpdateLighting}
              currentTea={currentTea}
              onOpenTeaModal={() => setIsTeaModalOpen(true)}
              onOpenSoundModal={() => setIsSoundModalOpen(true)}
              ambientSounds={ambientSounds}
              onToggleSound={handleToggleAmbientSound}
              onSoundVolumeChange={handleUpdateAmbientVolume}
              timeOfDay={timeOfDay}
              weather={weather}
              gardenBloomingCount={3}
            />
          )}

          {activeTab === 'garden' && (
            <ZenGarden 
              onBrewHarvestedTea={handleBrewHarvestedTea}
              onSeasonChange={handleGardenSeasonChange}
            />
          )}

          {activeTab === 'manga' && <MangaReader />}

          {activeTab === 'music' && (
            <MusicLounge
              ambientSounds={ambientSounds}
              onToggleAmbientSound={handleToggleAmbientSound}
              onUpdateAmbientVolume={handleUpdateAmbientVolume}
              isMuted={isMuted}
              onToggleMute={handleToggleMasterMute}
            />
          )}

          {activeTab === 'cinema' && (
            <CinemaLounge
              lighting={lighting}
              onUpdateLighting={handleUpdateLighting}
            />
          )}
        </main>
      </div>

      {/* 4. Floating Mobile Tab Bar (For mobile screens only) */}
      <FloatingMobileTabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lighting={lighting}
        gardenBloomingCount={3}
      />

      {/* 5. Global Modal Dialogs */}
      <TeaBrewModal
        isOpen={isTeaModalOpen}
        onClose={() => setIsTeaModalOpen(false)}
        currentTea={currentTea}
        onSelectTea={setCurrentTea}
      />

      <SoundMixerModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
        ambientSounds={ambientSounds}
        onToggleSound={handleToggleAmbientSound}
        onVolumeChange={handleUpdateAmbientVolume}
        onApplyPreset={handleApplySoundPreset}
        onMuteAll={handleMuteAllSounds}
      />
    </div>
  );
}

export default App;
