import { type FormEvent, useEffect, useState } from 'react'
import { storiesApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import { useAppSelector } from '../store/hooks'
import type { Story } from '../types/models'
import { formatDate } from '../utils/format'

export function StoriesPage() {
  const me = useAppSelector((s) => s.auth.user)
  const [stories, setStories] = useState<Story[]>([])
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  async function refresh() {
    setError(null)
    try {
      setStories(await storiesApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
      setStories([])
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setPosting(true)
    setError(null)
    try {
      await storiesApi.create({ content: content || undefined, media })
      setContent('')
      setMedia(null)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="page">
      <h1>Stories</h1>
      <p className="muted">
        Stories from you and your friends, visible for 24 hours. Add text and/or media to publish.
      </p>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>New story</h2>
        <form className="form" onSubmit={onCreate}>
          <label>
            Text
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} />
          </label>
          <label>
            Media
            <input type="file" accept="image/*,video/*" onChange={(e) => setMedia(e.target.files?.[0] ?? null)} />
          </label>
          <button type="submit" className="btn btn--primary" disabled={posting}>
            Publish
          </button>
        </form>
      </section>

      <div className="stories-grid">
        {stories.map((s) => (
          <article key={s.id} className="card story-card">
            <header className="story-card__head">
              <strong>{s.user.username}</strong>
              {me && s.user.id === me.id && (
                <button type="button" className="btn btn--ghost" onClick={() => storiesApi.remove(s.id).then(refresh)}>
                  Delete
                </button>
              )}
            </header>
            <div className="muted">{formatDate(s.createdAt)} → {formatDate(s.expiresAt)}</div>
            {s.content && <p>{s.content}</p>}
            {s.mediaUrl &&
              (s.mediaType === 'video' || s.mediaType?.startsWith('video/') ? (
                <video className="story-card__media" src={s.mediaUrl} controls playsInline />
              ) : (
                <img className="story-card__media" src={s.mediaUrl} alt="" />
              ))}
          </article>
        ))}
      </div>
      {!error && stories.length === 0 && <p className="muted">No active stories from you or your friends.</p>}
    </div>
  )
}
