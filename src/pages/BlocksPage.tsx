import { type FormEvent, useEffect, useState } from 'react'
import { blocksApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import type { User } from '../types/models'
import { findUserByUsername } from '../utils/findUserByUsername'

export function BlocksPage() {
  const [blocked, setBlocked] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [lookupName, setLookupName] = useState('')
  const [lookupInfo, setLookupInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      setBlocked(await blocksApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onLookup(e: FormEvent) {
    e.preventDefault()
    if (!lookupName.trim()) return
    setError(null)
    setLookupInfo(null)
    try {
      const target = await findUserByUsername(lookupName.trim())
      if (!target) {
        setError('No user found with that exact username.')
        return
      }
      const isBlocked = blocked.some((u) => u.id === target.id)
      setLookupInfo(
        isBlocked
          ? `${target.username} is on your blocked list.`
          : `${target.username} is not in your blocked list.`,
      )
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onBlock(e: FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    setError(null)
    try {
      const target = await findUserByUsername(username)
      if (!target) {
        setError('No user found with that exact username.')
        return
      }
      await blocksApi.block(target.id)
      setUsername('')
      setLookupInfo(null)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onUnblock(userId: string) {
    setError(null)
    try {
      await blocksApi.unblock(userId)
      setLookupInfo(null)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="page">
      <h1>Blocked users</h1>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Look up a user</h2>
        <p className="muted">
          Enter a username and click Check to see if they are blocked. This only searches—it does not block or unblock anyone.
        </p>
        <form className="form row" onSubmit={onLookup}>
          <input
            className="grow"
            placeholder="Username"
            value={lookupName}
            onChange={(e) => {
              setLookupName(e.target.value)
              setLookupInfo(null)
            }}
          />
          <button type="submit" className="btn btn--primary">
            Check
          </button>
        </form>
        {lookupInfo && <p className="muted">{lookupInfo}</p>}
      </section>

      <section className="card">
        <h2>Block a user</h2>
        <form className="form row" onSubmit={onBlock}>
          <input
            className="grow"
            placeholder="Username to block"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit" className="btn btn--danger">
            Block
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Your blocked list</h2>
        <ul className="list">
          {blocked.map((u) => (
            <li key={u.id} className="list-item card">
              <span>{u.username}</span>
              <button type="button" className="btn btn--ghost" onClick={() => void onUnblock(u.id)}>
                Unblock
              </button>
            </li>
          ))}
        </ul>
        {blocked.length === 0 && <p className="muted">No blocked users.</p>}
      </section>
    </div>
  )
}
