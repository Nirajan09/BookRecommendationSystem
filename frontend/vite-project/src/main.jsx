import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext/AuthContext.jsx'
import { ToastContainer } from 'react-toastify'
import CommonLayout from "./components/shared/CommonLayout.jsx"
import { CartProvider } from './utils/CartContext/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <CommonLayout>
          <App />
        </CommonLayout>
      </CartProvider>
      <ToastContainer
        closeButton={true}
        autoClose={2000}
        pauseOnHover={true}
        draggable={false} />
    </AuthProvider>
  </BrowserRouter>
)
