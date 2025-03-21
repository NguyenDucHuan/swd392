import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AdminRoute, StaffRoute, UserRoute } from "../components/RoleBasedRoute";
import { CustomerLayout } from "../layout/CustomerLayout";
import { ManagerLayout } from "../layout/ManagerLayout";


// Import pages
import CartPage from "../pages/CartPage/CartPage";
import Login from "../pages/Login";
import About from "../pages/MainPage/About";
import BlogPage from "../pages/MainPage/BlogPage";
import HomePage from "../pages/MainPage/HomePage";
import AdvertisingCenter from "../pages/ManagerPage/AdvertisingCenter";
import Content from "../pages/ManagerPage/Content";
import Dashboard from "../pages/ManagerPage/Dashboard";
import HelpCenter from "../pages/ManagerPage/HelpCenter";
import HelpCenterStart from "../pages/ManagerPage/HelpCenterStart";
import CreateKnownPackage from "../pages/ManagerPage/PackageManagement/CreateKnownPackage";
import CreateUnknownPackage from "../pages/ManagerPage/PackageManagement/CreateUnknownPackage";
import EditPackage from "../pages/ManagerPage/PackageManagement/EditPackage";
import PackageManager from "../pages/ManagerPage/PackageManager";
import Settings from "../pages/ManagerPage/Settings";
import ChangePasswordPage from "../pages/ProfilePage/ChangePasswordPage";
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import Register from "../pages/Register";
import LuckyWheel from "../pages/ShoppingAndLuckyWheel/LuckyWheel";
import PackageDetail from "../pages/ShoppingAndLuckyWheel/PackageDetail";
import ShoppingPage from "../pages/ShoppingAndLuckyWheel/ShoppingPage";
import Users from "../pages/Users";
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <CustomerLayout>
          <Login />
          </CustomerLayout>
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
            <About/>
          </CustomerLayout>
        }
      />
      <Route
        path="/blog"
        element={
          <CustomerLayout>
            <BlogPage/>
          </CustomerLayout>
        }
      />
      <Route
        path="/shopping"
        element={
          <CustomerLayout>
            <ShoppingPage/>.
          </CustomerLayout>
        }
      />
      <Route
        path="/lucky-wheel"
        element={
          <CustomerLayout>
            <LuckyWheel/>
          </CustomerLayout>
        }
      />

      {/* Admin */}
      <Route
        path="/dashboard"
        element={
          <ManagerLayout>
            <StaffRoute>
              <Dashboard/>
            </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ManagerLayout>
            <AdminRoute>
              <Settings/>
            </AdminRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/help"
        element={
          <ManagerLayout>
            <ProtectedRoute>
              <HelpCenter/>
            </ProtectedRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/starthelp"
        element={
          <ManagerLayout>
            <ProtectedRoute>
              <HelpCenterStart/>
            </ProtectedRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/ads"
        element={
          <ManagerLayout>
            <AdminRoute>
              <AdvertisingCenter/>
            </AdminRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/content"
        element={
          <ManagerLayout>
            <StaffRoute>
              <Content/>
            </StaffRoute>
          </ManagerLayout>
        }
      />


      <Route
        path="/users"
        element={
          <ManagerLayout>
            <AdminRoute>
              <Users/>
            </AdminRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/register"
        element=
        {
          <CustomerLayout>
        <Register/>
        </CustomerLayout>
        }
      />

      <Route
        path="/packages"
        element={
          <ManagerLayout>
          <StaffRoute>
            <PackageManager/>
          </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <CustomerLayout>
            <CartPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/package-detail/:packageCode"
        element={
          <CustomerLayout>
            <PackageDetail />
          </CustomerLayout>
        }
      />
      <Route
        path="/package/create-unknown"
        element={
          <ManagerLayout>
          <StaffRoute>
            <CreateUnknownPackage/>
          </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/package/create-known"
        element={
          <ManagerLayout>
          <StaffRoute>
            <CreateKnownPackage/>
          </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/package/edit/:packageId"
        element={
          <ManagerLayout>
          <StaffRoute>
          <EditPackage />
          </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/change-password"
        element={
          <ManagerLayout>
            <StaffRoute>
              <ChangePasswordPage />
            </StaffRoute>
          </ManagerLayout>
        }
      />

      <Route
        path="/user-change-password"
        element={
          <CustomerLayout>
            <UserRoute>
              <ChangePasswordPage />
            </UserRoute>
          </CustomerLayout>
        }
      />

      <Route
        path="/customer/profile"
        element={
          <CustomerLayout>
            <UserRoute>
              <ProfilePage />
            </UserRoute>
          </CustomerLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ManagerLayout>
            <StaffRoute>
              <ProfilePage />
            </StaffRoute>
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