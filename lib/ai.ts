import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini client if API key is provided
let aiClient: any = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenerativeAI(apiKey);
    console.log("Gemini Generative AI client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini Generative AI client:", error);
  }
}

// ----------------------------------------------------
// Deterministic local mocks for robust zero-setup fallback
// ----------------------------------------------------

function localMockClassifier(text: string) {
  const normalized = text.toLowerCase();
  
  // Keyword lists
  const positiveWords = ["love", "great", "awesome", "gorgeous", "perfect", "good", "amazing", "beautiful", "like", "fast", "speedy", "saved", "intuitive", "clean"];
  const negativeWords = ["bug", "crash", "broken", "fail", "slow", "error", "timeout", "hang", "freeze", "bad", "worst", "terrible", "annoying", "pain", "timeout", "poor"];
  
  let score = 0;
  positiveWords.forEach((word) => {
    if (normalized.includes(word)) score += 0.35;
  });
  negativeWords.forEach((word) => {
    if (normalized.includes(word)) score -= 0.35;
  });

  // Clamp score
  score = Math.max(-1.0, Math.min(1.0, parseFloat(score.toFixed(2))));
  
  let sentiment: "POS" | "NEU" | "NEG" = "NEU";
  if (score > 0.15) sentiment = "POS";
  else if (score < -0.15) sentiment = "NEG";

  // Match simple themes
  const themes: string[] = [];
  let featureArea = "other";

  if (normalized.includes("slow") || normalized.includes("load") || normalized.includes("timeout") || normalized.includes("performance")) {
    themes.push("Performance & Speed");
    featureArea = "system performance";
  }
  if (normalized.includes("login") || normalized.includes("sso") || normalized.includes("auth") || normalized.includes("password")) {
    themes.push("Authentication & Security");
    featureArea = "authentication";
  }
  if (normalized.includes("bill") || normalized.includes("invoice") || normalized.includes("charge") || normalized.includes("price")) {
    themes.push("Billing & Payments");
    featureArea = "billing";
  }
  if (normalized.includes("dashboard") || normalized.includes("ui") || normalized.includes("look") || normalized.includes("design") || normalized.includes("dark mode")) {
    themes.push("User Interface & Design");
    featureArea = "dashboard";
  }
  if (normalized.includes("onboard") || normalized.includes("invite") || normalized.includes("welcome")) {
    themes.push("User Onboarding");
    featureArea = "onboarding";
  }

  if (themes.length === 0) {
    themes.push("General Feedback");
  }

  return {
    sentiment,
    sentimentScore: score,
    themes,
    featureArea,
    rationale: "Classified locally using standard loop keyword matcher.",
  };
}

function localMockEmbedding(text: string): number[] {
  const vec = new Array(1536).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const index = (i * 31) % 1536;
    vec[index] += Math.sin(code + i);
  }
  
  const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return mag > 0 ? vec.map((v) => v / mag) : vec;
}

