import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Friendship } from "@/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    const { requestId } = params;

    if (!["accepted", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided." },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID format." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const friendshipsCollection = db.collection<Friendship>("friendships");
    const friendshipId = new ObjectId(requestId);
    const currentUserId = new ObjectId(session.user.id);

    const result = await friendshipsCollection.updateOne(
      { _id: friendshipId, recipient: currentUserId, status: "pending" },
      {
        $set: {
          status: status as "accepted" | "declined",
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Friend request not found or permission denied." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Request successfully ${status}.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
