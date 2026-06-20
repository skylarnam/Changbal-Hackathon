import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { analyzeWithGemini } from "./geminiAnalyzer";
import { analyzeProductRequestSchema } from "./schemas";

dotenv.config();

const app = express();
const port = Number(process.env.ANALYZER_PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
  });
});

app.post("/analyze-product", async (request, response) => {
  const parsed = analyzeProductRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "INVALID_REQUEST", message: "요청 형식이 올바르지 않아요." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    response.status(503).json({ error: "MISSING_GEMINI_API_KEY", message: "GEMINI_API_KEY가 설정되지 않았어요. 직접 입력 또는 데모 분석을 사용해 주세요." });
    return;
  }

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Analyzer request timed out")), 30000);
  });

  try {
    const result = await Promise.race([analyzeWithGemini(parsed.data, apiKey, process.env.GEMINI_MODEL || "gemini-2.5-flash"), timeout]);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analyzer error";
    response.status(502).json({ error: "ANALYZER_FAILED", message });
  }
});

app.listen(port, () => {
  console.log(`VanityLens analyzer proxy listening on ${port}`);
});
