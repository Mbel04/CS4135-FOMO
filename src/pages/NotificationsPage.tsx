import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notificationsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import type { AppNotification } from '../types/models'
import { formatDate } from '../utils/format'
import { notificationLink } from '../utils/notificationLink'

export function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([])
  const [error, setError] = useState<string | null>(null)
  const [likes, setLikes] = useState(true)
  const [friendRequests, setFriendRequests] = useState(true)
  const [tags, setTags] = useState(true)
  const [messages, setMessages] = useState(true)
  const [stories, setStories] = useState(true)
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null)

  async function refresh() {
    try {
      setItems(await notificationsApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onSettings(e: FormEvent) {
    e.preventDefault()
    setSettingsMsg(null)
    try {
      await notificationsApi.updateSettings({
        likes,
        friendRequests,
        tags,
        messages,
        stories,
      })
      setSettingsMsg('Settings saved.')
    } catch (err) {
      setSettingsMsg(getErrorMessage(err))
    }
  }

  return (
    <div className="page">
      <h1>Notifications</h1>
      {error && <p className="error">{error}</p>}
      <div className="row gap">
        <button type="button" className="btn btn--ghost" onClick={() => notificationsApi.markAllRead().then(refresh)}>
          Mark all read
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => refresh()}>
          Refresh
        </button>
      </div>

      <section className="card notification-prefs">
        <h2>Preferences</h2>
        <p className="muted notification-prefs__intro">Choose which notifications you want to receive.</p>
        <form className="form" onSubmit={onSettings}>
          <div className="notification-prefs__list">
            <label className="notification-prefs__row">
              <span>Likes on your posts</span>
              <input type="checkbox" checked={likes} onChange={(e) => setLikes(e.target.checked)} />
            </label>
            <label className="notification-prefs__row">
              <span>Friend requests</span>
              <input type="checkbox" checked={friendRequests} onChange={(e) => setFriendRequests(e.target.checked)} />
            </label>
            <label className="notification-prefs__row">
              <span>When you’re tagged</span>
              <input type="checkbox" checked={tags} onChange={(e) => setTags(e.target.checked)} />
            </label>
            <label className="notification-prefs__row">
              <span>Direct messages</span>
              <input type="checkbox" checked={messages} onChange={(e) => setMessages(e.target.checked)} />
            </label>
            <label className="notification-prefs__row">
              <span>Stories</span>
              <input type="checkbox" checked={stories} onChange={(e) => setStories(e.target.checked)} />
            </label>
          </div>
          <div className="notification-prefs__actions">
            <button type="submit" className="btn btn--primary">
              Save preferences
            </button>
          </div>
        </form>
        {settingsMsg && (
          <p className={`notification-prefs__feedback ${settingsMsg === 'Settings saved.' ? 'success' : 'error'}`}>
            {settingsMsg}
          </p>
        )}
      </section>

      <ul className="list">
        {items.map((n) => {
          const refTo = notificationLink(n)
          return (
          <li key={n.id} className={`card list-item ${n.read ? '' : 'card--highlight'}`}>
            <div>
              <div>
                <span className="tag">{n.type}</span> {n.message}
              </div>
              <div className="muted">{formatDate(n.createdAt)}</div>
              {refTo && (
                <Link className="link" to={refTo}>
                  Open
                </Link>
              )}
            </div>
            <div className="row gap">
              {!n.read && (
                <button type="button" className="btn btn--ghost" onClick={() => notificationsApi.markRead(n.id).then(refresh)}>
                  Read
                </button>
              )}
              <button type="button" className="btn btn--ghost" onClick={() => notificationsApi.remove(n.id).then(refresh)}>
                Delete
              </button>
            </div>
          </li>
          )
        })}
      </ul>
      {items.length === 0 && <p className="muted">No notifications.</p>}
    </div>
  )
}
