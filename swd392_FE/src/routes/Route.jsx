import { Route, Routes } from "react-router-dom";
import {
  AdminRoute,
  StaffRoute,
  UserRoute,
} from "../components/RoleBasedRoute";
import { CustomerLayout } from "../layout/CustomerLayout";
import { ManagerLayout } from "../layout/ManagerLayout";

// Import pages
import CartPage from "../pages/CartPage/CartPage";
import DepositPage from "../pages/DepositPage";
import Login from "../pages/Login";
import About from "../pages/MainPage/About";
import BlogPage from "../pages/MainPage/BlogPage";
import HomePage from "../pages/MainPage/HomePage";
import Dashboard from "../pages/ManagerPage/Dashboard";
import OrderManager from "../pages/ManagerPage/OrderManage/OrderManagerPage";
import CreateKnownPackage from "../pages/ManagerPage/PackageManagement/CreateKnownPackage";
import CreateUnknownPackage from "../pages/ManagerPage/PackageManagement/CreateUnknownPackage";
import EditPackage from "../pages/ManagerPage/PackageManagement/EditPackage";
import PackageManager from "../pages/ManagerPage/PackageManagement/PackageManager";
import Settings from "../pages/ManagerPage/Settings";
import Transactions from "../pages/ManagerPage/Transactions";
import Users from "../pages/ManagerPage/Users";
import PaymentResult from "../pages/Payment/PaymentResult";
import PaymentPage from "../pages/PaymentPage/PaymentPage";
import ChangePasswordPage from "../pages/ProfilePage/ChangePasswordPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import RechargePage from "../pages/ProfilePage/RechargePage";
import Register from "../pages/Register";
import LuckyWheel from "../pages/ShoppingAndLuckyWheel/LuckyWheel";
import LuckyWheelDetail from "../pages/ShoppingAndLuckyWheel/LuckyWheelDetail";
import PackageDetail from "../pages/ShoppingAndLuckyWheel/PackageDetail";
import ShoppingPage from "../pages/ShoppingAndLuckyWheel/ShoppingPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Guest Routes */}
      <Route
        path="/"
        element={
          <CustomerLayout>
            <HomePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/login"
        element={
          <CustomerLayout>
            <Login />
          </CustomerLayout>
        }
      />
      <Route
        path="/register"
        element={
          <CustomerLayout>
            <Register />
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
        path="/package-detail/:packageCode"
        element={
          <CustomerLayout>
            <PackageDetail />
          </CustomerLayout>
        }
      />

      {/* User Routes */}
      <Route
        path="/lucky-wheel"
        element={
          <CustomerLayout>
            <UserRoute>
              <LuckyWheel />
            </UserRoute>
          </CustomerLayout>
        }
      />
      <Route
        path="/lucky-wheel/:packageCode"
        element={
          <CustomerLayout>
            <UserRoute>
              <LuckyWheelDetail />
            </UserRoute>
          </CustomerLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <CustomerLayout>
            <UserRoute>
              <CartPage />
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
        path="/recharge"
        element={
          <CustomerLayout>
            <UserRoute>
              <RechargePage />
            </UserRoute>
          </CustomerLayout>
        }
      />
      <Route
        path="/payment"
        element={
          <CustomerLayout>
            <UserRoute>
              <PaymentPage />
            </UserRoute>
          </CustomerLayout>
        }
      />
      <Route
        path="/payment-result"
        element={
          <CustomerLayout>
            <PaymentResult />
          </CustomerLayout>
        }
      />
      <Route
        path="/deposit"
        element={
          <CustomerLayout>
            <UserRoute>
              <DepositPage />
            </UserRoute>
          </CustomerLayout>
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

      {/* Staff Routes */}
      <Route
        path="/manage-orders"
        element={
          <ManagerLayout>
            <StaffRoute>
              <OrderManager />
            </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ManagerLayout>
            <StaffRoute>
              <Dashboard />
            </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/packages"
        element={
          <ManagerLayout>
            <StaffRoute>
              <PackageManager />
            </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/package/create-unknown"
        element={
          <ManagerLayout>
            <StaffRoute>
              <CreateUnknownPackage />
            </StaffRoute>
          </ManagerLayout>
        }
      />
      <Route
        path="/package/create-known"
        element={
          <ManagerLayout>
            <StaffRoute>
              <CreateKnownPackage />
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
        path="/change-password"
        element={
          <ManagerLayout>
            <StaffRoute>
              <ChangePasswordPage />
            </StaffRoute>
          </ManagerLayout>
        }
      />

      {/* Admin Routes */}
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
        path="/transactions"
        element={
          <ManagerLayout>
            <AdminRoute>
              <Transactions />
            </AdminRoute>
          </ManagerLayout>
        }
      />
      {/* Error Routes */}
      <Route
        path="/unauthorized"
        element={
          <ManagerLayout>
            <div className="p-8">
              <h1 className="text-2xl font-bold text-red-500">
                Unauthorized Access
              </h1>
              <p>You do not have permission to access this resource.</p>
            </div>
          </ManagerLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
