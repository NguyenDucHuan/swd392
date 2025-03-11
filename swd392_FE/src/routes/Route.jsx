import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AdminRoute, StaffRoute } from "../components/RoleBasedRoute";
import { CustomerLayout } from "../layout/CustomerLayout";
import { ManagerLayout } from "../layout/ManagerLayout";

// Import pages
import Login from "../pages/Login";
import About from "../pages/MainPage/About";
import BlogPage from "../pages/MainPage/BlogPage";
import HomePage from "../pages/MainPage/HomePage";
import AdvertisingCenter from "../pages/ManagerPage/AdvertisingCenter";
import Content from "../pages/ManagerPage/Content";
import Dashboard from "../pages/ManagerPage/Dashboard";
import GoldUsers from "../pages/ManagerPage/GoldUsers";
import HelpCenter from "../pages/ManagerPage/HelpCenter";
import HelpCenterStart from "../pages/ManagerPage/HelpCenterStart";
import Settings from "../pages/ManagerPage/Settings";
import Register from "../pages/Register";
import LuckyWheel from "../pages/ShoppingAndLuckyWheel/LuckyWheel";
import ShoppingPage from "../pages/ShoppingAndLuckyWheel/ShoppingPage";
import Users from "../pages/Users";
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login />
        }
      />
      {/* Geust */}
      <Route
        path="/"
        element={
          <CustomerLayout>
            <HomePage />
          </CustomerLayout>
        }

      />
      <Route
        path="/about"
        element={
          <CustomerLayout>
            <About />
          </CustomerLayout>
        }
      />
      <Route
        path="/blog"
        element={
          <CustomerLayout>
            <BlogPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/shopping"
        element={
          <CustomerLayout>
            <ShoppingPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/lucky-wheel"
        element={
          <CustomerLayout>
            <LuckyWheel />
          </CustomerLayout>
        }
      />

      {/* Admin */}
      <Route
        path="/dashboard"
        element={
          <ManagerLayout>
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <Dashboard />
            </ProtectedRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ManagerLayout>
            <AdminRoute>
              <Settings />
            </AdminRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/help"
        element={
          <ManagerLayout>
            <ProtectedRoute>
              <HelpCenter />
            </ProtectedRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/starthelp"
        element={
          <ManagerLayout>
            <ProtectedRoute>
              <HelpCenterStart />
            </ProtectedRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/ads"
        element={
          <ManagerLayout>
            <AdminRoute>
              <AdvertisingCenter />
            </AdminRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/content"
        element={
          <ManagerLayout>
            <StaffRoute>
              <Content />
            </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/users"
        element={
          <ManagerLayout>
            <AdminRoute>
              <Users />
            </AdminRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/register"
        element=
        {<Register />}
      />

      <Route
        path="/users/gold"
        element={
          <ManagerLayout>
            <AdminRoute>
              <GoldUsers />
            </AdminRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/unauthorized"
        element={
          <ManagerLayout>
            <div className="p-8">
              <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
              <p>You do not have permission to access this resource.</p>
            </div>
          </ManagerLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;