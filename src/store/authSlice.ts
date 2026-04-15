import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../types/models'

const TOKEN_KEY = 'fomo_token'
const USER_KEY = 'fomo_user'

function readPersisted(): { token: string | null; user: User | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(USER_KEY)
    const user = raw ? (JSON.parse(raw) as User) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

function persist(token: string | null, user: User | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export type AuthState = {
  token: string | null
  user: User | null
}

const initial: AuthState = readPersisted()

const authSlice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token
      state.user = action.payload.user
      persist(state.token, state.user)
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      persist(state.token, state.user)
    },
    clearAuth(state) {
      state.token = null
      state.user = null
      persist(null, null)
    },
  },
})

export const { setCredentials, setUser, clearAuth } = authSlice.actions
export default authSlice.reducer
