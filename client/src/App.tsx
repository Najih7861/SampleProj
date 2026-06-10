import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PackageDetails from './pages/PackageDetails'
import AdminPackages from './pages/AdminPackages'
import AdminBookings from './pages/AdminBookings'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/admin/packages" element={<AdminPackages />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="*" element={
            <div className="page"><div className="container"><p className="center-msg">Page not found.</p></div></div>
          } />
        </Routes>
      </main>
    </>
  )
}
