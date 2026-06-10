import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container">
        <NavLink to="/" className="brand">
          <span aria-hidden>🌍</span> Wanderlust Tours
        </NavLink>
        <nav>
          <NavLink to="/" end>Explore</NavLink>
          <NavLink to="/admin/packages">Manage Packages</NavLink>
          <NavLink to="/admin/bookings">Bookings</NavLink>
        </nav>
      </div>
    </header>
  )
}
