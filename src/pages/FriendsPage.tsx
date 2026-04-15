import { useEffect, useState } from 'react'
import { friendsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import type { FriendRequest, User } from '../types/models'
import { formatDate } from '../utils/format'
import { findUserByUsername } from '../utils/findUserByUsername'

export function FriendsPage() {
  const [friends, setFriends] = useState<User[]>([])
  const [incoming, setIncoming] = useState<FriendRequest[]>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      const [f, inc] = await Promise.all([friendsApi.list(), friendsApi.incoming()])
      setFriends(f)
      setIncoming(inc)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function act(fn: () => Promise<unknown>) {
    try {
      await fn()
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="page">
      <h1>Friends</h1>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Incoming requests</h2>
        {incoming.length === 0 && <p className="muted">None.</p>}
        <ul className="list">
          {incoming.map((r) => (
            <li key={r.id} className="list-item">
              <div>
                <strong>{r.sender.username}</strong>
                <div className="muted">{formatDate(r.createdAt)}</div>
              </div>
              <div className="row gap">
                <button type="button" className="btn btn--primary" onClick={() => act(() => friendsApi.accept(r.id))}>
                  Accept
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => act(() => friendsApi.decline(r.id))}>
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Your friends</h2>
        {friends.length === 0 && (
          <p className="muted">No friends yet. Use Search to find users, or send a request by username below.</p>
        )}
        <ul className="list">
          {friends.map((f) => (
            <li key={f.id} className="list-item">
              <span>
                {f.username} {f.verified && <span className="badge">✓</span>}
              </span>
              <button type="button" className="btn btn--danger" onClick={() => act(() => friendsApi.remove(f.id))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Send friend request</h2>
        <SendRequestForm
          onSend={(username) =>
            act(async () => {
              const target = await findUserByUsername(username)
              if (!target) {
                throw new Error('No user found with that exact username.')
              }
              await friendsApi.sendRequest(target.id)
            })
          }
        />
      </section>
    </div>
  )
}

function SendRequestForm({ onSend }: { onSend: (username: string) => Promise<void> }) {
  const [username, setUsername] = useState('')
  return (
    <div className="row gap">
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="grow"
      />
      <button
        type="button"
        className="btn btn--primary"
        onClick={async () => {
          if (!username.trim()) return
          try {
            await onSend(username.trim())
            setUsername('')
          } catch {
            /* error surfaced by parent */
          }
        }}
      >
        Send request
      </button>
    </div>
  )
}
