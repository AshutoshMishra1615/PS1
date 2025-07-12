// app/api/geminiApi/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path if needed
import { MongoClient } from "mongodb";
import axios from "axios";

const MONGODB_URI = process.env.MONGODB_URI!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const DB_NAME = process.env.DB_NAME!; // change if needed

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response(
      JSON.stringify({ aiText: "Please log in to use the assistant." }),
      { status: 401 }
    );
  }

  const { message } = await req.json();

  try {
    // Connect to MongoDB and fetch user data
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const userDoc = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!userDoc) {
      return new Response(
        JSON.stringify({
          aiText:
            "Couldn't find your profile. Please complete your profile first.",
        }),
        { status: 404 }
      );
    }

    const prompt = `
You are a helpful assistant for the Skill Swap platform.

User Info:
- Name: ${userDoc.name || "Anonymous"}
- Skills Offered: ${userDoc.skillsOffered?.join(", ") || "None"}
- Skills Wanted: ${userDoc.skillsWanted?.join(", ") || "None"}
- Availability: ${userDoc.availability || "Not provided"}

Your job:
- Help users navigate the platform
- Guide them on: adding skills, requesting swaps, accepting/rejecting swaps, leaving feedback, privacy settings, etc.
- If they ask anything unrelated to the platform, say: "I can only help with Skill Swap-related questions."

Only reply in under 60 words, no markdown, no formatting.

User's question:
"${message}"
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const aiText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I can only help with Skill Swap-related questions.";

    return new Response(JSON.stringify({ aiText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Gemini API Error:", err.message);
    return new Response(
      JSON.stringify({ aiText: "An error occurred. Please try again." }),
      {
        status: 500,
      }
    );
  }
}
