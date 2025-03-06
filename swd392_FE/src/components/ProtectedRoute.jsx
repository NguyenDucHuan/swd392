// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, isLoading, hasRole } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check role requirements
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/about" />;
  }
  
  // User is authenticated and authorized
  return children;
};