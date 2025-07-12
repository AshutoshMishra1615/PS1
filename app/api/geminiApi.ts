import axios from "axios";
import type { NextRequest, NextResponse } from "next/server";

// Use process.env for Next.js
const API_KEY = process.env.GEMINI_API_KEY;

// Type for the request body
interface GeminiRequestBody {
  message: string;
}

export async function generateGeminiResponse(req: NextRequest) {
  try {
    const body: GeminiRequestBody = await req.json();
    const { message } = body;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a great thermal Professor Who is expert in anything releated to thermal specially peltier module and seeback effect\n\nOnly answer questions related to:\n- Thermal Study\n- seeback effect\n- peltier module\n- greetings (hi hello how are you etc)\n\nIf the user's input is irrelevant, respond with: \"I can only assist with Thermal queries.\"\nonly reply within 50 words and dont use any type of text format\n\nNow, analyze the following message and respond professionall:\n\n\"${message}\"\n`,
              },
            ],
          },
        ],
      }
    );

    const aiText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I can only assist with job-related queries.";

    return new Response(JSON.stringify({ aiText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    let errorMsg = "Error processing request. Please try again.";
    if (typeof error === "object" && error && "message" in error) {
      errorMsg = (error as any).message;
    }
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ aiText: errorMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
