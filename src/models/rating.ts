import mongoose, { Schema, Document } from "mongoose";

export interface IRating extends Document {
  raterId: mongoose.Types.ObjectId;
  ratedUserId: mongoose.Types.ObjectId;
  swapRequestId: mongoose.Types.ObjectId;
  rating: number;
  feedback: string;
  createdAt: Date;
}

const RatingSchema: Schema = new Schema(
  {
    raterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    swapRequestId: {
      type: Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one rating per swap request per user
RatingSchema.index({ raterId: 1, swapRequestId: 1 }, { unique: true });

export default mongoose.models.Rating ||
  mongoose.model<IRating>("Rating", RatingSchema);
