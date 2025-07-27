import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Authentication/Login'
import Register from './components/Authentication/Register'
import Home from './components/shared/Home'
import UserRoute from './utils/RouteProtection/UserRoute'
import GuestRoute from './utils/RouteProtection/GuestRoute'
import AdminDashboard from "./components/admin-dashboard/AdminDashboard"
import AdminRoute from './utils/RouteProtection/AdminRoute'
import AdminBooksGrid from "./components/admin-pages/AdminBooksGrid";
import AdminAddBook from "./components/admin-pages/AdminAddBook";
import AdminEditBook from "./components/admin-pages/AdminEditBook";
import BookDetail from './components/admin-pages/BookDetail'
import UserHome from './components/user-pages/UserHome'
import UserDashboard from './components/user-dashboard/UserDashboard'
import UserBookDetail from './components/user-pages/UserBookDetail'
import CartPage from './components/cart-page/CartPage'
import Wishlist from './components/wishlist-page/Wishlist'
import SearchResultsPage from './components/search-box/SearchResultsPage'

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

        <Route path="/search" element={
          <UserRoute>
            <SearchResultsPage />
          </UserRoute>
      } 
      />

        <Route path="/cart" element={
          <UserRoute>
            <CartPage />
          </UserRoute>
      } />

         <Route path="/books/:id" element={
           <UserRoute>
          <UserBookDetail />
          </UserRoute>
          } />

        <Route path="/wishlist" element={
          <UserRoute>
            <Wishlist />
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
