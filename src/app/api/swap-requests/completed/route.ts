import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import SwapRequest from "@/models/swapRequest";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const completedSwaps = await SwapRequest.find({ status: "completed" })
      .populate("requesterId", "name email image rating totalRatings")
      .populate("providerId", "name email image rating totalRatings")
      .sort({ createdAt: -1 });

    return NextResponse.json(completedSwaps);
  } catch (error) {
    console.error("Error fetching completed swaps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
