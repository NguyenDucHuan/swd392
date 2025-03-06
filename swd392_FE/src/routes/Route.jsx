import { Route, Routes } from "react-router-dom";
import GuestRoute from "../components/GuestRoute";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Layout } from "../layout/Layout";

// Import pages
import About from "../pages/About";
import AdvertisingCenter from "../pages/AdvertisingCenter";
import Content from "../pages/Content";
import Dashboard from "../pages/Dashboard";
import GoldUsers from "../pages/GoldUsers";
import HelpCenter from "../pages/HelpCenter";
import HelpCenterStart from "../pages/HelpCenterStart";
import Login from "../pages/Login";
import Settings from "../pages/Settings";
import Users from "../pages/Users";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <Layout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
              <About />
            
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={
          <Layout>
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/help"
        element={
          <Layout>
            <ProtectedRoute>
              <HelpCenter />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/starthelp"
        element={
          <Layout>
            <ProtectedRoute>
              <HelpCenterStart />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/ads"
        element={
          <Layout>
            <ProtectedRoute>
              <AdvertisingCenter />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/content"
        element={
          <Layout>
            <ProtectedRoute>
              <Content />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/users"
        element={
          <Layout>
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/users/gold"
        element={
          <Layout>
            <ProtectedRoute>
              <GoldUsers />
            </ProtectedRoute>
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;