import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import PlacesHome from './pages/PlacesHome'
import Home from './pages/Home'
import PackageDetails from './pages/PackageDetails'
import MyBookings from './pages/MyBookings'
import ManagePlaces from './pages/ManagePlaces'
import AdminPackages from './pages/AdminPackages'
import AdminBookings from './pages/AdminBookings'
import AuthPage from './pages/AuthPage'
import RequireAuth from './auth/RequireAuth'
import RequireAdmin from './auth/RequireAdmin'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public: places showcase + explore/browse */}
          <Route path="/" element={<PlacesHome />} />
          <Route path="/explore" element={<Home />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Signed-in users */}
          <Route path="/my-bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />

          {/* Admin only */}
          <Route path="/admin/places" element={<RequireAdmin><ManagePlaces /></RequireAdmin>} />
          <Route path="/admin/packages" element={<RequireAdmin><AdminPackages /></RequireAdmin>} />
          <Route path="/admin/bookings" element={<RequireAdmin><AdminBookings /></RequireAdmin>} />

          <Route path="*" element={
            <div className="page"><div className="container"><p className="center-msg">Page not found.</p></div></div>
          } />
        </Routes>
      </main>
    </>
  )
}
