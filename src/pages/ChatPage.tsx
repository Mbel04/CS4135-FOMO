import { type FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { conversationsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import { useAppSelector } from '../store/hooks'
import type { Message } from '../types/models'
import { formatDate } from '../utils/format'

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const me = useAppSelector((s) => s.auth.user)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!conversationId) return
    const list = await conversationsApi.messages(conversationId)
    setMessages(list)
    await conversationsApi.markRead(conversationId)
  }

  useEffect(() => {
    if (!conversationId) return
    let cancelled = false
    ;(async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [conversationId])

  async function onSend(e: FormEvent) {
    e.preventDefault()
    if (!conversationId || !text.trim()) return
    setError(null)
    try {
      await conversationsApi.send(conversationId, { messageContent: text.trim() })
      setText('')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="page chat">
      <h1>Chat</h1>
      {error && <p className="error">{error}</p>}
      <div className="chat__thread">
        {messages.map((m) => (
          <div key={m.id} className={`chat__bubble ${m.sender.id === me?.id ? 'chat__bubble--me' : ''}`}>
            <div className="muted">{m.sender.username}</div>
            <div>{m.content}</div>
            <div className="muted chat__time">{formatDate(m.createdAt)}</div>
          </div>
        ))}
      </div>
      <form className="form row chat__input" onSubmit={onSend}>
        <input
          className="grow"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
        />
        <button type="submit" className="btn btn--primary">
          Send
        </button>
      </form>
    </div>
  )
}
