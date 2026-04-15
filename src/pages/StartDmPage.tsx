import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from '../components/Spinner'
import { conversationsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import type { UUID } from '../types/models'

function findDirectConversationWithUser(
  conversations: Awaited<ReturnType<typeof conversationsApi.list>>,
  otherUserId: string,
) {
  return conversations.find(
    (c) => c.participants.length === 2 && c.participants.some((p) => p.id === otherUserId),
  )
}

export function StartDmPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      try {
        const list = await conversationsApi.list()
        if (cancelled) return
        const existing = findDirectConversationWithUser(list, userId)
        if (existing) {
          navigate(`/messages/${existing.id}`, { replace: true })
          return
        }
        const c = await conversationsApi.direct(userId as UUID)
        if (!cancelled) navigate(`/messages/${c.id}`, { replace: true })
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, navigate])

  if (error) {
    return (
      <div className="narrow">
        <p className="error">{error}</p>
      </div>
    )
  }

  return (
    <div className="center">
      <Spinner />
      <p className="muted">Opening conversation…</p>
    </div>
  )
}
