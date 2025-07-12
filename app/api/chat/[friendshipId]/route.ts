import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Message } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { friendshipId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const messagesCollection = db.collection<Message>("messages");

    const messages = await messagesCollection
      .find({ conversationId: new ObjectId(params.friendshipId) })
      .sort({ createdAt: 1 }) // Get messages in chronological order
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
