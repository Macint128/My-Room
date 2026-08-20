import { 
  LightingPreset, 
  RoomLightingState,
  AmbientSoundTrack, 
  TeaOption, 
  LightNovelStory, 
  MangaComic, 
  MusicTrack, 
  CinemaScene, 
  GardenPlant 
} from '../types.ts';

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: 'cozy-amber',
    name: 'Cozy Amber',
    nameKo: '포근한 호박빛 (난로)',
    description: '따뜻한 모닥불과 노란 백열등의 아늑하고 편안한 온기',
    color: '#f59e0b',
    glowColor: '#fbbf24',
    temperature: 2400,
    brightness: 85,
    flickerSpeed: 2,
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    nameKo: '노을빛 석양 (골든 아워)',
    description: '붉게 물드는 저녁 하늘의 부드럽고 낭만적인 그라데이션',
    color: '#ea580c',
    glowColor: '#fb923c',
    temperature: 2800,
    brightness: 80,
    flickerSpeed: 0,
  },
  {
    id: 'soft-sakura',
    name: 'Soft Sakura',
    nameKo: '벚꽃 안개 (로맨틱 핑크)',
    description: '달콤한 봄밤의 부드러운 핑크 라벤더빛 몽환적 조명',
    color: '#ec4899',
    glowColor: '#f472b6',
    temperature: 3200,
    brightness: 75,
    flickerSpeed: 1,
  },
  {
    id: 'moonlight-chill',
    name: 'Moonlight Chill',
    nameKo: '달빛 서리 (애플 쿨 글래스)',
    description: '은은한 밤하늘과 차가운 유리 질감이 느껴지는 세련된 푸른빛',
    color: '#38bdf8',
    glowColor: '#7dd3fc',
    temperature: 5600,
    brightness: 70,
    flickerSpeed: 0,
  },
  {
    id: 'aurora-calm',
    name: 'Aurora Calm',
    nameKo: '오로라 캄 (청록 에메랄드)',
    description: '북극의 신비로운 오로라처럼 맑고 깊은 힐링 그린',
    color: '#10b981',
    glowColor: '#34d399',
    temperature: 4200,
    brightness: 70,
    flickerSpeed: 0,
  },
  {
    id: 'midnight-violet',
    name: 'Midnight Violet',
    nameKo: '미드나잇 바이올렛',
    description: '깊은 밤 사색과 감성적인 몰입을 도와주는 딥 퍼플',
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    temperature: 3000,
    brightness: 65,
    flickerSpeed: 0,
  },
];

export const DEFAULT_LIGHTING: RoomLightingState = {
  presetId: 'cozy-amber',
  color: '#f59e0b',
  glowColor: '#fbbf24',
  brightness: 85,
  temperature: 2400,
  candleFlicker: true,
  breatheEffect: false,
};

export const INITIAL_AMBIENT_SOUNDS: AmbientSoundTrack[] = [
  { id: 'rain', name: 'Rain on Window', nameKo: '창가에 맺힌 빗소리', iconName: 'CloudRain', volume: 0.6, isPlaying: false, type: 'rain' },
  { id: 'fireplace', name: 'Cozy Fireplace', nameKo: '타닥타닥 장작불', iconName: 'Flame', volume: 0.5, isPlaying: false, type: 'fireplace' },
  { id: 'vinyl', name: 'Lo-Fi Vinyl Crackle', nameKo: 'LP 레코드 바이닐', iconName: 'Disc', volume: 0.4, isPlaying: false, type: 'vinyl' },
  { id: 'stream', name: 'Gentle Stream', nameKo: '산골 시냇물 소리', iconName: 'Waves', volume: 0.45, isPlaying: false, type: 'stream' },
  { id: 'chimes', name: 'Wind Chimes', nameKo: '테라스 풍경 소리', iconName: 'Bell', volume: 0.4, isPlaying: false, type: 'chimes' },
  { id: 'crickets', name: 'Night Crickets', nameKo: '여름밤 풀벌레', iconName: 'Moon', volume: 0.35, isPlaying: false, type: 'crickets' },
  { id: 'birds', name: 'Garden Birds', nameKo: '정원의 아침 새소리', iconName: 'Feather', volume: 0.35, isPlaying: false, type: 'birds' },
];

export const AMBIENT_SOUND_TRACKS = INITIAL_AMBIENT_SOUNDS;

