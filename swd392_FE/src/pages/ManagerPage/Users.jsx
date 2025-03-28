import axios from "axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInventory, setUserInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    filter: "",
    sortBy: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.size, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/users`, {
        params: {
          page: pagination.page,
          size: pagination.size,
          search: filters.search,
          filter: filters.filter,
          sortBy: filters.sortBy,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const filteredUsers =
        response.data.items.$values.filter(
          (user) => user.role.toLowerCase() !== "admin"
        ) || [];
      setUsers(filteredUsers);
      setPagination((prev) => ({
        ...prev,
        totalItems: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / pagination.size),
      }));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInventory = async (userId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/inventories/other`, {
        params: {
          userId: userId,
          page: 1,
          size: 10,
        },
      });
      console.log(response);
      setUserInventory(response.data.items.$values || []);
      setSelectedUser(userId);
    } catch (error) {
      console.error("Failed to fetch user inventory:", error);
      toast.error("Không thể tải thông tin inventory");
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      await axios.patch(
        `${BASE_URL}/users/status/${userId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Cập nhật trạng thái thành công");
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Không thể cập nhật trạng thái người dùng");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Quản lý Người dùng
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, search: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lọc theo vai trò
              </label>
              <select
                value={filters.filter}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, filter: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Tất cả</option>
                <option value="user">Người dùng</option>
                <option value="staff">Nhân viên</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sắp xếp
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Mặc định</option>
                <option value="wallet_desc">Số dư giảm dần</option>
                <option value="wallet">Số dư tăng dần</option>
                <option value="date_desc">Ngày tạo mới nhất</option>
                <option value="date">Ngày tạo cũ nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số dư
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(user.walletBalance || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => fetchUserInventory(user.userId)}
                      disabled={user.role.toLowerCase() !== "user"}
                      className={`text-pink-600 hover:text-pink-900 mr-4 ${
                        user.role.toLowerCase() !== "user"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Xem Inventory
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(user.userId, !user.status)
                      }
                      className={`${
                        user.status
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {user.status ? "Khóa" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">{pagination.page}</span> đến{" "}
                  <span className="font-medium">{pagination.totalPages}</span>{" "}
                  trong{" "}
                  <span className="font-medium">{pagination.totalItems}</span>{" "}
                  kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* User Inventory Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Inventory của người dùng
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Màu sắc
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đặc điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày thêm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userInventory.map((item) => (
                      <tr key={item.inventoryItemId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={
                                  item.blindBox?.imageUrls?.$values?.[0]?.url ||
                                  "https://via.placeholder.com/40"
                                }
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.blindBox?.packageName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.blindBox?.packageCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.blindBox?.color}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {item.blindBox?.features?.$values?.map(
                              (feature, index) => (
                                <span
                                  key={feature.featureId}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1"
                                >
                                  {feature.type}: {feature.description}
                                </span>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.blindBox?.discountedPrice || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(item.addDate), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === "Available"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status === "Available"
                              ? "Khả dụng"
                              : "Không khả dụng"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
