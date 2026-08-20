import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

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
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Gemini Story & Light Novel Generation
app.post("/api/gemini/story", async (req, res) => {
  try {
    const { genre, character, mood, prompt, wordCount = 600 } = req.body;
    const ai = getGeminiAI();

    if (!ai) {
      // Fallback cozy story if API key is not yet set
      return res.json({
        title: `${genre || "감성"} - 달빛 아래의 소소한 이야기`,
        content: `창밖으로 은은한 달빛이 스며드는 밤이었습니다. ${character || "주인공"}은 따뜻한 캐모마일 차 한 잔을 찻잔에 따르며 책장을 천천히 넘겼습니다. 

방 안에는 나무 향과 오래된 종이 냄새, 그리고 스피커에서 흘러나오는 잔잔한 피아노 선율이 가득했습니다. 은은한 오렌지빛 스탠드 조명이 유리 테이블 위에 부드러운 그림자를 드리우고 있었습니다.

"오늘 하루도 참 고생 많았어."

작은 속삭임과 함께 테라스 정원에서 바람결에 흔들리는 라벤더 꽃잎 소리가 들려왔습니다. 세상의 모든 분주함이 잠시 멈춘 듯한 평온한 이 순간, 마음속 깊은 곳까지 따스한 위로가 차올랐습니다.`,
        genre: genre || "힐링 일상",
        isAiGenerated: false,
      });
    }

    const systemInstruction = `당신은 감성적이고 따뜻하며 몰입감 넘치는 라이트노벨 및 힐링 소설 작가입니다. 
독자가 포근한 방에서 따뜻한 차를 마시며 편안하게 읽을 수 있는 아름다운 문체로 한국어 단편 스토리를 작성해주세요.
적절한 단락 구분, 생생한 묘사와 따스한 대사를 포함해주세요.`;

    const userPrompt = `다음 설정으로 아늑하고 흥미진진한 라노벨/단편 스토리를 지어주세요:
- 장르: ${genre || "일상 판타지/힐링"}
- 주인공/등장인물: ${character || "마음이 지친 도시 여행자"}
- 분위기: ${mood || "따스하고 포근하며 신비로운"}
- 추가 요청사항: ${prompt || "방 안에서 일어나는 신비롭고 아늑한 순간"}
- 분량: 한국어 약 ${wordCount}자 내외

결과는 반드시 다음 JSON 형식으로만 응답해주세요:
{
  "title": "이야기 제목",
  "genre": "${genre || "힐링/판타지"}",
  "content": "이야기 본문 (줄바꿈 포함)",
  "cozyTip": "이 이야기를 읽을 때 곁들이면 좋은 차 또는 음악 추천 한마디"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.85,
      },
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        title: "은은한 등불 아래의 서재",
        genre: genre || "힐링 일상",
        content: responseText,
        cozyTip: "따뜻한 얼그레이 밀크티와 로파이 음악을 추천합니다.",
      };
    }

    res.json({
      ...parsedData,
      isAiGenerated: true,
    });
  } catch (error) {
    console.error("Story generation error:", error);
    res.status(500).json({
      error: "스토리 생성 중 오류가 발생했습니다.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Gemini Mood & Meditation Guidance
app.post("/api/gemini/guidance", async (req, res) => {
  try {
    const { feeling, meditationType, goal } = req.body;
    const ai = getGeminiAI();

    if (!ai) {
      return res.json({
        affirmation: "오늘 하루도 최선을 다한 당신, 지금 이 순간만큼은 모든 긴장을 내려놓으세요.",
        breathingPace: "4초 들이쉬고, 4초 머물고, 4초 내쉬어보세요.",
        ambientTip: "방의 조명을 앰버 웜톤으로 낮추고 빗소리를 배경음으로 켜보세요.",
        zenThought: "흘러가는 생각은 구름과 같습니다. 붙잡지 않고 그저 바라보세요.",
      });
    }

    const prompt = `사용자의 현재 상태에 맞는 따뜻한 1대1 마음 챙김 명상 가이드와 따뜻한 위로 문장을 작성해주세요:
- 현재 기분/상태: ${feeling || "피곤하고 생각이 많음"}
- 명상 유형: ${meditationType || "마음 안정 호흡"}
- 원하는 목표: ${goal || "편안한 휴식과 긴장 완화"}

다음 JSON 형식으로 응답해주세요:
{
  "affirmation": "마음을 어루만지는 따뜻한 확언 문장 1~2문장",
  "breathingPace": "추천 호흡 리듬과 안내 팁",
  "ambientTip": "방 조명 및 추천 앰비언트 사운드 조합 팁",
  "zenThought": "차분한 젠(Zen) 사색 한 구절"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Guidance error:", error);
    res.status(500).json({ error: "가이드 생성 중 오류가 발생했습니다." });
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
