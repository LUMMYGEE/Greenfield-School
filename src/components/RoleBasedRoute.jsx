
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";


const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, loading } = useContext(AuthContext);

  // Wait until auth + role are fully loaded
  if (loading || (user && !userRole)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (!Array.isArray(allowedRoles) || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};


export default RoleBasedRoute;
