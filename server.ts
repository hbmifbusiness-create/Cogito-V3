import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { GoogleGenAI } from "@google/genai";

let genAI: any | null = null;
function getAIModel() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genAI = new GoogleGenAI(apiKey as any);
  }
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Route
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemInstruction } = req.body;
    if (!messages) return res.status(400).json({ error: "Missing messages" });

    try {
      const model = getAIModel();
      const chat = model.startChat({
        history: messages.slice(0, -1).map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const lastMessage = messages[messages.length - 1].content;
      const fullPrompt = systemInstruction ? `${systemInstruction}\n\nUser: ${lastMessage}` : lastMessage;
      
      const result = await chat.sendMessage(fullPrompt);
      const responseText = result.response.text();
      res.json({ content: responseText });
    } catch (error: any) {
      console.error("AI Chat failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Analysis Route
  app.post("/api/ai/analyze", async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "Missing image URL" });

    try {
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

      const prompt = "Analyze this image for a design moodboard. Suggest a color palette (hex codes), artistic style (e.g. minimalist, brutalist, art deco), thematic elements (e.g. nature, tech), and 5 descriptive tags. Return in JSON format.";
      
      const model = getAIModel();
      const response = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            { text: prompt }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object" as any,
            properties: {
              palette: { type: "array" as any, items: { type: "string" as any } },
              style: { type: "string" as any },
              theme: { type: "string" as any },
              tags: { type: "array" as any, items: { type: "string" as any } },
            },
            required: ["palette", "style", "theme", "tags"],
          }
        }
      });

      const result = JSON.parse(response.response.text());
      res.json(result);
    } catch (error: any) {
      console.error("AI Analysis failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pinterest OAuth Config
  const PINTEREST_CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
  const PINTEREST_CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
  
  // Clean APP_URL to avoid double slashes
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const PINTEREST_REDIRECT_URI = `${appUrl}/auth/callback`;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: { 
      hasPinterestId: !!PINTEREST_CLIENT_ID, 
      hasPinterestSecret: !!PINTEREST_CLIENT_SECRET,
      appUrl: process.env.APP_URL
    }});
  });

  app.get("/api/auth/pinterest/url", (req, res) => {
    if (!PINTEREST_CLIENT_ID) {
      return res.status(500).json({ error: "Pinterest Client ID not configured" });
    }
    const params = new URLSearchParams({
      client_id: PINTEREST_CLIENT_ID,
      redirect_uri: PINTEREST_REDIRECT_URI,
      response_type: "code",
      scope: "boards:read,pins:read",
      state: "pinterest_auth",
    });
    const url = `https://www.pinterest.com/oauth/?${params.toString()}`;
    res.json({ url });
  });

  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.send(`
        <html><body><script>
          window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: 'No code provided' }, '*');
          window.close();
        </script></body></html>
      `);
    }

    try {
      const auth = Buffer.from(`${PINTEREST_CLIENT_ID}:${PINTEREST_CLIENT_SECRET}`).toString("base64");
      const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: PINTEREST_REDIRECT_URI,
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }

      res.send(`
        <html><body><script>
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
          window.close();
        </script></body></html>
      `);
    } catch (error: any) {
      res.send(`
        <html><body><script>
          window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: ${JSON.stringify(error.message)} }, '*');
          window.close();
        </script></body></html>
      `);
    }
  });

  // Proxy for Pinterest API (to avoid CORS)
  app.get("/api/pinterest/*", async (req, res) => {
    const accessToken = req.headers.authorization;
    if (!accessToken) return res.status(401).json({ error: "Missing access token" });

    const path = req.params[0];
    const url = `https://api.pinterest.com/v5/${path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: accessToken,
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
