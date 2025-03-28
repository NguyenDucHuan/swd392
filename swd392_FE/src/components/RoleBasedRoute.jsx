import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/authUtils";

const RoleBasedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/unauthorized",
}) => {
  const token = localStorage.getItem("access_token");
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Debug information
  console.log("Current route requires roles:", allowedRoles);
  console.log("User has role:", userRole);

  // if (userRole && userRole.toLowerCase() === "user") {
  //   console.log("User with 'User' role detected - access denied");
  //   // You can redirect to login or a specific "access denied" page
  //   return <Navigate to="/login" replace />;
  // }

  // Case insensitive role checking
  const hasPermission = allowedRoles.some(
    (role) => userRole && userRole.toLowerCase() === role.toLowerCase()
  );

  if (!hasPermission) {
    console.log("Permission denied - user doesn't have required role");
    return <Navigate to={redirectTo} replace />;
  }

  console.log("Access granted to route");
  return children;
};

// Specific role-based components
export const AdminRoute = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={["Admin"]} redirectTo="/unauthorized">
      {children}
    </RoleBasedRoute>
  );
};

export const StaffRoute = ({ children }) => {
  return (
    <RoleBasedRoute
      allowedRoles={["Admin", "Staff"]}
      redirectTo="/unauthorized"
    >
      {children}
    </RoleBasedRoute>
  );
};

export const UserRoute = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={["User"]} redirectTo="/">
      {children}
    </RoleBasedRoute>
  );
};
