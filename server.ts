import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static serving for Book assets in /public/Book
const bookDir = path.join(process.cwd(), "public", "Book");
if (!fs.existsSync(bookDir)) {
  fs.mkdirSync(bookDir, { recursive: true });
}
app.use("/Book", express.static(bookDir));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

// Dynamic SVG Cover Generator for books without cover image
app.get("/api/books/cover-svg", (req, res) => {
  const title = (req.query.title as string) || "Book";
  const author = (req.query.author as string) || "Library Edition";
  const type = (req.query.type as string) || "snovel";
  const isNovel = type === "snovel";

  const primaryColor = isNovel ? "#f59e0b" : "#10b981";
  const bgGradStart = isNovel ? "#1e1b4b" : "#064e3b";
  const bgGradEnd = "#0f172a";
  const badgeText = isNovel ? "LIGHT NOVEL" : "MANGA COMICS";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
    </defs>
    <rect width="600" height="850" fill="url(#bg)"/>
    <rect x="24" y="24" width="552" height="802" rx="14" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-opacity="0.5"/>
    <rect x="36" y="36" width="528" height="778" rx="10" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.15"/>
    
    <rect x="210" y="80" width="180" height="32" rx="16" fill="${primaryColor}" fill-opacity="0.2"/>
    <text x="300" y="101" font-family="-apple-system, sans-serif" font-size="12" font-weight="bold" fill="${primaryColor}" text-anchor="middle" letter-spacing="2">${badgeText}</text>
    
    <circle cx="300" cy="360" r="100" fill="#ffffff" fill-opacity="0.04"/>
    <text x="300" y="390" font-size="90" text-anchor="middle">${isNovel ? '📖' : '🎨'}</text>
    
    <text x="300" y="530" font-family="-apple-system, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">${title.replace(/[<>&"]/g, '')}</text>
    <text x="300" y="575" font-family="-apple-system, sans-serif" font-size="17" fill="#cbd5e1" text-anchor="middle">${author.replace(/[<>&"]/g, '')}</text>
    
    <line x1="200" y1="630" x2="400" y2="630" stroke="${primaryColor}" stroke-width="2" stroke-opacity="0.4"/>
    <text x="300" y="780" font-family="-apple-system, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">My Room Library</text>
  </svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});

// --- Internet Cover Search & Proxy APIs (No .env or API keys needed) ---
app.get("/api/covers/search", async (req, res) => {
  try {
    const query = (req.query.query as string || "").trim();
    if (!query) {
      return res.json({ results: [] });
    }

    const results: Array<{
      id: string;
      title: string;
      author?: string;
      coverUrl: string;
      source: string;
    }> = [];

    const seenUrls = new Set<string>();

    // 1. Search iTunes Store / Apple Books (Very high resolution & fast)
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=ebook&limit=8`;
      const itunesRes = await fetch(itunesUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        if (itunesData.results && Array.isArray(itunesData.results)) {
          for (const item of itunesData.results) {
            let img = item.artworkUrl100 || item.artworkUrl60;
            if (img) {
              // Get 600x600 or 1000x1000 high-res artwork from iTunes CDN
              img = img.replace(/\/\d+x\d+bb\./, '/600x600bb.');
              if (!seenUrls.has(img)) {
                seenUrls.add(img);
                results.push({
                  id: `itunes_${item.trackId || results.length}`,
                  title: item.trackName || item.collectionName || query,
                  author: item.artistName || '',
                  coverUrl: img,
                  source: 'Apple Books',
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("iTunes search error:", e);
    }

    // 2. Search Google Books API (Great for Korean, Japanese, English novels & manga)
    try {
      const gBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`;
      const gRes = await fetch(gBooksUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.items && Array.isArray(gData.items)) {
          for (const item of gData.items) {
            const volInfo = item.volumeInfo || {};
            const imgLinks = volInfo.imageLinks || {};
            let img = imgLinks.extraLarge || imgLinks.large || imgLinks.medium || imgLinks.thumbnail || imgLinks.smallThumbnail;
            if (img) {
              img = img.replace(/^http:\/\//i, 'https://');
              // Request higher quality if possible
              if (img.includes('&zoom=')) {
                img = img.replace(/&zoom=\d+/, '&zoom=2');
              }
              if (!seenUrls.has(img)) {
                seenUrls.add(img);
                results.push({
                  id: `gbooks_${item.id}`,
                  title: volInfo.title || query,
                  author: (volInfo.authors || []).join(', '),
                  coverUrl: img,
                  source: 'Google Books',
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Google Books search error:", e);
    }

    // 3. Search Open Library (Global open repository)
    try {
      const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6`;
      const olRes = await fetch(olUrl);
      if (olRes.ok) {
        const olData = await olRes.json();
        if (olData.docs && Array.isArray(olData.docs)) {
          for (const doc of olData.docs) {
            if (doc.cover_i) {
              const img = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
              if (!seenUrls.has(img)) {
                seenUrls.add(img);
                results.push({
                  id: `ol_${doc.cover_i}`,
                  title: doc.title || query,
                  author: (doc.author_name || []).join(', '),
                  coverUrl: img,
                  source: 'Open Library',
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Open Library search error:", e);
    }

    // 4. Jikan / MyAnimeList Manga API (Manga / Anime / Light Novel titles)
    try {
      const jikanUrl = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=5`;
      const jikanRes = await fetch(jikanUrl);
      if (jikanRes.ok) {
        const jikanData = await jikanRes.json();
        if (jikanData.data && Array.isArray(jikanData.data)) {
          for (const manga of jikanData.data) {
            const img = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || manga.images?.webp?.large_image_url;
            if (img && !seenUrls.has(img)) {
              seenUrls.add(img);
              results.push({
                id: `jikan_${manga.mal_id}`,
                title: manga.title || manga.title_japanese || query,
                author: manga.authors?.map((a: any) => a.name).join(', ') || '',
                coverUrl: img,
                source: 'Anime & Manga DB',
              });
            }
          }
        }
      }
    } catch (e) {
      // Jikan has rate-limits, fail gracefully
    }

    res.json({ results });
  } catch (error) {
    console.error("Cover search failure:", error);
    res.status(500).json({ error: "Failed to search internet covers", results: [] });
  }
});

// Image Proxy to avoid CORS and load external covers smoothly
app.get("/api/covers/proxy", async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).send("URL is required");
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (err) {
    console.error("Image proxy error:", err);
    res.status(500).send("Image proxy failed");
  }
});

// --- Automatic Dialogue Localization & Translation Engine (No .env or API keys needed) ---
app.post("/api/translate", async (req, res) => {
  try {
    const { texts, targetLang = 'ko', sourceLang = 'auto' } = req.body;
    if (!texts || (Array.isArray(texts) && texts.length === 0)) {
      return res.json({ translations: [] });
    }

    const inputList: string[] = Array.isArray(texts) ? texts : [texts];
    const translations: Array<{ original: string; translated: string; lang: string }> = [];

    // Process translations in batches or single joined requests for speed
    for (const text of inputList) {
      const cleanText = (text || "").trim();
      if (!cleanText) {
        translations.push({ original: text, translated: text, lang: targetLang });
        continue;
      }

      let translatedResult = '';

      // 1. Google Translate Public Free Endpoint (Instant, High Quality, Multi-language)
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
        const gRes = await fetch(url, { 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
          } 
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (Array.isArray(gData) && Array.isArray(gData[0])) {
            translatedResult = gData[0].map((item: any) => item[0]).filter(Boolean).join('');
          }
        }
      } catch (err) {
        console.warn("Google translate API fallback:", err);
      }

      // 2. Fallback to MyMemory Public API
      if (!translatedResult) {
        try {
          const sLang = sourceLang === 'auto' ? 'ja' : sourceLang;
          const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${sLang}|${targetLang}`;
          const mmRes = await fetch(mmUrl);
          if (mmRes.ok) {
            const mmData = await mmRes.json();
            if (mmData.responseData && mmData.responseData.translatedText) {
              translatedResult = mmData.responseData.translatedText;
            }
          }
        } catch (mmErr) {
          console.warn("MyMemory fallback error:", mmErr);
        }
      }

      translations.push({
        original: cleanText,
        translated: translatedResult || cleanText,
        lang: targetLang,
      });
    }

    res.json({ translations });
  } catch (error) {
    console.error("Translation API error:", error);
    res.status(500).json({ error: "Translation failed", translations: [] });
  }
});

// --- Book / Manga / SNovel PDF Library Management APIs ---
function scanBookFolder(category: 'snovel' | 'manga') {
  const folderName = category === 'snovel' ? 'SNovel' : 'Manga';
  const categoryPath = path.join(bookDir, folderName);
  const books: any[] = [];

  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
    return books;
  }

  const entries = fs.readdirSync(categoryPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const bookSubdir = path.join(categoryPath, entry.name);
      const subFiles = fs.readdirSync(bookSubdir);

      // Find any PDF file in directory (prefer main.pdf)
      let pdfFileName = subFiles.find((f) => f.toLowerCase() === 'main.pdf');
      if (!pdfFileName) {
        pdfFileName = subFiles.find((f) => f.toLowerCase().endsWith('.pdf'));
      }

      if (!pdfFileName) continue; // No PDF in this folder

      // Automatic Cover Image Matching
      const coverCandidates = [
        'cover.png',
        'cover.jpg',
        'cover.jpeg',
        'cover.webp',
        'cover.svg',
        'thumb.png',
        'thumb.jpg',
        'thumbnail.png',
        'thumbnail.jpg',
      ];
      let coverFileName = subFiles.find((f) => coverCandidates.includes(f.toLowerCase()));
      if (!coverFileName) {
        // Find any image file in the directory
        coverFileName = subFiles.find((f) => /\.(png|jpe?g|webp|svg)$/i.test(f));
      }

      const infoPath = path.join(bookSubdir, 'info.json');
      let meta: any = {
        id: entry.name,
        folderName: entry.name,
        type: category,
        title: entry.name.replace(/_/g, ' '),
        author: 'Library Edition',
        description: `${category === 'snovel' ? '라이트노벨' : '만화책'} 도서`,
        vol: 'Volume 1',
      };

      if (fs.existsSync(infoPath)) {
        try {
          const raw = fs.readFileSync(infoPath, 'utf-8');
          meta = { ...meta, ...JSON.parse(raw) };
        } catch (e) {
          console.error('Failed to parse info.json for', entry.name, e);
        }
      }

      const coverPath = coverFileName
        ? `/Book/${folderName}/${entry.name}/${coverFileName}`
        : `/api/books/cover-svg?title=${encodeURIComponent(meta.title || entry.name)}&author=${encodeURIComponent(meta.author || '')}&type=${category}`;

      books.push({
        ...meta,
        id: entry.name,
        folderName: entry.name,
        type: category,
        pdfPath: `/Book/${folderName}/${entry.name}/${pdfFileName}`,
        coverPath,
      });
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      // Loose PDF file placed directly inside /Book/SNovel or /Book/Manga
      const baseName = entry.name.replace(/\.pdf$/i, '');
      const coverCandidate = entries.find(
        (e) => e.isFile() && e.name.startsWith(baseName) && /\.(png|jpe?g|webp|svg)$/i.test(e.name)
      );

      const coverPath = coverCandidate
        ? `/Book/${folderName}/${coverCandidate.name}`
        : `/api/books/cover-svg?title=${encodeURIComponent(baseName)}&type=${category}`;

      books.push({
        id: baseName,
        folderName: baseName,
        type: category,
        title: baseName.replace(/_/g, ' '),
        author: 'Uploaded PDF',
        vol: 'Volume 1',
        description: `${category === 'snovel' ? '라이트노벨' : '만화책'} 도서`,
        pdfPath: `/Book/${folderName}/${entry.name}`,
        coverPath,
      });
    }
  }

  return books;
}

// Get all books in library
app.get("/api/books", (_req, res) => {
  try {
    const snovels = scanBookFolder('snovel');
    const manga = scanBookFolder('manga');
    res.json({ snovels, manga, total: snovels.length + manga.length });
  } catch (error) {
    console.error("Scan books error:", error);
    res.status(500).json({ error: "Failed to scan book directory" });
  }
});

// Upload a new PDF book to public/Book/SNovel/ or public/Book/Manga/
app.post("/api/books/upload", (req, res) => {
  try {
    const { type, folderId, title, author, description, vol, pdfBase64, coverBase64 } = req.body;

    if (!type || !title || !pdfBase64) {
      return res.status(400).json({ error: "type, title, and pdfBase64 are required" });
    }

    const folderName = type === 'snovel' ? 'SNovel' : 'Manga';
    const safeFolderId = folderId 
      ? folderId.replace(/[^a-zA-Z0-9_-]/g, '_')
      : `Book_${Date.now()}`;
      
    const targetDir = path.join(bookDir, folderName, safeFolderId);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Save main.pdf
    const cleanPdfBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(cleanPdfBase64, 'base64');
    fs.writeFileSync(path.join(targetDir, 'main.pdf'), pdfBuffer);

    // Save cover image if provided, or generate placeholder SVG
    if (coverBase64) {
      const cleanCoverBase64 = coverBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const coverBuffer = Buffer.from(cleanCoverBase64, 'base64');
      fs.writeFileSync(path.join(targetDir, 'cover.png'), coverBuffer);
    } else {
      const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
        <rect width="600" height="850" fill="#1e293b"/>
        <rect x="25" y="25" width="550" height="800" rx="16" fill="none" stroke="#f59e0b" stroke-width="2"/>
        <text x="300" y="380" font-size="70" text-anchor="middle" fill="#ffffff">📖</text>
        <text x="300" y="520" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
        <text x="300" y="560" font-family="sans-serif" font-size="16" fill="#cbd5e1" text-anchor="middle">${author || 'Custom Book'}</text>
        <text x="300" y="780" font-family="sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Cozy Sanctuary Library</text>
      </svg>`;
      fs.writeFileSync(path.join(targetDir, 'cover.png'), defaultSvg);
    }

    // Save info.json
    const infoData = {
      id: safeFolderId,
      folderName: safeFolderId,
      type,
      title,
      author: author || '알 수 없는 작가',
      vol: vol || 'Volume 1',
      description: description || '직접 등록한 PDF 서적입니다.',
      pdfPath: `/Book/${folderName}/${safeFolderId}/main.pdf`,
      coverPath: `/Book/${folderName}/${safeFolderId}/cover.png`,
      isCustomUploaded: true,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(targetDir, 'info.json'), JSON.stringify(infoData, null, 2));

    res.json({ success: true, book: infoData });
  } catch (error) {
    console.error("Upload book error:", error);
    res.status(500).json({ error: "Failed to upload and save book" });
  }
});

// Delete a book
app.delete("/api/books/:type/:id", (req, res) => {
  try {
    const { type, id } = req.params;
    const folderName = type === 'snovel' ? 'SNovel' : 'Manga';
    const targetDir = path.join(bookDir, folderName, id);

    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Book not found" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// Vite Middleware for SPA
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Cozy Sanctuary Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
