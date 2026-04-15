import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { conversationsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import { useAppSelector } from '../store/hooks'
import type { Conversation } from '../types/models'
import { formatDate } from '../utils/format'

export function MessagesPage() {
  const me = useAppSelector((s) => s.auth.user)
  const [items, setItems] = useState<Conversation[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await conversationsApi.list()
        if (!cancelled) setItems(list)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function title(c: Conversation) {
    const others = c.participants.filter((p) => p.id !== me?.id)
    if (others.length === 0) return 'Conversation'
    return others.map((p) => p.username).join(', ')
  }

  return (
    <div className="page">
      <h1>Messages</h1>
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {items.map((c) => (
          <li key={c.id} className="card list-item">
            <div>
              <Link to={`/messages/${c.id}`}>
                <strong>{title(c)}</strong>
              </Link>
              <div className="muted">{formatDate(c.createdAt)}</div>
            </div>
            <Link className="btn btn--ghost" to={`/messages/${c.id}`}>
              Open
            </Link>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="muted">No conversations yet. Search for a user and tap Message.</p>}
    </div>
  )
}
