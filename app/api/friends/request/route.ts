import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { recipientId } = await request.json();
    const requesterId = new ObjectId(session.user.id);
    const recipientObjectId = new ObjectId(recipientId);

    if (requesterId.equals(recipientObjectId)) {
      return NextResponse.json(
        { error: "You cannot add yourself as a friend." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const friendships = client.db().collection("friendships");

    // Check if a friendship already exists
    const existingFriendship = await friendships.findOne({
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
        { status: 409 }
      );
    }

    await friendships.insertOne({
      requester: requesterId,
      recipient: recipientObjectId,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Friend request sent successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Friend request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
