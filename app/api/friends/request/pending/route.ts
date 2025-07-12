import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
// Corrected import path
import { Friendship } from "@/types";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const friendshipsCollection = db.collection<Friendship>("friendships");

    const pendingRequests = await friendshipsCollection
      .aggregate([
        // ... aggregation logic remains exactly the same
        {
          $match: {
            recipient: new ObjectId(session.user.id),
            status: "pending",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "requester",
            foreignField: "_id",
            as: "requesterDetails",
          },
        },
        { $unwind: "$requesterDetails" },
        {
          $project: {
            _id: 1,
            status: 1,
            createdAt: 1,
            requester: {
              _id: "$requesterDetails._id",
              name: "$requesterDetails.name",
              email: "$requesterDetails.email",
              profilePhoto: "$requesterDetails.profilePhoto",
            },
          },
        },
      ])
      .toArray();

    return NextResponse.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
