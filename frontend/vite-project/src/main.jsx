import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext/AuthContext.jsx'
import CommonLayout from './components/CommonLayout/CommonLayout.jsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
   <BrowserRouter>
   <AuthProvider>
  <CommonLayout>

    <App />
  </CommonLayout>
  <ToastContainer closeButton={false} />
   </AuthProvider>
  </BrowserRouter>
)
