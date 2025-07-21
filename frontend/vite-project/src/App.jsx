import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Authentication/Login'
import Register from './components/Authentication/Register'
import Home from './components/shared/Home'
import UserRoute from './utils/RouteProtection/UserRoute'
import GuestRoute from './utils/RouteProtection/GuestRoute'
import AdminDashboard from "./components/admin-dashboard/AdminDashboard"
import AdminRoute from './utils/RouteProtection/AdminRoute'
import AdminBooksGrid from "./components/admin-dashboard/AdminBooksGrid";
import AdminAddBook from "./components/admin-dashboard/AdminAddBook";
import AdminEditBook from "./components/admin-dashboard/AdminEditBook";
import BookDetail from './components/admin-dashboard/BookDetail'
import UserHome from './components/user-dashboard/UserHome'
import UserDashboard from './components/user-dashboard/UserDashboard'

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
        <Route path="/user-home/*" element={
          <UserRoute>
            <UserHome />
          </UserRoute>
        } />
        <Route path="/dashboard/*" element={
          <UserRoute>
            <UserDashboard />
          </UserRoute>
        } />

        {/* Admin Dashboard: only admins */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/books"
          element={
            <AdminRoute>
              <AdminBooksGrid />
            </AdminRoute>
          }
        />
        <Route path="/admin/books/:id" element={
          <AdminRoute>
            <BookDetail />
          </AdminRoute>
        }
        />
        <Route
          path="/admin/books/add"
          element={
            <AdminRoute>
              <AdminAddBook />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/books/:id/edit"
          element={
            <AdminRoute>
              <AdminEditBook />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
