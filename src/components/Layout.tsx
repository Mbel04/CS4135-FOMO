import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuth } from '../store/authSlice'

/**
 * Nav trimmed to Person 1 routes. Person 2 adds Search, Messages, Friends, etc.
 */
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
          {token && (
            <>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                Profile
              </NavLink>
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
