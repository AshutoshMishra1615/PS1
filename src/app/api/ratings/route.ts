import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import Rating from "@/models/rating";
import User from "@/models/user";
import SwapRequest from "@/models/swapRequest";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const ratings = await Rating.find()
      .populate("raterId", "name email image")
      .populate("ratedUserId", "name email image")
      .populate("swapRequestId", "offeredSkill wantedSkill")
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
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
    const { swapRequestId, ratedUserId, rating, feedback } = body;

    if (!swapRequestId || !ratedUserId || !rating || !feedback) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has already rated this swap request
    const existingRating = await Rating.findOne({
      raterId: user._id,
      swapRequestId,
    });

    if (existingRating) {
      return NextResponse.json(
        { error: "You have already rated this swap" },
        { status: 400 }
      );
    }

    // Verify the swap request exists and is completed
    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest || swapRequest.status !== "completed") {
      return NextResponse.json(
        { error: "Invalid swap request" },
        { status: 400 }
      );
    }

    const newRating = new Rating({
      raterId: user._id,
      ratedUserId,
      swapRequestId,
      rating,
      feedback,
    });

    await newRating.save();

    // Update the rated user's average rating
    const userRatings = await Rating.find({ ratedUserId });
    const totalRating = userRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / userRatings.length;

    await User.findByIdAndUpdate(ratedUserId, {
      rating: averageRating,
      totalRatings: userRatings.length,
    });

    // Populate the rating for response
    await newRating.populate("raterId", "name email image");
    await newRating.populate("ratedUserId", "name email image");
    await newRating.populate("swapRequestId", "offeredSkill wantedSkill");

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
