import mongoose, { Schema, Document } from "mongoose";

export interface ISwapRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  offeredSkill: string;
  wantedSkill: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const SwapRequestSchema: Schema = new Schema(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredSkill: {
      type: String,
      required: true,
      trim: true,
    },
    wantedSkill: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SwapRequest ||
  mongoose.model<ISwapRequest>("SwapRequest", SwapRequestSchema);
