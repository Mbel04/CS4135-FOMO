import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { Spinner } from '../components/Spinner'
import { postsApi, reportsApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import { useAppSelector } from '../store/hooks'
import type { Post } from '../types/models'

export function PostPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const token = useAppSelector((s) => s.auth.token)
  const user = useAppSelector((s) => s.auth.user)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportMsg, setReportMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!postId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const p = await postsApi.get(postId)
        if (!cancelled) setPost(p)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [postId])

  async function refresh() {
    if (!postId) return
    const p = await postsApi.get(postId)
    setPost(p)
  }

  async function onReport(e: FormEvent) {
    e.preventDefault()
    if (!postId || !reportReason.trim()) return
    setReportMsg(null)
    try {
      await reportsApi.create({ reportedPostId: postId, reason: reportReason.trim() })
      setReportReason('')
      setReportMsg('Report submitted.')
    } catch (err) {
      setReportMsg(getErrorMessage(err))
    }
  }

  if (loading || !postId) {
    return (
      <div className="center">
        <Spinner />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="narrow">
        <p className="error">{error ?? 'Post not found'}</p>
        <Link to="/">Back to feed</Link>
      </div>
    )
  }

  return (
    <div className="page narrow-readable">
      <PostCard
        post={post}
        onLike={token ? () => postsApi.like(post.id).then(refresh) : undefined}
        onUnlike={token ? () => postsApi.unlike(post.id).then(refresh) : undefined}
        onSave={token ? () => postsApi.save(post.id).then(refresh) : undefined}
        onUnsave={token ? () => postsApi.unsave(post.id).then(refresh) : undefined}
        onDelete={
          token && (user?.id === post.author.id || user?.role === 'ADMIN')
            ? () => postsApi.remove(post.id).then(() => navigate('/'))
            : undefined
        }
      />

      {token && user && user.id !== post.author.id && (
        <section className="card">
          <h2>Report post</h2>
          <form className="form" onSubmit={onReport}>
            <label>
              Reason
              <input value={reportReason} onChange={(e) => setReportReason(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn--danger">
              Submit report
            </button>
          </form>
          {reportMsg && <p className="muted">{reportMsg}</p>}
        </section>
      )}
    </div>
  )
}
