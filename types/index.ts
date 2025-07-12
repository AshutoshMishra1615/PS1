export interface User {
  _id: string
  name: string
  email: string
  password?: string
  location?: string
  profilePhoto?: string
  skillsOffered: string[]
  skillsWanted: string[]
  availability: string[]
  isPublic: boolean
  rating: number
  reviewCount: number
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SwapRequest {
  _id: string
  fromUserId: string
  toUserId: string
  offeredSkill: string
  requestedSkill: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id: string
  swapRequestId: string
  reviewerId: string
  reviewedUserId: string
  rating: number
  comment: string
  createdAt: Date
}

export interface AdminMessage {
  _id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'update'
  isActive: boolean
  createdAt: Date
}