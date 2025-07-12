import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Message } from "@/types";
import { io } from "socket.io-client";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const messagesCollection = db.collection<Message>("messages");

    // Create the new message document with correct types
    const newMessage: Message = {
      _id: new ObjectId(),
      conversationId: new ObjectId(conversationId),
      senderId: new ObjectId(session.user.id),
      content: content,
      createdAt: new Date(),
    };

    // Insert the message into the database
    await messagesCollection.insertOne(newMessage);

    // After successfully saving, emit a socket event to broadcast the new message
    try {
      const socket = io("http://localhost:3001", { reconnection: false });
      // The API route now sends the full, saved message object to the socket server
      socket.emit("send_message", {
        conversationId: conversationId,
        message: newMessage,
      });
      socket.disconnect();
    } catch (socketError) {
      console.error("Socket.io emit error after saving message:", socketError);
      // Do not fail the request if the socket connection fails, as the message is already saved.
    }

    // Return the newly created message to the original sender
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
