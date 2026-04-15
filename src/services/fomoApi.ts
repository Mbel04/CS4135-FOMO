import type {
  ApiMessage,
  AppNotification,
  AuthResponse,
  Category,
  Conversation,
  FriendRequest,
  GroupChat,
  GroupMessage,
  Message,
  ModerationReport,
  Post,
  Story,
  User,
  UUID,
} from '../types/models'
import { apiClient } from './apiClient'

const json = <T>(p: Promise<{ data: T }>) => p.then((r) => r.data)

export const authApi = {
  login: (email: string, password: string) =>
    json<AuthResponse>(apiClient.post('/api/v1/auth/login', { email, password })),
  register: (body: { email: string; username: string; password: string }) =>
    json<AuthResponse>(apiClient.post('/api/v1/auth/register', body)),
}

export const userApi = {
  me: () => json<User>(apiClient.get('/api/v1/users/me')),
  updateMe: (body: { username?: string; bio?: string }) =>
    json<User>(apiClient.put('/api/v1/users/me', body)),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    json<ApiMessage>(apiClient.put('/api/v1/users/me/password', body)),
  savedPosts: () => json<Post[]>(apiClient.get('/api/v1/users/me/saved-posts')),
}

export const postsApi = {
  feed: () => json<Post[]>(apiClient.get('/api/v1/posts')),
  get: (id: UUID) => json<Post>(apiClient.get(`/api/v1/posts/${id}`)),
  create: (params: {
    content?: string
    categoryIds?: UUID[]
    /** User IDs (UUID) or usernames, comma/space-separated in the UI */
    taggedUserIds?: string[]
    media?: File | null
  }) => {
    const fd = new FormData()
    if (params.content) fd.append('content', params.content)
    params.categoryIds?.forEach((id) => fd.append('categoryIds', id))
    params.taggedUserIds?.forEach((id) => fd.append('taggedUserIds', id))
    if (params.media) fd.append('media', params.media)
    return json<Post>(apiClient.post('/api/v1/posts', fd))
  },
  remove: (id: UUID) => json<ApiMessage>(apiClient.delete(`/api/v1/posts/${id}`)),
  like: (id: UUID) => json<ApiMessage>(apiClient.post(`/api/v1/posts/${id}/like`)),
  unlike: (id: UUID) => json<ApiMessage>(apiClient.delete(`/api/v1/posts/${id}/like`)),
  save: (id: UUID) => json<ApiMessage>(apiClient.post(`/api/v1/posts/${id}/save`)),
  unsave: (id: UUID) => json<ApiMessage>(apiClient.delete(`/api/v1/posts/${id}/save`)),
}

export const categoriesApi = {
  list: () => json<Category[]>(apiClient.get('/api/v1/categories')),
  postsByCategory: (id: UUID) => json<Post[]>(apiClient.get(`/api/v1/categories/${id}/posts`)),
}

export const friendsApi = {
  list: () => json<User[]>(apiClient.get('/api/v1/friends')),
  incoming: () => json<FriendRequest[]>(apiClient.get('/api/v1/friends/requests')),
  sendRequest: (userId: UUID) =>
    json<ApiMessage>(apiClient.post(`/api/v1/friends/requests/${userId}`)),
  accept: (requestId: UUID) =>
    json<ApiMessage>(apiClient.post(`/api/v1/friends/requests/${requestId}/accept`)),
  decline: (requestId: UUID) =>
    json<ApiMessage>(apiClient.post(`/api/v1/friends/requests/${requestId}/decline`)),
  remove: (friendId: UUID) => json<ApiMessage>(apiClient.delete(`/api/v1/friends/${friendId}`)),
}

export const blocksApi = {
  list: () => json<User[]>(apiClient.get('/api/v1/blocks')),
  block: (userId: UUID) => json<ApiMessage>(apiClient.post(`/api/v1/blocks/${userId}`)),
  unblock: (userId: UUID) => json<ApiMessage>(apiClient.delete(`/api/v1/blocks/${userId}`)),
}

export const searchApi = {
  users: (q: string) => json<User[]>(apiClient.get('/api/v1/search/users', { params: { q } })),
  posts: (q: string) => json<Post[]>(apiClient.get('/api/v1/search/posts', { params: { q } })),
}

