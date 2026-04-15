export type UUID = string

export interface User {
  id: UUID
  email: string
  username: string
  bio: string | null
  verified: boolean
  banned: boolean
  role: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  tokenType?: string
  user: User
}

export interface Category {
  id: UUID
  name: string
}

export interface Post {
  id: UUID
  author: User
  content: string | null
  mediaUrl: string | null
  mediaType: string | null
  categories: Category[]
  taggedUsers: User[]
  likeCount: number
  createdAt: string
}

export interface ApiMessage {
  success: boolean
  message: string
}

export interface FriendRequest {
  id: UUID
  sender: User
  receiver: User
  status: string
  createdAt: string
}

export interface Conversation {
  id: UUID
  participants: User[]
  createdAt: string
}

export interface Message {
  id: UUID
  conversationId: UUID
  sender: User
  content: string
  sharedPostId: UUID | null
  createdAt: string
  readAt: string | null
}

export interface Story {
  id: UUID
  user: User
  content: string | null
  mediaUrl: string | null
  mediaType: string | null
  createdAt: string
  expiresAt: string
}

export interface AppNotification {
  id: UUID
  type: string
  message: string
  read: boolean
  referenceId: UUID | null
  /** From API: post | conversation | group | user | story | none */
  referenceKind?: string
  createdAt: string
}

export interface GroupChat {
  id: UUID
  name: string
  creator: User
  members: User[]
  createdAt: string
}

export interface GroupMessage {
  id: UUID
  groupChatId: UUID
  sender: User
  content: string
  sharedPostId: UUID | null
  createdAt: string
}

export interface ModerationReport {
  id: UUID
  reason: string
  resolved: boolean
  createdAt: string
  reporter?: User
  reportedUser?: User | null
  reportedPost?: { id: UUID } | null
}