export const TEA_OPTIONS: TeaOption[] = [
  {
    id: 'chamomile',
    name: 'Warm Chamomile',
    nameKo: '따스한 캐모마일 블렌드',
    category: '허브 티',
    notes: '은은한 사과향과 편안한 꽃내음',
    color: '#fbbf24',
    benefits: '심신 안정 · 수면 유도 · 긴장 완화',
    ingredients: ['캐모마일 꽃잎', '레몬밤', '라벤더 약간'],
  },
  {
    id: 'matcha',
    name: 'Zen Kyoto Matcha',
    nameKo: '교토 젠 말차 라떼',
    category: '전통 말차',
    notes: '진하고 부드러운 고소함과 쌉싸름한 여운',
    color: '#22c55e',
    benefits: '깊은 집중력 · 테아닌 활성화 · 항산화',
    ingredients: ['우지 말차 가루', '따뜻한 오트 밀크', '약간의 바닐라'],
  },
  {
    id: 'earl-grey',
    name: 'Midnight Earl Grey',
    nameKo: '미드나잇 얼그레이 밀크티',
    category: '홍차',
    notes: '상큼한 베르가못 오일과 부드러운 우유의 조화',
    color: '#d97706',
    benefits: '기분 전환 · 감성적 독서 메이트',
    ingredients: ['실론 홍차', '베르가못 에센스', '스팀 밀크', '꿀 한 스푼'],
  },
  {
    id: 'hojicha',
    name: 'Roasted Hojicha',
    nameKo: '구수한 로스팅 호지차',
    category: '볶은 녹차',
    notes: '카페인이 적고 구수한 누룽지 향',
    color: '#b45309',
    benefits: '속 편안함 · 늦은 밤 마시기 좋음',
    ingredients: ['고온 로스팅 찻잎', '스프링 워터'],
  },
  {
    id: 'lavender-mint',
    name: 'Garden Lavender Mint',
    nameKo: '정원 직송 라벤더 민트',
    category: '정원 블렌드',
    notes: '상쾌한 스피어민트와 향긋한 라벤더',
    color: '#a855f7',
    benefits: '머리를 맑게 · 피로 회복',
    ingredients: ['테라스 라벤더', '페퍼민트 잎', '레몬 슬라이스'],
  },
];

