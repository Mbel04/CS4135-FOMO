import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { friendsApi, searchApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import { useAppSelector } from '../store/hooks'
import type { Post, User } from '../types/models'

export function SearchPage() {
  const token = useAppSelector((s) => s.auth.token)
  const me = useAppSelector((s) => s.auth.user)
  const [q, setQ] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [mode, setMode] = useState<'users' | 'posts'>('users')
  const [error, setError] = useState<string | null>(null)
  const [friendMsg, setFriendMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set())
  const [unfollowTarget, setUnfollowTarget] = useState<User | null>(null)
  const [unfollowing, setUnfollowing] = useState(false)

  async function refreshFriendIds() {
    if (!token) {
      setFriendIds(new Set())
      return
    }
    try {
      const list = await friendsApi.list()
      setFriendIds(new Set(list.map((f) => f.id)))
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    void refreshFriendIds()
  }, [token])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    setError(null)
    setLoading(true)
    try {
      if (mode === 'users') {
        setUsers(await searchApi.users(q.trim()))
        setPosts([])
      } else {
        setPosts(await searchApi.posts(q.trim()))
        setUsers([])
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Search</h1>
      <p className="muted">Find users by username, or posts by category name (sign in required).</p>
      <form className="form row" onSubmit={onSubmit}>
        <label className="grow">
          Query
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="username or category" />
        </label>
        <label>
          Type
          <select value={mode} onChange={(e) => setMode(e.target.value as 'users' | 'posts')}>
            <option value="users">Users</option>
            <option value="posts">Posts by category</option>
          </select>
        </label>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          Search
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {friendMsg && <p className="success">{friendMsg}</p>}

      {mode === 'users' && (
        <ul className="list">
          {users.map((u) => (
            <li key={u.id} className="card list-item">
              <div>
                <strong>{u.username}</strong> {u.verified && <span className="badge">✓</span>}
                <div className="muted">{u.email}</div>
              </div>
              <div className="row gap">
                {token && me?.id !== u.id && (
                  <>
                    {friendIds.has(u.id) ? (
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => {
                          setFriendMsg(null)
                          setUnfollowTarget(u)
                        }}
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={async () => {
                          setFriendMsg(null)
                          setError(null)
                          try {
                            await friendsApi.sendRequest(u.id)
                            setFriendMsg(`Friend request sent to ${u.username}.`)
                          } catch (err) {
                            setError(getErrorMessage(err))
                          }
                        }}
                      >
                        Add friend
                      </button>
                    )}
                    <Link className="btn btn--ghost" to={`/messages/start/${u.id}`}>
                      Message
                    </Link>
                  </>
                )}
              </div>
            </li>
          ))}
          {users.length === 0 && q && !loading && <p className="muted">No users.</p>}
        </ul>
      )}

      {mode === 'posts' && (
        <div className="stack">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {posts.length === 0 && q && !loading && <p className="muted">No posts.</p>}
        </div>
      )}

      {unfollowTarget && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unfollow-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !unfollowing) setUnfollowTarget(null)
          }}
        >
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <h2 id="unfollow-title" style={{ marginTop: 0 }}>
              Unfollow
            </h2>
            <p>Are you sure you want to unfollow?</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn--ghost"
                disabled={unfollowing}
                onClick={() => setUnfollowTarget(null)}
              >
                No
              </button>
              <button
                type="button"
                className="btn btn--danger"
                disabled={unfollowing}
                onClick={async () => {
                  setUnfollowing(true)
                  setError(null)
                  try {
                    await friendsApi.remove(unfollowTarget.id)
                    setFriendMsg(`You are no longer friends with ${unfollowTarget.username}.`)
                    setUnfollowTarget(null)
                    await refreshFriendIds()
                  } catch (err) {
                    setError(getErrorMessage(err))
                  } finally {
                    setUnfollowing(false)
                  }
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
