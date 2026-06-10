import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const isAdmin = user?.role === 'Admin'

  return (
    <header className="navbar">
      <div className="container">
        <NavLink to="/" className="brand">
          <span aria-hidden>🌍</span> Wanderlust Tours
        </NavLink>
        <nav>
          {isAdmin ? (
            <>
              <NavLink to="/admin/places">Manage Places</NavLink>
              <NavLink to="/admin/packages">Manage Packages</NavLink>
              <NavLink to="/admin/bookings">View Bookings</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end>Home</NavLink>
              <NavLink to="/explore">Book Now</NavLink>
              {user && <NavLink to="/my-bookings">My Bookings</NavLink>}
            </>
          )}

          {user ? (
            <span className="nav-user">
              <span className="nav-greeting">Hi, {user.username}</span>
              <button type="button" className="btn-ghost btn-sm nav-auth-btn" onClick={handleLogout}>
                Logout
              </button>
            </span>
          ) : (
            <NavLink to="/auth" className="btn-cta btn-sm nav-auth-btn">Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