export const SAMPLE_LIGHT_NOVELS: LightNovelStory[] = [
  {
    id: 'novel-1',
    title: '별빛이 머무는 찻집의 사서',
    author: '하루히 코지 (Haruhi Koji)',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    genre: '판타지 일상 · 힐링',
    readTime: '8분 읽기',
    description: '도심 한구석, 달빛이 비치는 골목 끝에는 밤에만 문을 여는 고양이 사서의 신비로운 찻집이 있습니다.',
    chapters: [
      {
        id: 'ch-1',
        title: '제1장: 밤안개와 캐모마일 향기',
        content: `자정이 넘은 시각, 비에 젖은 아스팔트 길을 따라 걷다 보면 은은한 주황빛 등불이 켜진 작은 나무 문이 나타납니다.

문 위에는 작고 낡은 놋쇠 팻말이 걸려 있었습니다.
[성간 찻집 - 별빛과 기억을 빌려드립니다]

딸랑—

투명한 유리 종소리와 함께 문을 열자, 따뜻한 계피와 볶은 원두 냄새, 그리고 은은한 종이 향이 온몸을 감쌌습니다. 

카운터 너머에는 은색 털을 가진 고양이 한 마리가 멋진 벨벳 조끼를 입고 찻잔을 닦고 있었습니다. 
그는 손님이 들어서자 사람처럼 정중하게 고개를 숙였습니다.

"어서 오십시오, 길 잃은 여행자님. 젖은 코트를 저쪽에 걸어두시고 따뜻한 난로 옆에 앉으시지요."

"말을... 하는 고양이?"

"엄밀히 말하자면 저는 제4도서관의 수석 사서 '루나'입니다. 오늘은 어떤 기억의 온기가 필요해서 찾아오셨습니까?"

루나는 김이 모락모락 피어오르는 푸른빛 찻잔을 내밀었습니다. 찻잔 안에서는 별가루처럼 반짝이는 작은 빛들이 춤추고 있었습니다.`
      },
      {
        id: 'ch-2',
        title: '제2장: 책장 사이에 숨겨진 은하수',
        content: `찻잔을 두 손으로 감싸 쥐자 손끝에서부터 부드러운 온기가 퍼져나갔습니다. 

한 모금 들이키자 달콤한 꿀과 서양배, 그리고 여름밤의 풀잎 향기가 입안 가득 맴돌았습니다. 신기하게도 하루 종일 무겁게 짓누르던 어깨의 긴장이 스르륵 녹아내렸습니다.

"이 차의 이름은 '페르세우스의 유성우'입니다. 지난가을 가장 맑았던 밤에 수확한 찻잎이지요."

루나는 가느다란 꼬리를 살랑이며 천장까지 닿은 거대한 마호가니 책장으로 걸어갔습니다. 
수만 권의 가죽 장정 책들이 꽂혀 있는 책장 사이사이에 작은 유리구슬 조명들이 별처럼 빛나고 있었습니다.

"사람들은 살아가며 너무 많은 것을 서둘러 잊어버리곤 합니다. 하지만 이 도서관에선 당신이 소중히 여겼던 따뜻한 순간들이 모두 책의 형태로 보관되어 있지요."

루나가 손을 뻗어 보랏빛 표지의 얇은 책 한 권을 꺼내 들었습니다.
표지에는 금박으로 [어느 여름날의 소나기와 첫 피아노]라고 적혀 있었습니다.`
      }
    ]
  },
  {
    id: 'novel-2',
    title: '옥상 온실의 작은 드래곤',
    author: '아마노 렌 (Amano Ren)',
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
    genre: '어반 판타지 · 슬로우 라이프',
    readTime: '6분 읽기',
    description: '바쁜 일상에 지쳐 가꾸기 시작한 옥상 온실 정원. 어느 날 화분 속에 손바닥만 한 아기 드래곤이 잠들어 있었습니다.',
    chapters: [
      {
        id: 'ch-1',
        title: '제1장: 로즈마리 잎사귀 속의 잠꾸러기',
        content: `매일 밤 퇴근 후 유일한 위안은 옥상 테라스 정원에 물을 주는 시간이었습니다. 

라벤더와 로즈마리, 바질이 심어진 테라스는 차가운 도시 빌딩 숲 속에서 나만의 작은 오아시스였습니다.

그런데 오늘따라 화분 주변에서 퐁, 퐁 하는 미세한 불꽃 튀는 소리가 들렸습니다.

"응? 벌레인가...?"

화분 흙을 조심스레 들추자, 에메랄드빛 비늘을 가진 손바닥만 한 도마뱀... 아니, 등 뒤에 귀여운 가죽 날개를 접고 쿨쿨 잠든 작은 생명체가 있었습니다.

숨을 쉴 때마다 코끝에서 작은 민트색 불꽃 연기가 퐁퐁 솟아올랐습니다.

"쿠우... 푸우..."

녀석은 인기척을 느끼더니 커다란 금빛 눈망울을 깜빡이며 날개를 파닥였습니다. 
그러고는 내 검지 손가락에 머리를 비비며 고양이처럼 가르랑거렸습니다.`
      }
    ]
  },
  {
    id: 'novel-3',
    title: '비 내리는 날의 만화 카페 402호',
    author: '시온 (Shion)',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    genre: '청춘 일상 · 로맨스',
    readTime: '5분 읽기',
    description: '비가 오는 날마다 찾아가는 낡은 건물 4층의 아늑한 아지트. 그곳에서 만난 따뜻한 비밀들.',
    chapters: [
      {
        id: 'ch-1',
        title: '제1장: 빗방울과 만화책 넘기는 소리',
        content: `창가에 빗방울이 사선으로 부딪치며 리드미컬한 소리를 냈습니다.

창밖의 도시는 흐릿한 수채화처럼 번져 있었고, 나는 푹신한 빈백 소파에 파묻혀 만화책을 한 장씩 넘겼습니다. 

옆 테이블에서는 커피 머신에서 원두를 내리는 규칙적인 소리가 빗소리와 섞여 묘한 화음을 이루었습니다.

"저기, 혹시 3권 다 보셨으면... 다음 권 빌려도 될까요?"

옆자리에서 조심스럽게 건네온 목소리. 고개를 들자 안경을 쓴 동글동글한 눈동자의 그녀가 따뜻한 밀크티 잔을 든 채 웃고 있었습니다.`
      }
    ]
  }
];

