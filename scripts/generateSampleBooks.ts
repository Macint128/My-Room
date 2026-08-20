import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function createBookPdf(
  outPath: string,
  title: string,
  subTitle: string,
  author: string,
  pagesContent: { header: string; text: string[] }[]
) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cover Page
  const coverPage = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = coverPage.getSize();

  // Background tone
  coverPage.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.1, 0.12, 0.2),
  });

  // Border frame
  coverPage.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.85, 0.75, 0.45),
    borderWidth: 2,
    color: rgb(0.13, 0.16, 0.25),
  });

  // Title
  coverPage.drawText(title, {
    x: 55,
    y: height - 160,
    size: 22,
    font: fontBold,
    color: rgb(0.98, 0.92, 0.75),
    maxWidth: width - 110,
  });

  // Subtitle
  coverPage.drawText(subTitle, {
    x: 55,
    y: height - 210,
    size: 14,
    font,
    color: rgb(0.8, 0.85, 0.95),
  });

  // Author
  coverPage.drawText(`Author: ${author}`, {
    x: 55,
    y: height - 260,
    size: 12,
    font,
    color: rgb(0.7, 0.75, 0.85),
  });

  coverPage.drawText(`[ Official Cozy Room Library Edition ]`, {
    x: 55,
    y: 80,
    size: 11,
    font,
    color: rgb(0.6, 0.65, 0.75),
  });

  // Content Pages
  for (let i = 0; i < pagesContent.length; i++) {
    const pageData = pagesContent[i];
    const page = pdfDoc.addPage([595, 842]);

    // Paper background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.98, 0.96, 0.92),
    });

    // Top Header
    page.drawText(pageData.header, {
      x: 50,
      y: height - 60,
      size: 14,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.25),
    });

    page.drawLine({
      start: { x: 50, y: height - 70 },
      end: { x: width - 50, y: height - 70 },
      thickness: 1,
      color: rgb(0.8, 0.75, 0.65),
    });

    // Text lines
    let currentY = height - 110;
    for (const line of pageData.text) {
      page.drawText(line, {
        x: 55,
        y: currentY,
        size: 12,
        font,
        color: rgb(0.18, 0.16, 0.14),
        maxWidth: width - 110,
        lineHeight: 18,
      });
      currentY -= 36;
    }

    // Page Number
    page.drawText(`- Page ${i + 1} -`, {
      x: width / 2 - 30,
      y: 40,
      size: 10,
      font,
      color: rgb(0.5, 0.45, 0.4),
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, pdfBytes);
}

