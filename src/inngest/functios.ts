import { generateText } from "ai";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ step }) => {
    await step.run("generate-text", async () => {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
      return await generateText({
        model: google("gemini-3-flash-preview"),
        prompt:
          "Write a veg spaghetti recipie with a bit of Indian Spice taste to it (Make Sure it's fully creammy and chessy). For 4 People",
      });
    });
  }
);
