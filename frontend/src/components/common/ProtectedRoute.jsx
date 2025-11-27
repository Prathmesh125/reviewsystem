import { useAuth } from "../../contexts/FirebaseAuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";

const ProtectedRoute = ({ children, requireEmailVerification = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = '/login';
    return null;
  }

  // Check email verification if required
  if (requireEmailVerification && !user.emailVerified) {
    // Redirect to email verification page
    window.location.href = '/verify-email';
    return null;
  }

  return children;
};

export default ProtectedRoute;