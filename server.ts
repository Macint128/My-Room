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
    <text x="300" y="780" font-family="-apple-system, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">Cozy Sanctuary Library</text>
  </svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
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
