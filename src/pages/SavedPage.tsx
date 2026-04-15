import { useEffect, useState } from 'react'
import { PostCard } from '../components/PostCard'
import { postsApi, userApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import type { Post } from '../types/models'

export function SavedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setError(null)
    try {
      setPosts(await userApi.savedPosts())
    } catch (err) {
      setError(getErrorMessage(err))
      setPosts([])
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <div className="page">
      <h1>Saved posts</h1>
      {error && <p className="error">{error}</p>}
      <div className="stack">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            onUnsave={() => postsApi.unsave(p.id).then(refresh)}
          />
        ))}
        {!error && posts.length === 0 && <p className="muted">No saved posts.</p>}
      </div>
    </div>
  )
}
