import axios from "axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";

function BlogPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
    minVote: "",
    maxVote: "",
  });
  const [feedbackForm, setFeedbackForm] = useState({
    title: "",
    content: "",
    image: null,
  });

  useEffect(() => {
    fetchFeedbacks();
    fetchCompletedOrders();
  }, [pagination.page, pagination.size, filters]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để xem đánh giá");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/feedbacks/manager-feedbacks`,
        {
          params: {
            page: pagination.page,
            size: pagination.size,
            search: filters.search,
            filter: filters.filter,
            sortBy: filters.sortBy,
            minVote: filters.minVote || undefined,
            maxVote: filters.maxVote || undefined,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.items) {
        setFeedbacks(response.data.items.$values || []);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
        }));
      } else {
        setFeedbacks([]);
        setPagination((prev) => ({
          ...prev,
          totalItems: 0,
          totalPages: 1,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
      toast.error("Không thể tải danh sách đánh giá");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/orders/user-order`, {
        params: {
          filter: "completed",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.items && response.data.items.$values) {
        // Filter orders that have completed status
        const completedOrders = response.data.items.$values.filter((order) =>
          order.statuses.$values.some((status) => status.status === "Completed")
        );
        setOrders(completedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
      setOrders([]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeedbackForm((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để gửi đánh giá");
        return;
      }

      if (
        !selectedOrder ||
        !selectedOrder.details ||
        selectedOrder.details.$values.length === 0
      ) {
        toast.error("Vui lòng chọn đơn hàng");
        return;
      }

      if (!feedbackForm.title.trim()) {
        toast.error("Vui lòng nhập tiêu đề");
        return;
      }

      if (!feedbackForm.content.trim()) {
        toast.error("Vui lòng nhập nội dung");
        return;
      }

      const formData = new FormData();
      formData.append("userId", localStorage.getItem("userId"));
      formData.append(
        "blindBoxId",
        selectedOrder.details.$values[0].blindBoxId
      );
      formData.append("title", feedbackForm.title.trim());
      formData.append("content", feedbackForm.content.trim());
      if (feedbackForm.image) {
        formData.append("image", feedbackForm.image);
      }

      await axios.post(`${BASE_URL}/feedbacks/create-feedback`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Đánh giá đã được gửi thành công!");
      setShowFeedbackModal(false);
      setFeedbackForm({ title: "", content: "", image: null });
      fetchFeedbacks();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Không thể gửi đánh giá");
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog Đánh Giá</h1>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          Viết Đánh Giá ({orders.length})
        </button>
      </div>

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
              placeholder="Tìm theo tiêu đề hoặc nội dung..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
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
              <option value="vote_desc">Lượt thích cao nhất</option>
              <option value="vote">Lượt thích thấp nhất</option>
              <option value="date_desc">Mới nhất</option>
              <option value="date">Cũ nhất</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo lượt thích
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minVote}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, minVote: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Tối thiểu"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="number"
                value={filters.maxVote}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, maxVote: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Tối đa"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.feedbackId}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {feedback.image && (
              <img
                src={feedback.image}
                alt={feedback.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {feedback.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {feedback.content}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{feedback.userName}</span>
                <span>
                  {format(new Date(feedback.createDate), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-green-500">👍 {feedback.upVote}</span>
                <span className="text-red-500">👎 {feedback.downVote}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Trước
          </button>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Sau
          </button>
        </nav>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Viết Đánh Giá</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn đơn hàng
              </label>
              <select
                onChange={(e) => {
                  const order = orders.find(
                    (o) => o.orderId === parseInt(e.target.value)
                  );
                  setSelectedOrder(order);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Chọn đơn hàng...</option>
                {orders.map((order) => (
                  <option key={order.orderId} value={order.orderId}>
                    Đơn hàng #{order.orderId} -{" "}
                    {order.details.$values[0].blindBoxId}
                  </option>
                ))}
              </select>
            </div>
            {selectedOrder &&
              selectedOrder.details &&
              selectedOrder.details.$values.length > 0 && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề
                    </label>
                    <input
                      type="text"
                      value={feedbackForm.title}
                      onChange={(e) =>
                        setFeedbackForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Nhập tiêu đề đánh giá"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung
                    </label>
                    <textarea
                      value={feedbackForm.content}
                      onChange={(e) =>
                        setFeedbackForm((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      rows="4"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Nhập nội dung đánh giá"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {selectedOrder.details.$values[0].blindBox?.packageCode && (
                      <span className="text-sm text-gray-500">
                        Mã:{" "}
                        {selectedOrder.details.$values[0].blindBox.packageCode}
                      </span>
                    )}
                    {selectedOrder.details.$values[0].blindBox?.color && (
                      <span className="text-sm text-gray-500">
                        | Màu: {selectedOrder.details.$values[0].blindBox.color}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-600 font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(
                        selectedOrder.details.$values[0].blindBox
                          ?.discountedPrice ||
                          selectedOrder.details.$values[0].blindBox?.price
                      )}
                    </span>
                    {selectedOrder.details.$values[0].blindBox?.isSpecial && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Đặc biệt
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        selectedOrder.details.$values[0].status === "Available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedOrder.details.$values[0].status === "Available"
                        ? "Khả dụng"
                        : "Không khả dụng"}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowFeedbackModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogPage;
