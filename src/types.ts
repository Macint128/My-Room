export type TabType = 'room' | 'garden' | 'manga' | 'music' | 'cinema';

export type TimeOfDay = 'morning' | 'afternoon' | 'sunset' | 'night';
export type WeatherType = 'clear' | 'rain' | 'snow' | 'sakura' | 'fireflies';
export type GardenSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export interface LightingPreset {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  color: string; // Hex color
  glowColor: string;
  temperature: number; // in Kelvin e.g. 2200 to 6500
  brightness: number; // 0 to 100
  flickerSpeed: number; // 0 for steady, 1-3 for candle
}

export interface RoomLightingState {
  presetId: string;
  color: string;
  glowColor: string;
  brightness: number;
  temperature: number;
  candleFlicker: boolean;
  breatheEffect: boolean;
  autoCircadian?: boolean; // Automatic color temperature according to time of day
}

export interface AmbientSoundTrack {
  id: string;
  name: string;
  nameKo: string;
  iconName: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
  type: 'rain' | 'fireplace' | 'stream' | 'vinyl' | 'chimes' | 'crickets' | 'birds' | 'whitenoise';
}

export interface TeaOption {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  notes: string;
  color: string;
  benefits: string;
  ingredients: string[];
}

export interface LightNovelStory {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  description: string;
  readTime: string;
  chapters: {
    id: string;
    title: string;
    content: string;
    pages?: string[]; // Array of book pages for 3D flip
  }[];
  isAiCustom?: boolean;
}

export interface MangaComic {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  description: string;
  episodes: {
    id: string;
    title: string;
    panels: {
      id: string;
      image: string;
      caption?: string;
      dialogue?: {
        speaker: string;
        text: string;
        side: 'left' | 'right';
      }[];
    }[];
  }[];
}

export interface ReadingPreferences {
  theme: 'parchment' | 'oled-dark' | 'frost-glass' | 'e-ink' | 'sakura-soft';
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: number; // 14 to 28
  lineHeight: number; // 1.4 to 2.2
  soundEffect: boolean;
  backgroundMusic: boolean;
  twoPageSpread: boolean; // Two-page spread on desktop
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  mood: string;
  coverArt: string;
  category: 'lofi' | 'piano' | 'acoustic' | 'ambient' | 'jazz';
  chordSequence?: number[];
  audioSource?: string;
}

export interface CinemaScene {
  id: string;
  title: string;
  subtitle: string;
  category: 'anime' | 'nature' | 'urban' | 'cyber' | 'cozy';
  backdropUrl: string;
  ambientColor: string;
  description: string;
  duration: string;
}

export interface GardenPlant {
  id: string;
  name: string;
  nameKo: string;
  species: string;
  stage: number; // 1 (seed) to 5 (bloomed/harvestable)
  maxStage: number;
  waterLevel: number; // 0 to 100
  sunLevel: number; // 0 to 100
  happiness: number; // 0 to 100
  plantedDate: string;
  lastWatered?: string;
  isHarvestable: boolean;
  harvestYield: string;
  icon: string;
  color: string;
  description: string;
  flowerType: 'sakura' | 'succulent' | 'lavender' | 'mint' | 'chrysanthemum' | 'moss';
}

export interface GardenDecoration {
  id: string;
  nameKo: string;
  icon: string;
  description: string;
  isActive: boolean;
  category: 'lighting' | 'furniture' | 'water' | 'sound';
  customEffect?: string;
}

export interface GardenEvent {
  id: string;
  title: string;
  subtitle: string;
  season: GardenSeason;
  weatherChange: WeatherType;
  ambientColor: string;
  icon: string;
  description: string;
}
