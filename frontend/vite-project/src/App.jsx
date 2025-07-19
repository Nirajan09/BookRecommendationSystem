import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Authentication/Login'
import Register from './components/Authentication/Register'
import Home from './components/shared/Home'
import UserRoute from './utils/RouteProtection/UserRoute'
import GuestRoute from './utils/RouteProtection/GuestRoute'
import UserDashboard from "./components/user-dashboard/UserDashboard"
import AdminDashboard from "./components/admin-dashboard/AdminDashboard"
import AdminRoute from './utils/RouteProtection/AdminRoute'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>} />

        <Route path="/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } />

        {/* User Dashboard: only logged-in users (non-admin) */}
        <Route path="/dashboard/*" element={
          <UserRoute>
            <UserDashboard />
          </UserRoute>
        } />

        {/* Admin Dashboard: only admins */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard/>
          </AdminRoute>
        } />
      </Routes>
    </>
  )
}

export default App
