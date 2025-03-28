import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  FaBox,
  FaCreditCard,
  FaEdit,
  FaEye,
  FaSave,
  FaShoppingBag,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";
import { useAuth } from "../../contexts/AuthContext";

function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [orderHistory, setOrderHistory] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderPagination, setOrderPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [inventoryPagination, setInventoryPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 1,
  });
  const [transactionPagination, setTransactionPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [transactions, setTransactions] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderToPayment, setOrderToPayment] = useState(null);
  const [paymentType, setPaymentType] = useState("Order"); // Default to online payment
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Add new state for filters
  const [transactionFilters, setTransactionFilters] = useState({
    type: "",
    minAmount: "",
    maxAmount: "",
    search: "",
  });

  // Move fetchInventory and fetchTransactions outside useEffect
  const fetchInventory = useCallback(async () => {
    try {
      setInventoryLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/inventories/me`, {
        params: {
          page: inventoryPagination.currentPage,
          size: inventoryPagination.pageSize,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update to handle the correct response structure
      setInventory(response.data.items?.$values || []);
      setInventoryPagination((prev) => ({
        ...prev,
        totalItems: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Failed to load inventory items");
    } finally {
      setInventoryLoading(false);
    }
  }, [inventoryPagination.currentPage, inventoryPagination.pageSize]);

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/transactions/me`, {
        params: {
          page: transactionPagination.currentPage,
          size: transactionPagination.pageSize,
          filter: transactionFilters.type,
          minAmount: transactionFilters.minAmount || undefined,
          maxAmount: transactionFilters.maxAmount || undefined,
          search: transactionFilters.search || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions(response.data.items?.$values || []);
      setTransactionPagination((prev) => ({
        ...prev,
        totalItems: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setTransactionLoading(false);
    }
  }, [
    transactionPagination.currentPage,
    transactionPagination.pageSize,
    transactionFilters,
  ]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await axios.get(BASE_URL + "/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserProfile(response.data);
        setName(response.data.name || "");
        setPhone(response.data.phone || "");
        // Format date for input if it exists
        if (response.data.dateOfBirth) {
          const date = new Date(response.data.dateOfBirth);
          const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
          setDateOfBirth(formattedDate);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile information");
        setLoading(false);
      }
    };

    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const response = await axios.get(`${BASE_URL}/orders/user-order`, {
          params: {
            page: orderPagination.currentPage,
            size: orderPagination.pageSize,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle the nested response structure
        const orders = response.data.items?.$values || [];
        setOrderHistory(orders);
        setOrderPagination((prev) => ({
          ...prev,
          totalItems: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
        }));
      } catch (error) {
        console.error("Failed to fetch order history:", error);
        toast.error("Failed to load order history");
      }
    };

    fetchUserProfile();
    fetchOrderHistory();
    fetchInventory();
    fetchTransactions();
  }, [
    orderPagination.currentPage,
    orderPagination.pageSize,
    inventoryPagination.currentPage,
    inventoryPagination.pageSize,
    transactionPagination.currentPage,
    transactionPagination.pageSize,
    fetchInventory,
    fetchTransactions,
  ]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Build the query parameters
      const params = new URLSearchParams();
      if (name) params.append("Name", name);
      if (dateOfBirth) params.append("DateOfBirth", dateOfBirth);
      if (phone) params.append("Phone", phone);

      await axios.patch(
        `${BASE_URL}/users/update-profile?${params.toString()}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state with the new values
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        name,
        dateOfBirth,
        phone,
      }));

      setIsEditing(false);
      toast.success("Thông tin cá nhân đã được cập nhật");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        "Không thể cập nhật thông tin: " +
          (error.response?.data?.message || "Lỗi không xác định")
      );
    } finally {
      setShowConfirmModal(false);
    }
  };

  // Handle payment button click to show modal
  const handlePayment = (orderId) => {
    const order = orderHistory.find((o) => o.orderId === orderId);
    if (!order) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    setOrderToPayment(order);
    setShowPaymentModal(true);
    setPaymentType("Order"); // Reset to default payment type
  };

  // Process payment with selected payment type
  const processPayment = async () => {
    if (!orderToPayment) return;

    // Check if wallet balance is sufficient when using wallet payment
    if (
      paymentType === "Wallet" &&
      userProfile.walletBalance < orderToPayment.totalAmount
    ) {
      toast.error("Số dư trong ví không đủ để thanh toán đơn hàng này");
      return;
    }

    setPaymentLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để thanh toán!");
        setShowPaymentModal(false);
        return;
      }

      // Call payment API with the selected payment type
      const response = await axios.post(
        `${BASE_URL}/payments/payment?orderId=${orderToPayment.orderId}&type=${paymentType}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle different payment types
      if (paymentType === "Order") {
        if (response.data) {
          toast.info("Đang chuyển hướng đến cổng thanh toán VNPAY...", {
            autoClose: 2000,
          });
          setTimeout(() => {
            window.location.href = response.data;
          }, 1500);
        } else {
          toast.error("Không nhận được liên kết thanh toán");
          setPaymentLoading(false);
        }
      } else {
        // For Wallet type, show success and refresh
        toast.success("Thanh toán thành công!");
        setShowPaymentModal(false);

        // Refresh order history
        const refreshResponse = await axios.get(
          `${BASE_URL}/orders/user-order`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const orders = refreshResponse.data.items?.$values || [];
        setOrderHistory(orders);

        // Refresh user profile to get updated wallet balance
        const profileResponse = await axios.get(BASE_URL + "/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserProfile(profileResponse.data);

        // Add additional success notification with more details
        toast.success(
          `Đã thanh toán ${formatCurrency(
            orderToPayment.totalAmount
          )} từ ví của bạn!`,
          {
            autoClose: 5000, // Keep this notification visible longer
          }
        );
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      if (err.response?.status === 400 && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("Có lỗi xảy ra khi xử lý thanh toán");
      }
    } finally {
      if (paymentType !== "Order") {
        setPaymentLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString("vi-VN") + " ₫";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "shipping":
        return "bg-pink-100 text-pink-800";
      case "processing":
        return "bg-pink-100 text-pink-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get current status of an order
  const getCurrentStatus = (order) => {
    if (
      !order.statuses ||
      !order.statuses.$values ||
      order.statuses.$values.length === 0
    ) {
      return "Pending";
    }

    // Sort by updateTime descending and get the most recent status
    const sortedStatuses = [...order.statuses.$values].sort(
      (a, b) => new Date(b.updateTime) - new Date(a.updateTime)
    );

    return sortedStatuses[0].status;
  };

  // Check if order is already paid
  const isOrderPaid = (order) => {
    if (!order.statuses || !order.statuses.$values) return false;

    return order.statuses.$values.some(
      (status) => status.status.toLowerCase() === "paid"
    );
  };

  // Check if order is eligible for completion
  const isOrderEligibleForCompletion = (order) => {
    const currentStatus = getCurrentStatus(order);
    return (
      currentStatus?.toLowerCase() === "shipping" &&
      order.address?.toLowerCase().startsWith("giao hàng tận nơi")
    );
  };

  // Handle order completion
  const handleCompleteOrder = async (orderId) => {
    try {
      setIsCompletingOrder(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để xác nhận đơn hàng!");
        return;
      }

      await axios.post(
        `${BASE_URL}/orders/complete-order?orderId=${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh order history
      const refreshResponse = await axios.get(`${BASE_URL}/orders/user-order`, {
        params: {
          page: orderPagination.currentPage,
          size: orderPagination.pageSize,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orders = refreshResponse.data.items?.$values || [];
      setOrderHistory(orders);

      toast.success("Xác nhận đã nhận đơn hàng thành công!");
    } catch (err) {
      console.error("Failed to complete order:", err);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else if (err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("Không thể xác nhận đơn hàng");
      }
    } finally {
      setIsCompletingOrder(false);
    }
  };

  // First, add a helper function to get transaction type styling
  const getTransactionTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "text-pink-600";
      case "deduction":
        return "text-red-600";
      case "wallet":
        return "text-blue-600";
      case "refund":
        return "text-orange-600";
      case "blindboxopen":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getTransactionPrefix = (type) => {
    switch (type?.toLowerCase()) {
      case "wallet":
      case "refund":
        return "+";
      case "deposit":
      case "deduction":
      case "blindboxopen":
        return "-";
      default:
        return "";
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "Thanh toán bằng ví";
      case "deduction":
        return "Thanh toán chuyển khoản";
      case "wallet":
        return "Nạp tiền vào ví";
      case "refund":
        return "Hoàn tiền";
      case "blindboxopen":
        return "Mở hộp quà";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 flex items-center ${
              activeTab === "profile"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="mr-2" /> Thông tin tài khoản
          </button>
          <button
            className={`px-6 py-3 flex items-center ${
              activeTab === "orders"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            <FaShoppingBag className="mr-2" /> Đơn hàng
          </button>
          <button
            className={`px-6 py-3 flex items-center ${
              activeTab === "inventory"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            <FaBox className="mr-2" /> Bộ sưu tập
          </button>
          <button
            className={`px-6 py-3 flex items-center ${
              activeTab === "transactions"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            <FaWallet className="mr-2" /> Lịch sử giao dịch
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Thông tin tài khoản</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        {userProfile.name || "Chưa cập nhật"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        {userProfile.phone || "Chưa cập nhật"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        {userProfile.dateOfBirth
                          ? formatDate(userProfile.dateOfBirth)
                          : "N/A"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tài khoản
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {userProfile.walletBalance
                        ? formatCurrency(userProfile.walletBalance)
                        : formatCurrency("0")}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {userProfile.email}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                {isEditing ? (
                  <button
                    onClick={handleSaveClick}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center"
                  >
                    <FaSave className="mr-2" /> Lưu thay đổi
                  </button>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center"
                  >
                    <FaEdit className="mr-2" /> Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h2>
              {orderHistory.length > 0 ? (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <div
                      key={order.orderId}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div>
                          <span className="font-medium">
                            Đơn hàng #{order.orderId}
                          </span>
                          <span className="mx-3 text-gray-400">|</span>
                          <span className="text-gray-600">
                            {formatDate(order.orderDate)}
                          </span>
                          <span className="mx-3 text-gray-400">|</span>
                          <span
                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              getCurrentStatus(order)
                            )}`}
                          >
                            {getCurrentStatus(order)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className="text-pink-600 hover:text-pink-800 flex items-center"
                            onClick={() =>
                              setExpandedOrder(
                                expandedOrder === order.orderId
                                  ? null
                                  : order.orderId
                              )
                            }
                          >
                            <FaEye className="mr-1" />
                            {expandedOrder === order.orderId
                              ? "Ẩn chi tiết"
                              : "Xem chi tiết"}
                          </button>
                        </div>
                      </div>

                      {expandedOrder === order.orderId && (
                        <div className="p-4">
                          {/* Order status timeline */}
                          <div className="mb-6">
                            <h4 className="font-medium mb-2">
                              Trạng thái đơn hàng:
                            </h4>
                            <div className="relative">
                              {/* Status History Timeline */}
                              <div className="flex flex-col space-y-4">
                                {order.statuses?.$values
                                  ?.sort(
                                    (a, b) =>
                                      new Date(b.updateTime) -
                                      new Date(a.updateTime)
                                  )
                                  .map((status, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start"
                                    >
                                      <div className="relative">
                                        <div
                                          className={`w-4 h-4 rounded-full ${getStatusBadgeClass(
                                            status.status
                                          )} border border-white`}
                                        ></div>
                                        {index <
                                          order.statuses.$values.length - 1 && (
                                          <div className="absolute top-4 left-1/2 w-0.5 h-5 -ml-px bg-gray-200"></div>
                                        )}
                                      </div>
                                      <div className="ml-4">
                                        <div className="flex items-center">
                                          <span
                                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                              status.status
                                            )}`}
                                          >
                                            {status.status}
                                          </span>
                                          <span className="ml-2 text-xs text-gray-500">
                                            {formatDateTime(status.updateTime)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* Shipping details */}
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">
                              Chi tiết vận chuyển:
                            </h4>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                              <p>Địa chỉ: {order.address || "N/A"}</p>
                              <p>Số điện thoại: {order.phone || "N/A"}</p>
                            </div>
                          </div>

                          {/* Transaction details if available */}
                          {order.transaction && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">
                                Thông tin thanh toán:
                              </h4>
                              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                <p>Loại giao dịch: {order.transaction.type}</p>
                                <p>
                                  Thời gian:{" "}
                                  {formatDateTime(order.transaction.createDate)}
                                </p>
                                <p>Mô tả: {order.transaction.description}</p>
                              </div>
                            </div>
                          )}

                          {/* Order products */}
                          <h4 className="font-medium mb-2">Sản phẩm:</h4>
                          <div className="overflow-x-auto mb-4">
                            <table className="min-w-full divide-y divide-gray-200 border">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã sản phẩm
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đơn giá
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {order.details?.$values?.map(
                                  (detail, index) => (
                                    <tr key={index}>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        #{detail.orderDetailId}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        {detail.packageId
                                          ? "Package"
                                          : "BlindBox"}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-right font-medium">
                                        {formatCurrency(detail.price)}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Total and payment button */}
                          <div className="mt-4 text-right">
                            <div className="text-lg font-bold">
                              Tổng cộng: {formatCurrency(order.totalAmount)}
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                              {/* Only show payment button if not already paid */}
                              {!isOrderPaid(order) && (
                                <button
                                  onClick={() => handlePayment(order.orderId)}
                                  disabled={isProcessingPayment}
                                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-pink-400 flex items-center justify-center"
                                >
                                  {isProcessingPayment ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    "Tiến hành thanh toán"
                                  )}
                                </button>
                              )}

                              {/* Show complete order button if eligible */}
                              {isOrderEligibleForCompletion(order) && (
                                <button
                                  onClick={() =>
                                    handleCompleteOrder(order.orderId)
                                  }
                                  disabled={isCompletingOrder}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center"
                                >
                                  {isCompletingOrder ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    "Xác nhận đã nhận"
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <FaShoppingBag className="mx-auto text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-600">Bạn chưa có đơn hàng nào.</p>
                </div>
              )}

              {/* Pagination */}
              {orderPagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center">
                    <button
                      disabled={orderPagination.currentPage === 1}
                      onClick={() =>
                        setOrderPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      className="px-3 py-1 rounded border mr-2 disabled:opacity-50"
                    >
                      Trước
                    </button>

                    {[...Array(orderPagination.totalPages).keys()].map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() =>
                            setOrderPagination((prev) => ({
                              ...prev,
                              currentPage: page + 1,
                            }))
                          }
                          className={`px-3 py-1 rounded border mx-1 ${
                            orderPagination.currentPage === page + 1
                              ? "bg-pink-500 text-white"
                              : ""
                          }`}
                        >
                          {page + 1}
                        </button>
                      )
                    )}

                    <button
                      disabled={
                        orderPagination.currentPage ===
                        orderPagination.totalPages
                      }
                      onClick={() =>
                        setOrderPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      className="px-3 py-1 rounded border ml-2 disabled:opacity-50"
                    >
                      Tiếp
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Bộ sưu tập</h2>
              {inventoryLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              ) : inventory.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventory.map((item) => (
                      <div
                        key={item.inventoryItemId}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                          {item.blindBox?.imageUrls?.$values?.[0]?.url ? (
                            <img
                              src={item.blindBox.imageUrls.$values[0].url}
                              alt={item.blindBox.packageName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300x200?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaBox className="text-gray-300 text-5xl" />
                            </div>
                          )}
                          {item.addDate && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              {new Date(item.addDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1">
                            {item.blindBox?.packageName || "Unknown Package"}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {item.blindBox?.packageCode && (
                              <span className="text-sm text-gray-500">
                                Mã: {item.blindBox.packageCode}
                              </span>
                            )}
                            {item.blindBox?.color && (
                              <span className="text-sm text-gray-500">
                                | Màu: {item.blindBox.color}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-pink-600 font-medium">
                              {formatCurrency(
                                item.blindBox?.discountedPrice ||
                                  item.blindBox?.price
                              )}
                            </div>
                            {item.blindBox?.isSpecial && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                Đặc biệt
                              </span>
                            )}
                          </div>
                          {item.blindBox?.discount > 0 && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(item.blindBox?.price)}
                              </span>
                              <span className="ml-2 text-sm text-green-600">
                                -{item.blindBox?.discount}%
                              </span>
                            </div>
                          )}
                          {/* Features Section */}
                          {item.blindBox?.features?.$values?.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Đặc điểm:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {item.blindBox.features.$values.map(
                                  (feature) => (
                                    <span
                                      key={feature.featureId}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {feature.description}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inventory Pagination */}
                  {inventoryPagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <nav className="flex items-center">
                        <button
                          disabled={inventoryPagination.currentPage === 1}
                          onClick={() =>
                            setInventoryPagination((prev) => ({
                              ...prev,
                              currentPage: prev.currentPage - 1,
                            }))
                          }
                          className="px-3 py-1 rounded border mr-2 disabled:opacity-50"
                        >
                          Trước
                        </button>

                        {[...Array(inventoryPagination.totalPages).keys()].map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() =>
                                setInventoryPagination((prev) => ({
                                  ...prev,
                                  currentPage: page + 1,
                                }))
                              }
                              className={`px-3 py-1 rounded border mx-1 ${
                                inventoryPagination.currentPage === page + 1
                                  ? "bg-pink-500 text-white"
                                  : ""
                              }`}
                            >
                              {page + 1}
                            </button>
                          )
                        )}

                        <button
                          disabled={
                            inventoryPagination.currentPage ===
                            inventoryPagination.totalPages
                          }
                          onClick={() =>
                            setInventoryPagination((prev) => ({
                              ...prev,
                              currentPage: prev.currentPage + 1,
                            }))
                          }
                          className="px-3 py-1 rounded border ml-2 disabled:opacity-50"
                        >
                          Tiếp
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <FaBox className="mx-auto text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-600">
                    Bạn chưa có món đồ nào trong bộ sưu tập.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Lịch sử giao dịch</h2>

              {/* Filter Section */}
              <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Bộ lọc</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại giao dịch
                    </label>
                    <select
                      value={transactionFilters.type}
                      onChange={(e) => {
                        setTransactionFilters((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }));
                        setTransactionPagination((prev) => ({
                          ...prev,
                          currentPage: 1,
                        }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Tất cả</option>
                      <option value="deposit">Thanh toán bằng ví</option>
                      <option value="deduction">Thanh toán chuyển khoản</option>
                      <option value="wallet">Nạp tiền vào ví</option>
                      <option value="refund">Hoàn tiền</option>
                      <option value="blindboxopen">Mở hộp quà</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền từ
                    </label>
                    <input
                      type="number"
                      value={transactionFilters.minAmount}
                      onChange={(e) => {
                        setTransactionFilters((prev) => ({
                          ...prev,
                          minAmount: e.target.value,
                        }));
                        setTransactionPagination((prev) => ({
                          ...prev,
                          currentPage: 1,
                        }));
                      }}
                      placeholder="Nhập số tiền tối thiểu"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền đến
                    </label>
                    <input
                      type="number"
                      value={transactionFilters.maxAmount}
                      onChange={(e) => {
                        setTransactionFilters((prev) => ({
                          ...prev,
                          maxAmount: e.target.value,
                        }));
                        setTransactionPagination((prev) => ({
                          ...prev,
                          currentPage: 1,
                        }));
                      }}
                      placeholder="Nhập số tiền tối đa"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tìm kiếm
                    </label>
                    <input
                      type="text"
                      value={transactionFilters.search}
                      onChange={(e) => {
                        setTransactionFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }));
                        setTransactionPagination((prev) => ({
                          ...prev,
                          currentPage: 1,
                        }));
                      }}
                      placeholder="Tìm kiếm giao dịch..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setTransactionFilters({
                        type: "",
                        minAmount: "",
                        maxAmount: "",
                        search: "",
                      });
                      setTransactionPagination((prev) => ({
                        ...prev,
                        currentPage: 1,
                      }));
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 mr-2"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>

              {transactionLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              ) : transactions.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.transactionId}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {transaction.description}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-gray-500">
                                {formatDateTime(transaction.createDate)}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  transaction.type === "Wallet"
                                    ? "bg-blue-100 text-blue-800"
                                    : transaction.type === "Refund"
                                    ? "bg-orange-100 text-orange-800"
                                    : transaction.type === "Deposit"
                                    ? "bg-pink-100 text-pink-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {getTransactionTypeLabel(transaction.type)}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`text-right ${getTransactionTypeStyle(
                              transaction.type
                            )}`}
                          >
                            <p className="font-medium text-lg">
                              {getTransactionPrefix(transaction.type)}
                              {formatCurrency(transaction.amount)}
                            </p>
                            {transaction.relatedId > 0 &&
                              transaction.type !== "Refund" && (
                                <p className="text-sm text-gray-500">
                                  Mã đơn hàng: #{transaction.relatedId}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Transaction Pagination */}
                  {transactionPagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <nav className="flex items-center">
                        <button
                          disabled={transactionPagination.currentPage === 1}
                          onClick={() =>
                            setTransactionPagination((prev) => ({
                              ...prev,
                              currentPage: prev.currentPage - 1,
                            }))
                          }
                          className="px-3 py-1 rounded border mr-2 disabled:opacity-50"
                        >
                          Trước
                        </button>

                        {[
                          ...Array(transactionPagination.totalPages).keys(),
                        ].map((page) => (
                          <button
                            key={page}
                            onClick={() =>
                              setTransactionPagination((prev) => ({
                                ...prev,
                                currentPage: page + 1,
                              }))
                            }
                            className={`px-3 py-1 rounded border mx-1 ${
                              transactionPagination.currentPage === page + 1
                                ? "bg-pink-500 text-white"
                                : ""
                            }`}
                          >
                            {page + 1}
                          </button>
                        ))}

                        <button
                          disabled={
                            transactionPagination.currentPage ===
                            transactionPagination.totalPages
                          }
                          onClick={() =>
                            setTransactionPagination((prev) => ({
                              ...prev,
                              currentPage: prev.currentPage + 1,
                            }))
                          }
                          className="px-3 py-1 rounded border ml-2 disabled:opacity-50"
                        >
                          Tiếp
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <FaWallet className="mx-auto text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-600">Bạn chưa có giao dịch nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile update confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận thay đổi</h3>
            <p className="mb-6">Bạn có chắc muốn cập nhật thông tin cá nhân?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border text-gray-700 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && orderToPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Thanh toán đơn hàng #{orderToPayment.orderId}
            </h3>

            {/* Order summary */}
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Ngày đặt:</span>
                  <span>{formatDateTime(orderToPayment.orderDate)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Địa chỉ:</span>
                  <span>{orderToPayment.address || "N/A"}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Số điện thoại:</span>
                  <span>{orderToPayment.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold mt-2 pt-2 border-t">
                  <span>Tổng tiền:</span>
                  <span className="text-pink-600">
                    {formatCurrency(orderToPayment.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Product details */}
              <h4 className="font-medium mb-2">Chi tiết sản phẩm:</h4>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderToPayment.details?.$values?.map((detail, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          Chi tiết #{detail.orderDetailId}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {detail.packageId ? "Package" : "BlindBox"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right font-medium">
                          {formatCurrency(detail.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Chọn phương thức thanh toán:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentType === "Order"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                  onClick={() => setPaymentType("Order")}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentType === "Order"
                          ? "border-pink-500"
                          : "border-gray-400"
                      }`}
                    >
                      {paymentType === "Order" && (
                        <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <span className="font-medium flex items-center">
                        <FaCreditCard className="mr-2 text-gray-600" />
                        Thanh toán trực tuyến
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Thanh toán qua VNPAY (ATM, Visa, MasterCard)
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentType === "Wallet"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                  onClick={() => setPaymentType("Wallet")}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentType === "Wallet"
                          ? "border-pink-500"
                          : "border-gray-400"
                      }`}
                    >
                      {paymentType === "Wallet" && (
                        <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <span className="font-medium flex items-center">
                        <FaWallet className="mr-2 text-gray-600" />
                        Thanh toán bằng ví
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Số dư ví:{" "}
                        {formatCurrency(userProfile.walletBalance || 0)}
                      </p>
                      {/* Show warning if wallet balance is insufficient */}
                      {paymentType === "Wallet" &&
                        userProfile.walletBalance <
                          orderToPayment.totalAmount && (
                          <p className="text-xs text-red-500 mt-1">
                            Số dư không đủ để thanh toán đơn hàng này
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border text-gray-700 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={processPayment}
                disabled={
                  paymentLoading ||
                  (paymentType === "Wallet" &&
                    userProfile.walletBalance < orderToPayment.totalAmount)
                }
                className={`px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center justify-center ${
                  paymentLoading ||
                  (paymentType === "Wallet" &&
                    userProfile.walletBalance < orderToPayment.totalAmount)
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {paymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  "Tiến hành thanh toán"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