export const conversationsApi = {
  list: () => json<Conversation[]>(apiClient.get('/api/v1/conversations')),
  direct: (userId: UUID) =>
    json<Conversation>(apiClient.post(`/api/v1/conversations/direct/${userId}`)),
  messages: (conversationId: UUID) =>
    json<Message[]>(apiClient.get(`/api/v1/conversations/${conversationId}/messages`)),
  send: (conversationId: UUID, body: { messageContent: string; sharedPostId?: UUID | null }) =>
    json<Message>(apiClient.post(`/api/v1/conversations/${conversationId}/messages`, body)),
  markRead: (conversationId: UUID) =>
    json<ApiMessage>(apiClient.post(`/api/v1/conversations/${conversationId}/read`)),
}

export const storiesApi = {
  list: () => json<Story[]>(apiClient.get('/api/v1/stories')),
  create: (params: { content?: string; media?: File | null }) => {
    const fd = new FormData()
    if (params.content) fd.append('content', params.content)
    if (params.media) fd.append('media', params.media)
    return json<Story>(apiClient.post('/api/v1/stories', fd))
  },
  remove: (id: UUID) => json<ApiMessage>(apiClient.delete(`/api/v1/stories/${id}`)),
}

export const notificationsApi = {
  list: () => json<AppNotification[]>(apiClient.get('/api/v1/notifications')),
  markRead: (id: UUID) => json<ApiMessage>(apiClient.post(`/api/v1/notifications/${id}/read`)),
  markAllRead: () => json<ApiMessage>(apiClient.post('/api/v1/notifications/read-all')),
  remove: (id: UUID) => json<ApiMessage>(apiClient.delete(`/api/v1/notifications/${id}`)),
  updateSettings: (body: {
    likes?: boolean
    friendRequests?: boolean
    tags?: boolean
    messages?: boolean
    stories?: boolean
  }) => json<ApiMessage>(apiClient.put('/api/v1/notifications/settings', body)),
}

export const reportsApi = {
  create: (body: { reportedUserId?: UUID; reportedPostId?: UUID; reason: string }) =>
    json<ApiMessage>(apiClient.post('/api/v1/reports', body)),
}

export const groupChatsApi = {
  list: () => json<GroupChat[]>(apiClient.get('/api/v1/groupchats')),
  create: (body: {
    name: string
    memberIds: string[]
    initialMessage?: boolean
    messageContent?: string
  }) => json<GroupChat>(apiClient.post('/api/v1/groupchats', body)),
  messages: (groupId: UUID) =>
    json<GroupMessage[]>(apiClient.get(`/api/v1/groupchats/${groupId}/messages`)),
  send: (groupId: UUID, body: { messageContent: string; sharedPostId?: UUID | null }) =>
    json<GroupMessage>(apiClient.post(`/api/v1/groupchats/${groupId}/messages`, body)),
  addMember: (groupId: UUID, userId: UUID) =>
    json<GroupChat>(apiClient.post(`/api/v1/groupchats/${groupId}/members/add/${userId}`)),
  removeMember: (groupId: UUID, userId: UUID) =>
    json<ApiMessage>(apiClient.delete(`/api/v1/groupchats/${groupId}/members/${userId}`)),
  leave: (groupId: UUID) => json<ApiMessage>(apiClient.post(`/api/v1/groupchats/${groupId}/leave`)),
  updateName: (groupId: UUID, newName: string) =>
    json<GroupChat>(apiClient.put(`/api/v1/groupchats/${groupId}`, { newName })),
}

export const adminApi = {
  reports: () => json<ModerationReport[]>(apiClient.get('/api/v1/admin/reports')),
  resolveReport: (id: UUID) =>
    json<ApiMessage>(apiClient.post(`/api/v1/admin/reports/${id}/resolve`)),
  verify: (userId: UUID) => json<ApiMessage>(apiClient.post(`/api/v1/admin/users/${userId}/verify`)),
  unverify: (userId: UUID) =>
    json<ApiMessage>(apiClient.post(`/api/v1/admin/users/${userId}/unverify`)),
  ban: (userId: UUID) => json<ApiMessage>(apiClient.post(`/api/v1/admin/users/${userId}/ban`)),
  unban: (userId: UUID) => json<ApiMessage>(apiClient.post(`/api/v1/admin/users/${userId}/unban`)),
  deleteUser: (userId: UUID) =>
    json<ApiMessage>(apiClient.delete(`/api/v1/admin/users/${userId}`)),
}