function cleanJsonString(rawText: string): string {
  return rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

// ----------------------------------------------------
// Public API exports
// ----------------------------------------------------

export async function classifyFeedbackText(text: string) {
  if (!aiClient) {
    return localMockClassifier(text);
  }

  try {
    const model = aiClient.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an AI data classifier for customer feedback. Analyze the following feedback text:
      "${text}"

      Respond ONLY with a strict raw JSON object. Do not include markdown wraps or styling. Use the following schema:
      {
        "sentiment": "POS" or "NEU" or "NEG",
        "sentimentScore": float between -1.0 (extremely negative) and 1.0 (extremely positive),
        "themes": string[] (1-3 short keyword themes like "Billing", "Performance", "UI Customization", "Mobile Support"),
        "featureArea": string (short lowercase label like "onboarding", "billing", "dashboard", "api"),
        "rationale": string (one sentence explanation)
      }
    `;

    const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
    const responseText = result.response.text() || "";
    const cleanedText = cleanJsonString(responseText);
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini classification failed, falling back to local mock:", error);
    return localMockClassifier(text);
  }
}

export async function generateTextEmbedding(text: string): Promise<number[]> {
  if (!aiClient) {
    return localMockEmbedding(text);
  }

  try {
    const model = aiClient.getGenerativeModel({ model: "text-embedding-004" });
    const response = await model.embedContent({ content: { parts: [{ text }] } });
    if (response.embedding?.values) {
      return response.embedding.values;
    }
    throw new Error("Empty embedding response");
  } catch (error) {
    console.error("Gemini embedding failed, falling back to local mock:", error);
    return localMockEmbedding(text);
  }
}

export async function generateVoiceOfCustomerReport(stats: {
  period: string;
  totalCount: number;
  avgRating: number;
  negativeCount: number;
  categories: { name: string; value: number }[];
  recentQuotes: string[];
}) {
  const localFallbackReport = {
    summary: `Voice of the Customer (VoC) report for the period ending ${stats.period}. Ingested ${stats.totalCount} messages with an average score of ${stats.avgRating}/5.0. Critical alerts accounted for ${stats.negativeCount} entries.`,
    themes: stats.categories.map(c => `${c.name}: ${c.value} items`),
    quotes: stats.recentQuotes.length > 0 ? stats.recentQuotes : ["No direct quotes available."],
    actions: ["Investigate peak load speeds.", "Optimize password/auth screens.", "Refine team invite dashboard guides."],
  };

  if (!aiClient) {
    return localFallbackReport;
  }

  try {
    const model = aiClient.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are a Product Manager writing a weekly Voice of the Customer (VoC) summary. Analyze these metrics:
      - Period: ${stats.period}
      - Total Feedbacks: ${stats.totalCount}
      - Average Rating: ${stats.avgRating}/5
      - Critical Issues: ${stats.negativeCount}
      - Categories Breakdown: ${JSON.stringify(stats.categories)}
      - Sample Verbatim Quotes: ${JSON.stringify(stats.recentQuotes)}

      Respond ONLY with a strict raw JSON object (no markdown fences). Use this schema:
      {
        "summary": "1 paragraph summary of the feedback climate",
        "themes": ["theme 1 description", "theme 2 description", "theme 3 description"],
        "quotes": ["quote 1", "quote 2"],
        "actions": ["recommended action 1", "recommended action 2"]
      }
    `;

    const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
    const responseText = result.response.text() || "";
    const cleanedText = cleanJsonString(responseText);
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini report generation failed, falling back to local mock:", error);
    return localFallbackReport;
  }
}

// Coordinate database updates following feedback creation
export async function processFeedbackAI(feedbackId: string, description: string, workspaceId: string) {
  try {
    // 1. Classification
    const classification = await classifyFeedbackText(description);

    await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,
      },
    });

    // 2. Link Themes
    if (classification.themes && classification.themes.length > 0) {
      for (const themeName of classification.themes) {
        let theme = await prisma.theme.findFirst({
          where: { name: themeName, workspaceId },
        });

        if (!theme) {
          const colors = ["#4f46e5", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];
          theme = await prisma.theme.create({
            data: {
              name: themeName,
              workspaceId,
              color: colors[Math.floor(Math.random() * colors.length)],
            },
          });
        }

        await prisma.feedbackTheme.upsert({
          where: {
            feedbackId_themeId: {
              feedbackId,
              themeId: theme.id,
            },
          },
          update: {},
          create: {
            feedbackId,
            themeId: theme.id,
            confidence: 1.0,
          },
        });
      }
    }

    // 3. Embeddings
    const vector = await generateTextEmbedding(description);
    await prisma.embedding.upsert({
      where: { feedbackId },
      update: {
        vector: JSON.stringify(vector),
      },
      create: {
        feedbackId,
        vector: JSON.stringify(vector),
      },
    });

    console.log(`AI Processing complete for feedback record: ${feedbackId}`);
  } catch (err) {
    console.error(`AI post-processing failed for feedback ${feedbackId}:`, err);
  }
}
