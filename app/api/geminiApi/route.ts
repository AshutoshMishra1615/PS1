import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "test"; // your DB name from MongoDB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ aiText: "Please log in to use the assistant." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { message } = await req.json();

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    const userDoc = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!userDoc) {
      return new Response(
        JSON.stringify({ aiText: "Your profile was not found in the system." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      name = "User",
      skillsOffered = [],
      skillsWanted = [],
      availability = "Not provided",
      location = "Not provided",
    } = userDoc;

    const prompt = `
You are a helpful assistant for the Skill Swap Platform.

User Info:
- Name: ${name}
- Skills Offered: ${skillsOffered.join(", ") || "None"}
- Skills Wanted: ${skillsWanted.join(", ") || "None"}
- Availability: ${availability}
- Location: ${location}

Your job:
- Help users navigate the Skill Swap platform.
- Answer questions about: skill offering, requesting swaps, accepting/rejecting swaps, profile visibility, ratings, feedback, and finding users by skill.
- If the user asks anything unrelated to the platform, say: "I can only help with Skill Swap-related questions."

Reply in under 60 words. No markdown or special formatting.

User's question:
"${message}"
`;

    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
    const resp = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    const aiText = resp.text;

    return new Response(JSON.stringify({ aiText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("🔥 Gemini API Error:", err);
    return new Response(
      JSON.stringify({ aiText: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
