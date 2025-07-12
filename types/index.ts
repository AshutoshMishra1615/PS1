import { ObjectId } from "mongodb";

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  location?: string;
  profilePhoto?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  rating: number;
  reviewCount: number;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SwapRequest {
  _id: string;
  fromUserId: string;
  toUserId: string;
  offeredSkill: string;
  requestedSkill: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  _id: string;
  swapRequestId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface AdminMessage {
  _id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "update";
  isActive: boolean;
  createdAt: Date;
}

export interface Friendship {
  _id?: ObjectId; // MongoDB's default unique identifier for each document
  requester: ObjectId; // The ObjectId of the user who sent the friend request
  recipient: ObjectId; // The ObjectId of the user who received the friend request
  status: "pending" | "accepted" | "declined" | "blocked"; // The current status of the friendship
  createdAt: Date; // Timestamp for when the request was created
  updatedAt?: Date; // Optional: Timestamp for when the status was last updated
}
export interface Message {
  _id?: ObjectId;
  conversationId: ObjectId; // Links messages to a friendship
  senderId: ObjectId;
  content: string;
  createdAt: Date;
}
