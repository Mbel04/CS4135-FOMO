import { type FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { groupChatsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import { useAppSelector } from '../store/hooks'
import type { GroupMessage, UUID } from '../types/models'
import { formatDate } from '../utils/format'

export function GroupChatPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const me = useAppSelector((s) => s.auth.user)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [text, setText] = useState('')
  const [addMemberId, setAddMemberId] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!groupId) return
    setMessages(await groupChatsApi.messages(groupId))
  }

  useEffect(() => {
    if (!groupId) return
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
  }, [groupId])

  async function onSend(e: FormEvent) {
    e.preventDefault()
    if (!groupId || !text.trim()) return
    try {
      await groupChatsApi.send(groupId, { messageContent: text.trim() })
      setText('')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onAddMember() {
    if (!groupId || !addMemberId.trim()) return
    try {
      await groupChatsApi.addMember(groupId, addMemberId.trim() as UUID)
      setAddMemberId('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onLeave() {
    if (!groupId || !confirm('Leave this group?')) return
    try {
      await groupChatsApi.leave(groupId)
      window.location.href = '/groups'
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="page chat">
      <h1>Group</h1>
      {error && <p className="error">{error}</p>}
      <div className="row gap wrap">
        <input
          className="grow"
          placeholder="Add member UUID"
          value={addMemberId}
          onChange={(e) => setAddMemberId(e.target.value)}
        />
        <button type="button" className="btn btn--primary" onClick={onAddMember}>
          Add member
        </button>
        <button type="button" className="btn btn--danger" onClick={onLeave}>
          Leave group
        </button>
      </div>
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
        <input className="grow" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…" />
        <button type="submit" className="btn btn--primary">
          Send
        </button>
      </form>
    </div>
  )
}
