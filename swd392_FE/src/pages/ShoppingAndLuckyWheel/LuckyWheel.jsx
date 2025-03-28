import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaArrowRight, FaSearch, FaSort } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";

function LuckyWheel() {
  const [wheels, setWheels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/categories`);
        const categoryItems = response.data.$values || [];
        setCategories(categoryItems);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Không thể tải danh sách danh mục");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchWheels = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
          navigate("/login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/wheel`, {
          params: {
            page: pagination.currentPage,
            size: pagination.pageSize,
            search: searchTerm,
            filter: filterCategory,
            sortBy: sortBy,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle the nested response structure
        const wheelItems = response.data.items?.$values || [];
        setWheels(wheelItems);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
        }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching wheels:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
          navigate("/login");
        } else {
          toast.error("Không thể tải danh sách vòng quay");
        }
        setLoading(false);
      }
    };

    fetchWheels();
  }, [
    navigate,
    pagination.currentPage,
    pagination.pageSize,
    searchTerm,
    filterCategory,
    sortBy,
  ]);

  const formatCurrency = (amount) => {
    return amount?.toLocaleString("vi-VN") + " ₫";
  };

  const handleWheelClick = (packageCode) => {
    navigate(`/lucky-wheel/${packageCode}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
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
      <h1 className="text-3xl font-bold mb-8">Vòng Quay May Mắn</h1>

      {/* Search and Filter Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm vòng quay..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </form>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={handleFilterChange}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
            >
              <option value="">Sắp xếp theo</option>
              <option value="name">Tên (A-Z)</option>
              <option value="name_desc">Tên (Z-A)</option>
              <option value="code">Mã (A-Z)</option>
              <option value="code_desc">Mã (Z-A)</option>
            </select>
            <FaSort className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Wheels Grid */}
      {wheels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wheels.map((wheel) => (
            <div
              key={wheel.packageCode}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleWheelClick(wheel.packageCode)}
            >
              {/* Wheel Image */}
              <div className="relative h-48 bg-gray-100">
                {wheel.images?.$values?.[0]?.url ? (
                  <img
                    src={wheel.images.$values[0].url}
                    alt={wheel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">Không có hình ảnh</span>
                  </div>
                )}
                {/* Rate Badge */}
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  {(wheel.rate * 100).toFixed(1)}% Đặc biệt
                </div>
              </div>

              {/* Wheel Info */}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{wheel.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {wheel.description}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Giá mỗi lần quay:</p>
                    <p className="text-lg font-bold text-pink-600">
                      {formatCurrency(wheel.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng số box:</p>
                    <p className="text-lg font-bold">{wheel.totalBlindBoxes}</p>
                  </div>
                </div>
                <button className="w-full mt-4 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 flex items-center justify-center">
                  Quay ngay <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Không có vòng quay nào khả dụng.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              className="px-3 py-1 rounded border mr-2 disabled:opacity-50"
            >
              Trước
            </button>

            {[...Array(pagination.totalPages).keys()].map((page) => (
              <button
                key={page}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: page + 1,
                  }))
                }
                className={`px-3 py-1 rounded border mx-1 ${
                  pagination.currentPage === page + 1
                    ? "bg-pink-500 text-white"
                    : ""
                }`}
              >
                {page + 1}
              </button>
            ))}

            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
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
  );
}

export default LuckyWheel;
