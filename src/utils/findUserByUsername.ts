import { searchApi } from '../services/fomoApi'
import type { User } from '../types/models'

/** Resolves a username via search and returns the user with an exact case-insensitive username match. */
export async function findUserByUsername(username: string): Promise<User | null> {
  const q = username.trim()
  if (!q) return null
  const users = await searchApi.users(q)
  return users.find((u) => u.username.toLowerCase() === q.toLowerCase()) ?? null
}
