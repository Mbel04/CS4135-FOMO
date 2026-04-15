import { Link } from 'react-router-dom'
import type { Post } from '../types/models'
import { formatDate } from '../utils/format'

type Props = {
  post: Post
  onLike?: () => void
  onUnlike?: () => void
  onSave?: () => void
  onUnsave?: () => void
  onDelete?: () => void
}

export function PostCard({ post, onLike, onUnlike, onSave, onUnsave, onDelete }: Props) {
  const media = post.mediaUrl ? (
    post.mediaType?.startsWith('video') ? (
      <video className="post-card__media" src={post.mediaUrl} controls playsInline />
    ) : (
      <img className="post-card__media" src={post.mediaUrl} alt="" />
    )
  ) : null

  return (
    <article className="card post-card">
      <header className="post-card__head">
        <div>
          <span className="post-card__author">{post.author.username}</span>
          {post.author.verified && <span className="badge">✓</span>}
          <div className="muted">{formatDate(post.createdAt)}</div>
        </div>
        <Link className="link" to={`/posts/${post.id}`}>
          Open
        </Link>
      </header>
      {post.content && <p className="post-card__content">{post.content}</p>}
      {media}
      {post.categories?.length > 0 && (
        <div className="tags">
          {post.categories.map((c) => (
            <span key={c.id} className="tag">
              {c.name}
            </span>
          ))}
        </div>
      )}
      {post.taggedUsers?.length > 0 && (
        <div className="muted">
          Tagged: {post.taggedUsers.map((u) => u.username).join(', ')}
        </div>
      )}
      <footer className="post-card__actions">
        <span className="muted">{post.likeCount} likes</span>
        {onLike && (
          <button type="button" className="btn btn--ghost" onClick={onLike}>
            Like
          </button>
        )}
        {onUnlike && (
          <button type="button" className="btn btn--ghost" onClick={onUnlike}>
            Unlike
          </button>
        )}
        {onSave && (
          <button type="button" className="btn btn--ghost" onClick={onSave}>
            Save
          </button>
        )}
        {onUnsave && (
          <button type="button" className="btn btn--ghost" onClick={onUnsave}>
            Unsave
          </button>
        )}
        {onDelete && (
          <button type="button" className="btn btn--danger" onClick={onDelete}>
            Delete
          </button>
        )}
      </footer>
    </article>
  )
}
