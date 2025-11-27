import { useAuth } from "../../contexts/FirebaseAuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";

const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg">Loading...</LoadingSpinner>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in to access this page.
          </p>
        </div>
      </div>
    )
  }

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Super admin privileges required to access this page.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default SuperAdminRoute