import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
// Corrected import path
import { Friendship } from "@/types";

export async function GET(request: NextRequest) {
  // ... function logic remains exactly the same
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const currentUserId = new ObjectId(session.user.id);

    const friendships = await db
      .collection<Friendship>("friendships")
      .find({
        status: "accepted",
        $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      })
      .toArray();

    const friendIds = friendships.map((f) => {
      return f.requester.equals(currentUserId) ? f.recipient : f.requester;
    });

    const friends = await db
      .collection("users")
      .find({ _id: { $in: friendIds } }, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json(friends);
  } catch (error) {
    console.error("Error fetching friends list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
