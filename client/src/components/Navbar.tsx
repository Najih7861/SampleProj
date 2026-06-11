import { useState } from 'react'
import { CalendarCheck, Compass, LogOut, MapPinned, Menu, ShieldCheck, UserRound, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const isAdmin = user?.role === 'Admin'
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden><Compass size={21} /></span>
          <span>Wanderlust Tours</span>
        </NavLink>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`} aria-label="Primary navigation">
          {isAdmin ? (
            <>
              <NavLink to="/admin/places" onClick={closeMenu}><MapPinned size={17} /> Places</NavLink>
              <NavLink to="/admin/packages" onClick={closeMenu}><Compass size={17} /> Packages</NavLink>
              <NavLink to="/admin/bookings" onClick={closeMenu}><ShieldCheck size={17} /> Bookings</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end onClick={closeMenu}><MapPinned size={17} /> Destinations</NavLink>
              <NavLink to="/explore" onClick={closeMenu}><Compass size={17} /> Tours</NavLink>
              {user && <NavLink to="/my-bookings" onClick={closeMenu}><CalendarCheck size={17} /> My Bookings</NavLink>}
            </>
          )}

          {user ? (
            <span className="nav-user">
              <span className="nav-greeting"><UserRound size={16} aria-hidden /> {user.username}</span>
              <button type="button" className="btn-ghost btn-sm nav-auth-btn icon-text" onClick={handleLogout}>
                <LogOut size={16} aria-hidden />
                Logout
              </button>
            </span>
          ) : (
            <NavLink to="/auth" className="btn-cta btn-sm nav-auth-btn icon-text" onClick={closeMenu}>
              <UserRound size={16} aria-hidden />
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
