import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";

// bodyParser must be disabled for formData to be processed
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const users = client.db().collection("users");

    // Find the user and exclude the password field
    const userProfile = await users.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    );

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const body: { [key: string]: string | File } = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }

    // Default to the existing photo from the session
    let profilePhotoUrl = session.user.profilePhoto;

    // Look for 'profilePhotoFile', which matches the key sent from the frontend
    const file = body["profilePhotoFile"] as File;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadStream = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_photos" }, // Using a more consistent folder name
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(stream);
      });

      const result: any = await uploadStream;
      profilePhotoUrl = result.secure_url;
    }

    // The rest of the user data is in the 'profileData' field
    const updates = JSON.parse(body.profileData as string);

    // Prevent critical fields from being updated this way
    delete updates._id;
    delete updates.password;
    delete updates.email;
    delete updates.role;

    const client = await clientPromise;
    const users = client.db().collection("users");

    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          ...updates,
          profilePhoto: profilePhotoUrl, // Save to the correct 'profilePhoto' field
          updatedAt: new Date(),
        },
      }
    );

    // Send back the 'profilePhotoUrl' for the session update on the client
    return NextResponse.json({
      message: "Profile updated successfully",
      profilePhotoUrl: profilePhotoUrl,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
