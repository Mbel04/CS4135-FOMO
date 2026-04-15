import { useEffect, useState } from 'react'
import { adminApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import type { ModerationReport, UUID } from '../types/models'
import { formatDate } from '../utils/format'

export function AdminPage() {
  const [reports, setReports] = useState<ModerationReport[]>([])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [userActionId, setUserActionId] = useState('')

  async function refresh() {
    try {
      setReports(await adminApi.reports())
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function act(fn: () => Promise<unknown>, success: string) {
    setMsg(null)
    setError(null)
    try {
      await fn()
      setMsg(success)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="page">
      <h1>Admin</h1>
      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}

      <section className="card">
        <h2>User moderation</h2>
        <p className="muted">Enter a user UUID for verify / ban / delete actions.</p>
        <div className="row gap wrap">
          <input
            className="grow"
            placeholder="User UUID"
            value={userActionId}
            onChange={(e) => setUserActionId(e.target.value)}
          />
        </div>
        <div className="row gap wrap">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!userActionId}
            onClick={() => act(() => adminApi.verify(userActionId as UUID), 'Verified')}
          >
            Verify
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!userActionId}
            onClick={() => act(() => adminApi.unverify(userActionId as UUID), 'Unverified')}
          >
            Unverify
          </button>
          <button
            type="button"
            className="btn btn--danger"
            disabled={!userActionId}
            onClick={() => act(() => adminApi.ban(userActionId as UUID), 'Banned')}
          >
            Ban
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!userActionId}
            onClick={() => act(() => adminApi.unban(userActionId as UUID), 'Unbanned')}
          >
            Unban
          </button>
          <button
            type="button"
            className="btn btn--danger"
            disabled={!userActionId}
            onClick={() => {
              if (confirm('Delete this user permanently?')) {
                void act(() => adminApi.deleteUser(userActionId as UUID), 'User deleted')
              }
            }}
          >
            Delete user
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Open reports</h2>
        <ul className="list">
          {reports.map((r) => (
            <li key={r.id} className="list-item">
              <div>
                <div className="muted">{formatDate(r.createdAt)}</div>
                <div>{r.reason}</div>
                <div className="muted">
                  Reporter: {r.reporter?.username ?? r.reporter?.id ?? '—'} · Target user:{' '}
                  {r.reportedUser?.username ?? '—'} · Post: {r.reportedPost?.id ?? '—'}
                </div>
              </div>
              {!r.resolved && (
                <button type="button" className="btn btn--primary" onClick={() => act(() => adminApi.resolveReport(r.id), 'Resolved')}>
                  Resolve
                </button>
              )}
            </li>
          ))}
        </ul>
        {reports.length === 0 && <p className="muted">No unresolved reports.</p>}
      </section>
    </div>
  )
}
