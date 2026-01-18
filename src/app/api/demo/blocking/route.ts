import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export async function POST() {
  const response = await generateText({
    model: google("gemini-3-flash-preview"),
    prompt:
      "Write a veg spaghetti recipie with a bit of Indian Spice taste to it (Make Sure it's fully creammy and chessy). For 4 People",
  });

  return Response.json({ response });
}
