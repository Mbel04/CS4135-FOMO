import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuth } from '../store/authSlice'

export function Layout() {
  const dispatch = useAppDispatch()
  const { token, user } = useAppSelector((s) => s.auth)

  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="logo">
          FOMO
        </Link>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Feed
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => (isActive ? 'active' : '')}>
            Search
          </NavLink>
          {token && (
            <>
              <NavLink to="/stories" className={({ isActive }) => (isActive ? 'active' : '')}>
                Stories
              </NavLink>
              <NavLink to="/messages" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Messages
              </NavLink>
              <NavLink to="/groups" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Groups
              </NavLink>
              <NavLink to="/friends" className={({ isActive }) => (isActive ? 'active' : '')}>
                Friends
              </NavLink>
              <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
                Notifications
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                Profile
              </NavLink>
              <NavLink to="/saved" className={({ isActive }) => (isActive ? 'active' : '')}>
                Saved
              </NavLink>
              <NavLink to="/blocks" className={({ isActive }) => (isActive ? 'active' : '')}>
                Blocks
              </NavLink>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>
        <div className="topbar__auth">
          {token ? (
            <>
              <span className="muted">{user?.username}</span>
              <button type="button" className="btn btn--ghost" onClick={() => dispatch(clearAuth())}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn--ghost" to="/login">
                Log in
              </Link>
              <Link className="btn btn--primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
