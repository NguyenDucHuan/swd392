import { jwtDecode } from "jwt-decode";

export const getUserRole = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    console.log("Detected user role:", role);  // Debug log
    return role;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Helper function to check if role is admin/staff
export const isAdminOrStaff = (role) => {
  if (!role) return false;
  // Case insensitive check
  const normalizedRole = role.toLowerCase();
  return normalizedRole === "admin" || normalizedRole === "staff";
};

export const isAdmin = (role) => {
  if (!role) return false;
  return role.toLowerCase() === "admin";
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("access_token");
};