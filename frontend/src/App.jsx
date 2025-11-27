import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Pages
import Landing from './pages/Landing'
import FirebaseLogin from './pages/FirebaseLogin'
import FirebaseRegister from './pages/FirebaseRegister'
import EmailVerification from './pages/EmailVerification'
import Dashboard from './pages/Dashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import ReviewForm from './pages/ReviewForm'
import NotFound from './pages/NotFound'
import SubscriptionPage from './pages/SubscriptionPage'
import Checkout from './pages/Checkout'

// Business components
import BusinessDashboard from './components/business/BusinessDashboard'
import BusinessForm from './components/business/BusinessForm'
import BusinessSettings from './components/business/BusinessSettings'

// Providers and contexts
import { AuthProvider } from './contexts/FirebaseAuthContext'

// Route protection components
import ProtectedRoute from './components/common/ProtectedRoute'
import SuperAdminRoute from './components/common/SuperAdminRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<FirebaseLogin />} />
            <Route path="/register" element={<FirebaseRegister />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/review/:businessId" element={<ReviewForm />} />
            
            {/* Protected routes - Business Owner */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Subscription Management */}
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <SubscriptionPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Checkout */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            
            {/* Business Management Routes */}
            <Route 
              path="/business/create" 
              element={
                <ProtectedRoute>
                  <BusinessForm />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/business/:id/edit" 
              element={
                <ProtectedRoute>
                  <BusinessForm />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/business/:id/settings" 
              element={
                <ProtectedRoute>
                  <BusinessSettings />
                </ProtectedRoute>
              } 
            />
            
            {/* Super Admin routes */}
            <Route 
              path="/super-admin/*" 
              element={
                <SuperAdminRoute>
                  <SuperAdminDashboard />
                </SuperAdminRoute>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4ade80',
                  secondary: '#black',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: '#ef4444',
                  secondary: '#black',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App