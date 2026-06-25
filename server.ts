import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle base64 images
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Initialize Gemini client on server-side
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API Route for image analysis
  app.post("/api/understand", async (req: express.Request, res: express.Response) => {
    try {
      const { image, mimeType } = req.body;
      if (!image || !mimeType) {
        res.status(400).json({ error: "Missing image or mimeType in request body" });
        return;
      }

      if (!apiKey) {
        res.status(500).json({
          error: "GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets.",
        });
        return;
      }

      // Query Gemini 3.5-flash model
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: image,
            },
          },
          "Identify this image, provide instructions, and assess safety or uncertainty.",
        ],
        config: {
          systemInstruction: `You are "Lookout", a meticulous point-and-understand assistant that helps users identify unfamiliar things (e.g. control panels, signs, error screens, confusing forms, unlabeled items) with strict safety guardrails.

Your analysis must adhere to these absolute rules:
1. Express uncertainty honestly: If the image is blurry, out of focus, extremely ambiguous, or you cannot see it clearly, you MUST set "confidence" to "Low", describe what you can see but clearly explain in "confidenceReason" why it is too blurry or unclear to be sure. Never guess confidently.
2. Safety Scoping (Critical): If the image contains high-stakes domains—such as medication/pills, medical devices, medical dosing, electrical panels/wiring, open gas lines, structural integrity hazards, fire risks, or chemical labels that could cause severe physical injury or death if misidentified—you MUST set "safetyTriggered" to true.
   - For safety-triggered cases, do NOT provide any definitive instructions, dosages, or advice. Instead, set "whatThisIs" to a brief neutral description (e.g., "Unidentified blue pills in bottle" or "Residential electrical panel"), set "whatToDoNext" to exactly: ["Consult a qualified professional immediately.", "Do not handle or ingest without professional verification."] and explain the risk in "safetyExplanation".
3. Never fabricate: If you cannot identify the object at all, set "whatThisIs" to "I'm not sure what this is" and "confidence" to "Low" with an honest reason.

Ensure you return a valid JSON object matching the requested schema.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              whatThisIs: {
                type: Type.STRING,
                description: "A clear one-line identification of the object or situation.",
              },
              whatToDoNext: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "1-3 concrete, actionable steps the user should take.",
              },
              confidence: {
                type: Type.STRING,
                enum: ["High", "Medium", "Low"],
                description: "Confidence rating of the identification.",
              },
              confidenceReason: {
                type: Type.STRING,
                description: "A clear one-line explanation of why this confidence level was assigned.",
              },
              safetyTriggered: {
                type: Type.BOOLEAN,
                description: "Set to true if this involves high-stakes domains (medication, electricity, gas, hazards, bodily harm).",
              },
              safetyExplanation: {
                type: Type.STRING,
                description: "Explains why professional human help is required and why definitive advice cannot be given.",
              },
            },
            required: [
              "whatThisIs",
              "whatToDoNext",
              "confidence",
              "confidenceReason",
              "safetyTriggered",
              "safetyExplanation",
            ],
          },
        },
      });

      if (!response.text) {
        throw new Error("No response text returned from the Gemini API");
      }

      const result = JSON.parse(response.text.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error in /api/understand:", error);
      res.status(500).json({ error: error.message || "Failed to analyze the image." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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

startServer().catch(console.error);
