import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Friendship } from "@/types"; // Assuming Friendship interface is in @/types/index.ts
import { io } from "socket.io-client"; // Import the socket.io client to connect to your WebSocket server

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Get the ID of the user to be friended from the request body
    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required." },
        { status: 400 }
      );
    }

    const requesterId = new ObjectId(session.user.id);
    const recipientObjectId = new ObjectId(recipientId);

    // 3. Prevent a user from friending themselves
    if (requesterId.equals(recipientObjectId)) {
      return NextResponse.json(
        { error: "You cannot send a friend request to yourself." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const friendshipsCollection = db.collection<Friendship>("friendships");

    // 4. Check if a friendship (in any state) already exists between these two users
    const existingFriendship = await friendshipsCollection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientObjectId },
        { requester: recipientObjectId, recipient: requesterId },
      ],
    });

    if (existingFriendship) {
      return NextResponse.json(
        {
          error: "A friend request already exists or you are already friends.",
        },
        { status: 409 } // 409 Conflict is a good status code here
      );
    }

    // 5. Create the new friendship document with a 'pending' status
    const newFriendship: Friendship = {
      requester: requesterId,
      recipient: recipientObjectId,
      status: "pending",
      createdAt: new Date(),
    };

    await friendshipsCollection.insertOne(newFriendship);

    // 6. Send a real-time notification to the recipient
    try {
      // Establish a temporary connection to your WebSocket server to send the notification
      const socket = io("http://localhost:3001", {
        reconnection: false,
      });

      const notificationPayload = {
        message: `You have a new friend request from ${
          session.user.name || "a new user"
        }.`,
        sender: {
          name: session.user.name,
          profilePhoto: session.user.profilePhoto,
        },
      };

      // Emit an event to the specific recipient's "room" (which is their user ID)
      socket.emit("send_notification", {
        recipientId: recipientObjectId.toString(),
        notification: notificationPayload,
      });

      // Disconnect after sending
      socket.disconnect();
    } catch (socketError) {
      console.error("Socket.io emit error:", socketError);
      // Don't fail the entire request if the socket connection fails,
      // but log it for debugging. The friend request is already saved.
    }

    // 7. Return a success response
    return NextResponse.json(
      { message: "Friend request sent successfully." },
      { status: 201 } // 201 Created is the appropriate status code
    );
  } catch (error) {
    console.error("Friend request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
