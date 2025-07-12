import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/user";
import { z } from "zod";

// Zod schema for validating profile updates
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  location: z.string().optional(),
  availability: z.string().optional(),
  skillsOffered: z.array(z.string()), // Array of Skill IDs
  skillsWanted: z.array(z.string()), // Array of Skill IDs
});

// GET handler to fetch the current user's profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id)
      .populate("skillsOffered")
      .populate("skillsWanted")
      .lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: `Internal Server Error:  ${error}` },
      { status: 500 }
    );
  }
}

// PUT handler to update the user's profile
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      validation.data,
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { message: `Internal Server Error : ${error}` },
      { status: 500 }
    );
  }
}
