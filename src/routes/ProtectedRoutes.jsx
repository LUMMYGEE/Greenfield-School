// src/routes/ProtectedRoutes.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";

const ProtectedRoutes = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show a loader while checking auth state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-medium text-gray-600">Checking credentials...</span>
      </div>
    );
  }

  // If not logged in, redirect to login page and preserve the route
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Authorized: render child route
  return children;
};

export default ProtectedRoutes;
// Usage in AppRouter.jsx
// import ProtectedRoutes from "../routes/ProtectedRoutes";