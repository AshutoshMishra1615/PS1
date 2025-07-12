import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  role: "user" | "admin";
  skills: {
    offered: string[];
    wanted: string[];
  };
  rating: number;
  totalRatings: number;
  bio?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    skills: {
      offered: [
        {
          type: String,
          trim: true,
        },
      ],
      wanted: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
