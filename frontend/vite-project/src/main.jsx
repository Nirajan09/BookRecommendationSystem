import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext/AuthContext.jsx'
import { ToastContainer } from 'react-toastify'
import CommonLayout from "./components/shared/CommonLayout.jsx"

createRoot(document.getElementById('root')).render(
   <BrowserRouter>
   <AuthProvider>
  <CommonLayout>

    <App />
  </CommonLayout>
  <ToastContainer
        closeButton={true}        // Explicitly show close button (default is true)
        autoClose={2000}          // Auto close after 5 seconds (5000ms)
        pauseOnHover={true}       // Pause timer on hover
        draggable={false}  />
   </AuthProvider>
  </BrowserRouter>
)
