import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Authentication/Login'
import Register from './components/Authentication/Register'
import Dashboard from './components/Dashboard/Dashboard'
import Home from './components/Home/Home'
import ProtectedRoute from './utils/RouteProtection/ProtectedRoute'
import GuestRoute from './utils/RouteProtection/GuestRoute'

function App() {

  return (
    <>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  )
}

export default App
