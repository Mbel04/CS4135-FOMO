import { type FormEvent, useEffect, useState } from 'react'
import { userApi } from '../services/fomoApi'
import { getErrorMessage } from '../services/apiClient'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setUser } from '../store/authSlice'
import type { User } from '../types/models'

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const cached = useAppSelector((s) => s.auth.user)
  const [profile, setProfile] = useState<User | null>(cached)
  const [username, setUsername] = useState(cached?.username ?? '')
  const [bio, setBio] = useState(cached?.bio ?? '')
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwMsg, setPwMsg] = useState<string | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await userApi.me()
        if (!cancelled) {
          setProfile(me)
          setUsername(me.username)
          setBio(me.bio ?? '')
          dispatch(setUser(me))
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [dispatch])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    try {
      const body: { username?: string; bio?: string } = {}
      if (username !== profile?.username) body.username = username
      if ((bio || '') !== (profile?.bio ?? '')) body.bio = bio
      const me = await userApi.updateMe(body)
      setProfile(me)
      dispatch(setUser(me))
      setMsg('Profile updated.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault()
    setPwError(null)
    setPwMsg(null)
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.')
      return
    }
    setPwLoading(true)
    try {
      await userApi.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwMsg('Password updated.')
    } catch (err) {
      setPwError(getErrorMessage(err))
    } finally {
      setPwLoading(false)
    }
  }

  if (loading && !profile) {
    return <p className="muted">Loading profile…</p>
  }

  return (
    <div className="page narrow">
      <h1>Your profile</h1>
      {profile && (
        <ul className="meta-list">
          <li>
            <strong>Email</strong> {profile.email}
          </li>
          <li>
            <strong>Role</strong> {profile.role}
          </li>
          <li>
            <strong>Verified</strong> {profile.verified ? 'Yes' : 'No'}
          </li>
        </ul>
      )}
      <form className="form" onSubmit={onSave}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} />
        </label>
        <label>
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500} />
        </label>
        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}
        <button type="submit" className="btn btn--primary">
          Save changes
        </button>
      </form>

      <h2>Change password</h2>
      <form className="form" onSubmit={onChangePassword}>
        <label>
          Current password
          <input
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          New password
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label>
          Confirm new password
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        {pwError && <p className="error">{pwError}</p>}
        {pwMsg && <p className="success">{pwMsg}</p>}
        <button type="submit" className="btn btn--primary" disabled={pwLoading}>
          {pwLoading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
