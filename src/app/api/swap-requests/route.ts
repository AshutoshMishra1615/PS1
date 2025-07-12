import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import SwapRequest from "@/models/swapRequest";
import User from "@/models/user";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const swapRequests = await SwapRequest.find({ status: "pending" })
      .populate("requesterId", "name email image rating totalRatings")
      .sort({ createdAt: -1 });

    return NextResponse.json(swapRequests);
  } catch (error) {
    console.error("Error fetching swap requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { offeredSkill, wantedSkill, message } = body;

    if (!offeredSkill || !wantedSkill || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const swapRequest = new SwapRequest({
      requesterId: user._id,
      offeredSkill,
      wantedSkill,
      message,
      status: "pending",
    });

    await swapRequest.save();

    // Populate the requester info for the response
    await swapRequest.populate(
      "requesterId",
      "name email image rating totalRatings"
    );

    return NextResponse.json(swapRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating swap request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
