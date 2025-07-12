import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import SwapRequest from "@/models/swapRequest";
import User from "@/models/user";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const swapRequest = await SwapRequest.findById(params.id);

    if (!swapRequest) {
      return NextResponse.json(
        { error: "Swap request not found" },
        { status: 404 }
      );
    }

    if (swapRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Swap request is not pending" },
        { status: 400 }
      );
    }

    // Update the swap request status
    swapRequest.status = "accepted";
    await swapRequest.save();

    return NextResponse.json({ message: "Swap request accepted successfully" });
  } catch (error) {
    console.error("Error accepting swap request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