export const SAMPLE_MANGA_COMICS: MangaComic[] = [
  {
    id: 'manga-1',
    title: '고양이 정원사의 하루',
    author: '미유키 (Miyuki)',
    coverImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    genre: '힐링 4컷 코믹스',
    description: '테라스 정원을 정성스레 가꾸는 고양이 정원사 나비의 따스한 일상 만화',
    episodes: [
      {
        id: 'ep-1',
        title: '제1화: 봄비와 새싹',
        panels: [
          {
            id: 'p-1',
            image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
            caption: '아침 햇살이 창가를 비출 때, 나비는 밀짚모자를 쓰고 정원으로 나섭니다.',
            dialogue: [
              { speaker: '나비', text: '좋았어! 오늘은 벚꽃 분재에 물을 주는 날이다냥~', side: 'left' }
            ]
          },
          {
            id: 'p-2',
            image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=800&auto=format&fit=crop&q=80',
            caption: '초록색 작은 새싹이 고개를 쏙 내밀고 있었습니다.',
            dialogue: [
              { speaker: '나비', text: '와아! 드디어 라벤더 씨앗에서 싹이 텄어!', side: 'right' }
            ]
          },
          {
            id: 'p-3',
            image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
            caption: '분무기로 촉촉하게 무지개 물방울을 뿌려줍니다.',
            dialogue: [
              { speaker: '나비', text: '쑥쑥 자라서 향기로운 차가 되어주렴~', side: 'left' },
              { speaker: '새싹', text: '(파릇파릇 기분 좋아)', side: 'right' }
            ]
          },
          {
            id: 'p-4',
            image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
            caption: '따뜻한 차 한 잔을 마시며 만족스러운 낮잠을 준비합니다.',
            dialogue: [
              { speaker: '나비', text: '후아암... 정원 가꾸기는 최고의 힐링이야냥 zZZ', side: 'left' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'manga-2',
    title: '사이버펑크 다방: 네온과 커피',
    author: 'K-Zero',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    genre: 'SF · 코지 사이버펑크',
    description: '2088년 네오 서울, 비 내리는 골목 지하 1층에서 따뜻한 핸드드립을 내리는 사이보그 바리스타 이야기.',
    episodes: [
      {
        id: 'ep-1',
        title: '제1화: 비와 아날로그 원두',
        panels: [
          {
            id: 'p-1',
            image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
            caption: '비에 젖은 네온사인이 창문에 홀로그램처럼 번집니다.',
            dialogue: [
              { speaker: '유진', text: '외장 냉각 팬에 빗물이 닿으면 곤란한데...', side: 'left' }
            ]
          },
          {
            id: 'p-2',
            image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
            caption: '오래된 LP 플레이어에서 지직거리는 재즈가 흘러나옵니다.',
            dialogue: [
              { speaker: '바리스타 켄', text: '주문하시겠습니까? 100% 지구산 아라비카 원두입니다.', side: 'right' }
            ]
          }
        ]
      }
    ]
  }
];

export const MUSIC_PLAYLIST: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Midnight Rain Coffee (피아노 로파이)',
    artist: 'Cozy Haven Studio',
    duration: '3:45',
    mood: '새벽 감성 · 아늑한 비',
    coverArt: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80',
    category: 'lofi',
  },
  {
    id: 'track-2',
    title: 'Autumn Terrace Guitar (어쿠스틱 선셋)',
    artist: 'Luna Acoustic',
    duration: '4:12',
    mood: '따스한 노을빛 · 여유',
    coverArt: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80',
    category: 'acoustic',
  },
  {
    id: 'track-3',
    title: 'Kyoto Zen Garden Waves (명상 앰비언트)',
    artist: 'Zen Sanctuary',
    duration: '5:30',
    mood: '마음의 평화 · 청명함',
    coverArt: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    category: 'ambient',
  },
  {
    id: 'track-4',
    title: 'Starlight Dreamscape (신스 로파이)',
    artist: 'Nebula Chill',
    duration: '3:58',
    mood: '몽환적 은하수 · 포근한 침대',
    coverArt: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    category: 'lofi',
  },
  {
    id: 'track-5',
    title: 'Vintage Rhodes Cozy Bar (재즈 발라드)',
    artist: 'The Velvet Trio',
    duration: '4:45',
    mood: '클래식 바 · 따뜻한 위스키',
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    category: 'jazz',
  },
];

export const CINEMA_SCENES: CinemaScene[] = [
  {
    id: 'scene-ghibli-room',
    title: '지브리 감성 빗소리 방 (Rainy Studio)',
    subtitle: '스튜디오 지브리 풍의 따스한 방과 창가 빗방울',
    category: 'anime',
    backdropUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80',
    ambientColor: '#f59e0b',
    description: '창밖에 주룩주룩 내리는 비와 따스한 주황색 램프 아래에서 책을 읽는 평온한 분위기.',
    duration: '무한 루프 앰비언스',
  },
  {
    id: 'scene-cozy-cafe',
    title: '파리 골목길의 비 내리는 카페',
    subtitle: '은은한 샹들리에와 따뜻한 에스프레소 스팀',
    category: 'cozy',
    backdropUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&auto=format&fit=crop&q=80',
    ambientColor: '#d97706',
    description: '창가 너머로 젖은 돌바닥과 우산을 쓴 사람들의 잔잔한 움직임.',
    duration: '4K 시네마틱',
  },
  {
    id: 'scene-milkyway-campfire',
    title: '은하수 아래의 모닥불 (Starlight Campfire)',
    subtitle: '타오르는 불꽃과 쏟아지는 밤하늘 별무리',
    category: 'nature',
    backdropUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1600&auto=format&fit=crop&q=80',
    ambientColor: '#ea580c',
    description: '따뜻하게 타오르는 나무 장작과 고요한 산속의 별빛 야경.',
    duration: '밤하늘 타임랩스',
  },
  {
    id: 'scene-tokyo-night-loft',
    title: '도쿄 미드나잇 로프트 (Tokyo Skyline)',
    subtitle: '도심 고층 통창으로 내려다보는 따스한 불빛',
    category: 'urban',
    backdropUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&auto=format&fit=crop&q=80',
    ambientColor: '#38bdf8',
    description: '도시의 화려함 속에서 나만의 독립된 유리 돔 공간에서 즐기는 감성 야경.',
    duration: '4K 야경 파노라마',
  },
  {
    id: 'scene-kyoto-zen-garden',
    title: '교토 대나무 숲과 젠 정원',
    subtitle: '바람에 사각거리는 대나무 잎과 맑은 연못',
    category: 'nature',
    backdropUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&auto=format&fit=crop&q=80',
    ambientColor: '#10b981',
    description: '청량한 이끼와 대나무 숲에서 지저귀는 새소리와 대나무 물레방아 소리.',
    duration: '젠 가든 루프',
  },
  {
    id: 'scene-snow-cabin',
    title: '눈 내리는 겨울 오두막 (Winter Cabin)',
    subtitle: '하얗게 쌓이는 함박눈과 벽난로 불빛',
    category: 'cozy',
    backdropUrl: 'https://images.unsplash.com/photo-1517299321929-30e70bf3708b?w=1600&auto=format&fit=crop&q=80',
    ambientColor: '#f97316',
    description: '창밖에 소복이 쌓이는 눈을 바라보며 따뜻한 담요를 덮고 쉬는 겨울 감성.',
    duration: '겨울 릴랙스',
  },
];

export const INITIAL_GARDEN_PLANTS: GardenPlant[] = [
  {
    id: 'plant-bonsai',
    name: 'Cherry Blossom Bonsai',
    nameKo: '봄빛 벚꽃 분재',
    species: '사쿠라 분재',
    stage: 4,
    maxStage: 5,
    waterLevel: 85,
    sunLevel: 90,
    happiness: 95,
    plantedDate: '2026-08-10',
    isHarvestable: true,
    harvestYield: '벚꽃 찻잎 (사쿠라 티)',
    icon: '🌸',
    color: '#ec4899',
    description: '사계절 내내 방 안에서 연분홍빛 벚꽃을 피워내는 정성어린 분재 나무입니다.',
    flowerType: 'sakura',
  },
  {
    id: 'plant-succulent',
    name: 'Cozy Moon Succulent',
    nameKo: '달빛 에케베리아 다육이',
    species: '다육 식물',
    stage: 5,
    maxStage: 5,
    waterLevel: 60,
    sunLevel: 80,
    happiness: 90,
    plantedDate: '2026-08-01',
    isHarvestable: false,
    harvestYield: '영롱한 다육 잎',
    icon: '🪴',
    color: '#10b981',
    description: '통통한 잎사귀에 촉촉한 이슬을 머금어 바라보기만 해도 마음이 몽글몽글해집니다.',
    flowerType: 'succulent',
  },
  {
    id: 'plant-lavender',
    name: 'Provence Lavender Pot',
    nameKo: '프로방스 숙면 라벤더',
    species: '라벤더 허브',
    stage: 3,
    maxStage: 5,
    waterLevel: 70,
    sunLevel: 75,
    happiness: 85,
    plantedDate: '2026-08-14',
    isHarvestable: true,
    harvestYield: '라벤더 허브 잎',
    icon: '🪻',
    color: '#a855f7',
    description: '테라스에 바람이 불 때마다 은은하고 시원한 라벤더 향기가 방 안으로 스며듭니다.',
    flowerType: 'lavender',
  },
  {
    id: 'plant-mint',
    name: 'Fresh Tea Mint',
    nameKo: '상쾌한 스피어민트',
    species: '허브 민트',
    stage: 4,
    maxStage: 5,
    waterLevel: 80,
    sunLevel: 85,
    happiness: 92,
    plantedDate: '2026-08-12',
    isHarvestable: true,
    harvestYield: '생 민트 잎 (허브티 용)',
    icon: '🌿',
    color: '#34d399',
    description: '빠르게 무럭무럭 자라며, 잎을 따서 바로 신선한 민트 티로 우려낼 수 있습니다.',
    flowerType: 'mint',
  },
  {
    id: 'plant-chrysanthemum',
    name: 'Autumn Golden Chrysanthemum',
    nameKo: '가을 황금 국화',
    species: '금국화',
    stage: 3,
    maxStage: 5,
    waterLevel: 65,
    sunLevel: 70,
    happiness: 88,
    plantedDate: '2026-08-16',
    isHarvestable: true,
    harvestYield: '황금 국화 꽃잎',
    icon: '🌼',
    color: '#fbbf24',
    description: '가을바람에 고혹적인 향을 머금고 은은하게 피어나는 황금빛 국화 화분입니다.',
    flowerType: 'chrysanthemum',
  },
  {
    id: 'plant-moss',
    name: 'Starry Zen Moss Ball',
    nameKo: '별빛 마리모 이끼 볼',
    species: '수초 이끼 구슬',
    stage: 5,
    maxStage: 5,
    waterLevel: 95,
    sunLevel: 60,
    happiness: 96,
    plantedDate: '2026-07-28',
    isHarvestable: false,
    harvestYield: '이끼의 청량감',
    icon: '🟢',
    color: '#059669',
    description: '유리 비커 속에서 둥둥 떠오르는 귀여운 힐링 마리모. 기분이 좋으면 수면 위로 떠오릅니다.',
    flowerType: 'moss',
  },
];

export const AVAILABLE_SEEDS: {
  id: string;
  nameKo: string;
  species: string;
  icon: string;
  color: string;
  description: string;
  flowerType: 'sakura' | 'succulent' | 'lavender' | 'mint' | 'chrysanthemum' | 'moss';
  harvestYield: string;
}[] = [
  {
    id: 'seed-sakura',
    nameKo: '연분홍 벚꽃 씨앗',
    species: '사쿠라 묘목',
    icon: '🌸',
    color: '#f472b6',
    description: '봄의 설렘을 담아 분홍빛 꽃망울을 터뜨리는 사쿠라 묘목 씨앗',
    flowerType: 'sakura',
    harvestYield: '벚꽃 찻잎',
  },
  {
    id: 'seed-lavender',
    nameKo: '프렌치 라벤더 씨앗',
    species: '라벤더 허브',
    icon: '🪻',
    color: '#c084fc',
    description: '마음을 편안하게 녹여주는 보랏빛 허브 향기',
    flowerType: 'lavender',
    harvestYield: '라벤더 찻잎',
  },
  {
    id: 'seed-mint',
    nameKo: '모로칸 스피어민트 씨앗',
    species: '허브 민트',
    icon: '🌿',
    color: '#34d399',
    description: '청량하고 산뜻한 향을 자랑하는 잎사귀',
    flowerType: 'mint',
    harvestYield: '민트 찻잎',
  },
  {
    id: 'seed-chrysanthemum',
    nameKo: '달빛 금국화 씨앗',
    species: '황금 국화',
    icon: '🌼',
    color: '#fbbf24',
    description: '따뜻한 차로 우려내기 좋은 황금빛 국화 꽃',
    flowerType: 'chrysanthemum',
    harvestYield: '국화 찻잎',
  },
];

export const GARDEN_DECORATIONS: {
  id: string;
  nameKo: string;
  icon: string;
  description: string;
  isActive: boolean;
  category: 'lighting' | 'furniture' | 'water' | 'sound';
}[] = [
  {
    id: 'deco-stone-lantern',
    nameKo: '일본식 석등 (Toro)',
    icon: '🏮',
    description: '어두운 테라스를 따뜻한 호박빛으로 비추는 전통 돌등',
    isActive: true,
    category: 'lighting',
  },
  {
    id: 'deco-fairy-lights',
    nameKo: '요정 전구 스트링 (Fairy Lights)',
    icon: '✨',
    description: '화분 난간을 따라 은하수처럼 반짝이는 미니 전구들',
    isActive: true,
    category: 'lighting',
  },
  {
    id: 'deco-wood-bench',
    nameKo: '원목 티 벤치',
    icon: '🪑',
    description: '차 한 잔을 들고 정원을 바라보며 쉴 수 있는 클래식 벤치',
    isActive: true,
    category: 'furniture',
  },
  {
    id: 'deco-water-fountain',
    nameKo: '대나무 시시오도시 분수',
    icon: '🎋',
    description: '맑은 물이 차오르면 딸깍 소리를 내며 비워지는 젠 분수',
    isActive: true,
    category: 'water',
  },
  {
    id: 'deco-wind-bell',
    nameKo: '유리 풍경 종 (Furin)',
    icon: '🎐',
    description: '산들바람이 불어올 때마다 청아한 쇳소리를 울리는 풍경',
    isActive: true,
    category: 'sound',
  },
  {
    id: 'deco-stepping-stones',
    nameKo: '이끼 디딤돌 길',
    icon: '🪨',
    description: '촉촉한 이끼 사이에 놓인 둥근 자연석 디딤돌',
    isActive: true,
    category: 'furniture',
  },
];

export const GARDEN_EVENTS: {
  id: string;
  title: string;
  subtitle: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weatherChange: 'sakura' | 'fireflies' | 'rain' | 'snow';
  ambientColor: string;
  icon: string;
  description: string;
}[] = [
  {
    id: 'event-sakura-bloom',
    title: '🌸 봄빛 벚꽃 만개 페스티벌',
    subtitle: '연분홍 벚꽃비가 내리는 정원',
    season: 'spring',
    weatherChange: 'sakura',
    ambientColor: '#ec4899',
    icon: '🌸',
    description: '봄바람과 함께 정원 전체에 벚꽃 잎이 휘날리고 식물들의 성장이 2배 빨라집니다.',
  },
  {
    id: 'event-firefly-night',
    title: '✨ 한여름밤의 반딧불이 무도회',
    subtitle: '은은한 초록빛 반딧불의 군무',
    season: 'summer',
    weatherChange: 'fireflies',
    ambientColor: '#10b981',
    icon: '✨',
    description: '어두운 여름밤, 수백 마리의 반딧불이가 정원 화분 사이사이를 영롱하게 밝힙니다.',
  },
  {
    id: 'event-autumn-moon',
    title: '🍁 가을 달맞이 & 국화 축제',
    subtitle: '황금빛 단풍과 풍요로운 만월',
    season: 'autumn',
    weatherChange: 'rain',
    ambientColor: '#f59e0b',
    icon: '🍁',
    description: '선선한 가을밤, 보름달 아래서 향긋한 국화 차를 음미하는 특별한 정원 이벤트입니다.',
  },
  {
    id: 'event-winter-glasshouse',
    title: '❄️ 포근한 겨울 온실 & 첫눈',
    subtitle: '유리창 밖 눈꽃과 따스한 난로',
    season: 'winter',
    weatherChange: 'snow',
    ambientColor: '#38bdf8',
    icon: '❄️',
    description: '소복이 쌓이는 함박눈을 바라보며 온실 안에서 따뜻한 온기를 나누는 겨울 정원.',
  },
];

