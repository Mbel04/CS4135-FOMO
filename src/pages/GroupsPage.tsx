import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { groupChatsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import type { GroupChat } from '../types/models'

export function GroupsPage() {
  const [groups, setGroups] = useState<GroupChat[]>([])
  const [name, setName] = useState('')
  const [members, setMembers] = useState('')
  const [initialMessage, setInitialMessage] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setError(null)
    try {
      setGroups(await groupChatsApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
      setGroups([])
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    const memberIds = members
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!name.trim() || memberIds.length === 0) return
    setError(null)
    try {
      await groupChatsApi.create({
        name: name.trim(),
        memberIds,
        initialMessage,
        messageContent: messageContent || undefined,
      })
      setName('')
      setMembers('')
      setInitialMessage(false)
      setMessageContent('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="page">
      <h1>Group chats</h1>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Create group</h2>
        <form className="form" onSubmit={onCreate}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Members (usernames or user UUIDs, comma or space separated)
            <input value={members} onChange={(e) => setMembers(e.target.value)} required />
          </label>
          <label className="check">
            <input type="checkbox" checked={initialMessage} onChange={(e) => setInitialMessage(e.target.checked)} />
            Send initial message
          </label>
          {initialMessage && (
            <label>
              Initial message
              <input value={messageContent} onChange={(e) => setMessageContent(e.target.value)} />
            </label>
          )}
          <button type="submit" className="btn btn--primary">
            Create
          </button>
        </form>
      </section>

      <ul className="list">
        {groups.map((g) => (
          <li key={g.id} className="card list-item">
            <div>
              <Link to={`/groups/${g.id}`}>
                <strong>{g.name}</strong>
              </Link>
              <div className="muted">{g.members.length} members</div>
            </div>
            <Link className="btn btn--ghost" to={`/groups/${g.id}`}>
              Open
            </Link>
          </li>
        ))}
      </ul>
      {!error && groups.length === 0 && <p className="muted">You are not in any groups yet.</p>}
    </div>
  )
}
