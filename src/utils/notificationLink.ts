import type { AppNotification } from '../types/models'

/** Where "View reference" should navigate based on notification type + referenceKind. */
export function notificationLink(n: AppNotification): string | null {
  if (!n.referenceId) return null

  const kind = n.referenceKind
  if (kind === 'post') return `/posts/${n.referenceId}`
  if (kind === 'conversation') return `/messages/${n.referenceId}`
  if (kind === 'group') return `/groups/${n.referenceId}`
  if (kind === 'user') return '/friends'
  if (kind === 'story') return '/stories'
  if (kind === 'none') return null

  // Older clients / before referenceKind: infer from type
  if (n.type === 'LIKE' || n.type === 'TAG') return `/posts/${n.referenceId}`
  if (n.type === 'FRIEND_REQUEST') return '/friends'
  if (n.type === 'GROUP_MESSAGE') return `/groups/${n.referenceId}`
  if (n.type === 'MESSAGE') return `/messages/${n.referenceId}`

  return `/posts/${n.referenceId}`
}