function createCoverSvg(
  outPath: string,
  title: string,
  category: string,
  vol: string,
  bgColor: string,
  accentColor: string,
  symbol: string
) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor}" />
        <stop offset="100%" stop-color="#0a0a12" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="#fbbf24" />
      </linearGradient>
    </defs>
    <rect width="600" height="850" fill="url(#bgGrad)"/>
    <rect x="25" y="25" width="550" height="800" rx="16" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.6"/>
    
    <!-- Top badge -->
    <rect x="50" y="60" width="140" height="34" rx="17" fill="${accentColor}" fill-opacity="0.25" stroke="${accentColor}" stroke-width="1.5"/>
    <text x="120" y="82" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">${category}</text>
    
    <!-- Center Graphic Symbol -->
    <circle cx="300" cy="380" r="140" fill="${accentColor}" fill-opacity="0.15" stroke="${accentColor}" stroke-width="2"/>
    <text x="300" y="420" font-size="110" text-anchor="middle" fill="#ffffff">${symbol}</text>
    
    <!-- Title Area -->
    <rect x="40" y="570" width="520" height="180" rx="12" fill="#000000" fill-opacity="0.4" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="300" y="630" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="300" y="675" font-family="sans-serif" font-size="18" font-weight="600" fill="${accentColor}" text-anchor="middle">${vol}</text>
    <text x="300" y="715" font-family="sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">Official Light Novel / Manga Edition</text>
    
    <text x="300" y="800" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Cozy Sanctuary Library</text>
  </svg>`;

  fs.writeFileSync(outPath, svg);
}

async function main() {
  const baseDir = path.join(process.cwd(), 'public', 'Book');
  
  const books = [
    {
      dir: path.join(baseDir, 'SNovel', 'Tensura1'),
      type: 'snovel',
      pdfTitle: 'That Time I Got Reincarnated as a Slime Vol 1',
      titleKo: '전생했더니 슬라임이었던 건에 대하여 1권',
      author: 'Fuse',
      vol: 'Volume 01 - Slime Awakening',
      category: 'LIGHT NOVEL',
      bg: '#1e3a8a',
      accent: '#38bdf8',
      symbol: '💧',
      description: '평범한 회사원이 이세계에서 최약체 슬라임으로 환생하면서 시작되는 판타지 대서사시.',
      pages: [
        {
          header: 'Chapter 1: Reincarnated in the Cave of Veldora',
          text: [
            'Darkness. Endless, quiet darkness surrounded me as consciousness drifted back.',
            'I could not feel my hands, my feet, or even my breath. Yet I could clearly think.',
            '"Wait... why am I cold and squishy? Did my surgery go wrong?"',
            'I tried to wiggle and bumped into a smooth stalagmite inside the subterranean cave.',
            'A voice echoed in my head: [Unique Skill: Predator and Great Sage acquired successfully.]',
          ]
        },
        {
          header: 'Chapter 1 (Continued): Encounter with the Storm Dragon',
          text: [
            'Deep within the cavern, a tremendous aura radiated like rolling thunder.',
            'Before me stood a colossal dragon sealed in a radiant amber barrier.',
            '"Gwahahaha! Little slime, why dost thou not tremble before Veldora the Storm Dragon?"',
            '"Well, honestly... I cannot see your terrifying face without eyes, sir dragon!"',
            'Thus began an unexpected friendship between a blue slime and the mighty dragon.',
          ]
        },
        {
          header: 'Chapter 2: The Great Goblin Village Crisis',
          text: [
            'Emerging from the cave into the lush Jura Forest, the warm sunlight warmed my jelly body.',
            'A small band of trembling green goblins fell to their knees before me.',
            '"Great one! Please lend us your power to protect our clan from the direwolves!"',
            'Looking at their ragged clothes and earnest eyes, I made my decision.',
            '"Very well. Stand tall, goblins of Jura. Today, we build our new haven together."',
          ]
        },
        {
          header: 'Chapter 3: The Birth of Tempest Kingdom',
          text: [
            'With the naming of Rimuru Tempest, ripples spread across all demon lords and kingdoms.',
            'The aroma of hot medicinal tea brewed from hipokute herbs filled the new village hall.',
            'Under the starlit sky, humans, monsters, and spirits celebrated in harmony.',
            'Our peaceful town had only just begun its legendary journey across the world.',
          ]
        }
      ]
    },
    {
      dir: path.join(baseDir, 'SNovel', 'Overlord1'),
      type: 'snovel',
      pdfTitle: 'Overlord Vol 1: The Undead King',
      titleKo: '오버로드 1권: 불사자의 왕',
      author: 'Kugane Maruyama',
      vol: 'Volume 01 - The Undead King',
      category: 'LIGHT NOVEL',
      bg: '#4c0519',
      accent: '#f43f5e',
      symbol: '👑',
      description: '서비스 종료를 맞이한 DMMO-RPG 유그드라실. 길드 본거지 나자릭 지하대분묘와 함께 이세계로 전이된 마왕 모몬가.',
      pages: [
        {
          header: 'Prologue: The Final Countdown of Yggdrasil',
          text: [
            'The clock ticked toward 23:59:59. The great magical realm of Yggdrasil was ending.',
            'Momonga sat alone on the Throne of Kings in the Great Tomb of Nazarick.',
            'Surrounded by the banners of his 41 departed comrades, he closed his skeletal eyes.',
            '"It was a truly magnificent game. Thank you for everything, everyone."',
            '00:00:00 passed... but the logout screen never came.',
          ]
        },
        {
          header: 'Chapter 1: The Awakening of Nazarick',
          text: [
            'Albedo, the Overseer of Floor Guardians, gently bowed with a radiant smile.',
            '"Lord Momonga, is something amiss? We await your supreme command."',
            'Her voice was not synthetic NPC speech--it carried warmth, pulse, and devotion.',
            'Momonga stood up, his dark robe billowing in the mystical breeze.',
            '"Summon all floor guardians to the 6th floor amphitheater at once."',
          ]
        },
        {
          header: 'Chapter 2: The Oath of Absolute Loyalty',
          text: [
            'Shalltear, Demiurge, Cocytus, Aura, and Mare knelt in immaculate unison.',
            '"To the Supreme Being who stayed with us until the end, we offer our lives and souls!"',
            'Momonga gazed over the vast starry landscape outside Nazarick.',
            '"Very well. Let the world know the glory of Ainz Ooal Gown!"',
          ]
        }
      ]
    },
    {
      dir: path.join(baseDir, 'Manga', 'Frieren1'),
      type: 'manga',
      pdfTitle: 'Sousou no Frieren Chapter 1',
      titleKo: '장송의 프리렌 1권 (Manga)',
      author: 'Kanehito Yamada',
      vol: 'Chapter 01 - The Journey Begins',
      category: 'MANGA COMIC',
      bg: '#064e3b',
      accent: '#34d399',
      symbol: '🌿',
      description: '마왕을 쓰러뜨린 용사 일행의 마법사 프리렌. 천 년을 사는 엘프가 인간의 마음을 찾아 떠나는 잔잔한 여정.',
      pages: [
        {
          header: 'Scene 1: The Return of the Hero Party',
          text: [
            '[ PANEL 1: The grand castle gate opens as the citizens cheer joyously. ]',
            'Himmel the Hero smiles gently: "We did it, everyone. Peace has returned to the world."',
            'Frieren blinks calmly, holding her magical staff: "It was only a ten-year journey."',
            'Eisen the Dwarf laughs: "Ten years is a lifetime for men, little elf!"',
            '[ PANEL 2: The Era Meteor Shower blazes across the twilight sky. ]',
            'Frieren: "I know a better place to see these stars. Let us meet again in 50 years."',
          ]
        },
        {
          header: 'Scene 2: Fifty Years Later',
          text: [
            '[ PANEL 1: Frieren returns to the capital, unchanged by a single day. ]',
            'Himmel, now an old man with a gentle beard, greets her warmly: "You haven\'t changed at all."',
            'Frieren: "I brought the meteor viewing spot I promised."',
            '[ PANEL 2: The four heroes look up at the brilliant night sky together one final time. ]',
            'Himmel: "Thank you, Frieren. Traveling with you was the greatest treasure of my life."',
          ]
        },
        {
          header: 'Scene 3: Tears in the Rain and A New Vow',
          text: [
            '[ PANEL 1: The funeral of Himmel the Hero under gentle falling rain. ]',
            'Frieren sheds a single tear: "I knew humans have short lives... why didn\'t I try to know him better?"',
            '[ PANEL 2: Frieren picks up her staff with a determined, gentle gaze. ]',
            'Fern: "Frieren-sama, where are we heading now?"',
            'Frieren: "To Aureole, the land where souls rest. To speak with Himmel once again."',
          ]
        }
      ]
    },
    {
      dir: path.join(baseDir, 'Manga', 'SpyFamily1'),
      type: 'manga',
      pdfTitle: 'Spy x Family Mission 1',
      titleKo: '스파이 패밀리 1권 (Manga)',
      author: 'Tatsuya Endo',
      vol: 'Mission 01 - Operation Strix',
      category: 'MANGA COMIC',
      bg: '#14532d',
      accent: '#86efac',
      symbol: '🕵️',
      description: '세계 평화를 위해 위장 가족을 만든 일류 스파이 황혼, 초능력자 딸 아냐, 암살자 아내 요르의 패밀리 코미디.',
      pages: [
        {
          header: 'Mission 1: Twilight and the Orphanage',
          text: [
            '[ PANEL 1: Agent Twilight receives a top-secret cipher from WISE. ]',
            'Cipher: "Operation Strix: Infiltrate Eden Academy. You must create a family within 7 days."',
            'Twilight sighs: "Marriage and child in one week? The mission comes first."',
            '[ PANEL 2: Twilight enters the eccentric orphanage in Berlint. ]',
            'Anya reading his mind: (Gasp! A real handsome spy! Waku waku exciting!)',
            'Anya: "Papa! Anya loves peanuts! Anya is very smart, please adopt me!"',
          ]
        },
        {
          header: 'Mission 1 (Continued): The Entrance Exam Miracle',
          text: [
            '[ PANEL 1: Anya takes the rigorous Eden Academy entrance test. ]',
            'Anya reading examiner\'s mind: (Answers are B, C, A, D!)',
            '[ PANEL 2: The acceptance board announcement. ]',
            'Twilight checks the paper: "Score: Exactly 31 points (Passing threshold: 30)!"',
            'Twilight holds Anya in relief: "We did it, Anya. Phase one complete."',
          ]
        }
      ]
    }
  ];

  for (const b of books) {
    if (!fs.existsSync(b.dir)) {
      fs.mkdirSync(b.dir, { recursive: true });
    }

    const pdfPath = path.join(b.dir, 'main.pdf');
    const coverPath = path.join(b.dir, 'cover.png');
    const infoPath = path.join(b.dir, 'info.json');

    console.log(`Generating PDF for: ${b.pdfTitle}...`);
    await createBookPdf(pdfPath, b.pdfTitle, b.vol, b.author, b.pages);

    createCoverSvg(coverPath, b.titleKo, b.category, b.vol, b.bg, b.accent, b.symbol);

    const infoData = {
      id: path.basename(b.dir),
      title: b.titleKo,
      titleEn: b.pdfTitle,
      author: b.author,
      type: b.type,
      category: b.category,
      vol: b.vol,
      description: b.description,
      pdfPath: `/Book/${b.type === 'snovel' ? 'SNovel' : 'Manga'}/${path.basename(b.dir)}/main.pdf`,
      coverPath: `/Book/${b.type === 'snovel' ? 'SNovel' : 'Manga'}/${path.basename(b.dir)}/cover.png`,
      pageCount: b.pages.length + 1,
    };
    fs.writeFileSync(infoPath, JSON.stringify(infoData, null, 2));
  }

  console.log('✨ All sample Book PDFs, covers, and metadata created successfully!');
}

main().catch(console.error);
