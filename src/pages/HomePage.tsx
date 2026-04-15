import { type FormEvent, useEffect, useState } from 'react'
import { PostCard } from '../components/PostCard'
import { Spinner } from '../components/Spinner'
import { categoriesApi, postsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import { useAppSelector } from '../store/hooks'
import type { Category, Post, UUID } from '../types/models'

function parseTaggedTokens(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function HomePage() {
  const token = useAppSelector((s) => s.auth.token)
  const user = useAppSelector((s) => s.auth.user)
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [content, setContent] = useState('')
  const [media, setMedia] = useState<File | null>(null)
  const [selectedCats, setSelectedCats] = useState<UUID[]>([])
  const [taggedInput, setTaggedInput] = useState('')
  const [posting, setPosting] = useState(false)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const [feed, cats] = await Promise.all([postsApi.feed(), categoriesApi.list()])
      setPosts(feed)
      setCategories(cats)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  function toggleCategory(id: UUID) {
    setSelectedCats((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function onCreatePost(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    const taggedUserIds = parseTaggedTokens(taggedInput)
    setPosting(true)
    try {
      await postsApi.create({
        content: content || undefined,
        categoryIds: selectedCats.length ? selectedCats : undefined,
        taggedUserIds: taggedUserIds.length ? taggedUserIds : undefined,
        media,
      })
      setContent('')
      setMedia(null)
      setSelectedCats([])
      setTaggedInput('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPosting(false)
    }
  }

  async function act(_postId: UUID, fn: () => Promise<unknown>) {
    try {
      await fn()
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Feed</h1>
      {error && <p className="error">{error}</p>}

      {token && (
        <section className="card compose">
          <h2>New post</h2>
          <form className="form" onSubmit={onCreatePost}>
            <label>
              Text
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
            </label>
            <label>
              Media (image or video)
              <input type="file" accept="image/*,video/*" onChange={(e) => setMedia(e.target.files?.[0] ?? null)} />
            </label>
            <fieldset className="fieldset">
              <legend>Categories</legend>
              <div className="tags">
                {categories.map((c) => (
                  <label key={c.id} className="tag-toggle">
                    <input
                      type="checkbox"
                      checked={selectedCats.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label>
              Tag users (usernames or UUIDs, comma or space separated)
              <input value={taggedInput} onChange={(e) => setTaggedInput(e.target.value)} placeholder="e.g. jamie, alex" />
            </label>
            <button type="submit" className="btn btn--primary" disabled={posting}>
              {posting ? 'Posting…' : 'Post'}
            </button>
          </form>
        </section>
      )}

      <section className="stack">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            onLike={token ? () => act(p.id, () => postsApi.like(p.id)) : undefined}
            onUnlike={token ? () => act(p.id, () => postsApi.unlike(p.id)) : undefined}
            onSave={token ? () => act(p.id, () => postsApi.save(p.id)) : undefined}
            onUnsave={token ? () => act(p.id, () => postsApi.unsave(p.id)) : undefined}
            onDelete={
              token && (user?.id === p.author.id || user?.role === 'ADMIN')
                ? () => act(p.id, () => postsApi.remove(p.id))
                : undefined
            }
          />
        ))}
        {posts.length === 0 && <p className="muted">No posts yet.</p>}
      </section>
    </div>
  )
}
