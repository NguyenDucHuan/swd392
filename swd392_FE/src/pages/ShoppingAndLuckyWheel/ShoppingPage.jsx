import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";

function ShoppingPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0); // 0 means all categories
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 8,
    totalItems: 0,
    totalPages: 1
  });

  // Categories - you may want to fetch these from your API as well
  const [categories, setCategories] = useState([]);

  // Fetch categories 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/categories`);
        if (response.data && Array.isArray(response.data.items)) {
          setCategories(response.data.items);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.$values)) {
          setCategories(response.data.$values);
        } else {
          console.error("Unexpected API response format:", response.data);
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        toast.error("Không thể tải danh mục sản phẩm");
        setCategories([]);
      }
    };
  
    fetchCategories();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      console.log("Fetching with params:", {
        page: pagination.currentPage,
        size: pagination.pageSize,
        search: searchTerm || undefined,
        filter: "available",
        categoryId: selectedCategory > 0 ? selectedCategory : undefined
      });
      
      const response = await axios.get(`${BASE_URL}/packages`, {
        params: {
          page: pagination.currentPage,
          size: pagination.pageSize,
          search: searchTerm || undefined,
          filter: "available", 
          categoryId: selectedCategory > 0 ? selectedCategory : undefined,
          representativeCount: 1 
        }
      });
      
      console.log("API response structure:", response.data);
      
      // Handle different response formats
      if (response.data && response.data.items && response.data.items.$values) {
        // Handle the specific structure from your API
        setPackages(response.data.items.$values);
        console.log("Using items.$values format");
      } else if (response.data && Array.isArray(response.data.items)) {
        setPackages(response.data.items);
        console.log("Using array items format");
      } else if (Array.isArray(response.data)) {
        setPackages(response.data);
        console.log("Using direct array response");
      } else if (response.data && response.data.$values) {
        setPackages(response.data.$values);
        console.log("Using root $values format");
      } else {
        setPackages([]);
        console.error("Unexpected API response format:", response.data);
      }
      
      setPagination({
        ...pagination,
        totalItems: response.data.total || 0,
        totalPages: response.data.totalPages || 1
      });
      setError(null);
    } catch (err) {
      setError("Không thể tải sản phẩm");
      toast.error("Không thể tải danh sách sản phẩm");
      console.error("API error details:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch packages when component mounts or dependencies change
  useEffect(() => {
    fetchPackages();
  }, [pagination.currentPage, pagination.pageSize, selectedCategory]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 }); // Reset to first page
    fetchPackages();
  };

  // Filter by category
  const filterByCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setPagination({ ...pagination, currentPage: 1 }); // Reset to first page
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Danh sách Blind Box</h1>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center justify-center">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="px-4 py-2 border border-gray-300 rounded-l-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center space-x-2 space-y-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg transition ${selectedCategory === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => filterByCategory(0)}
        >
          Tất cả
        </button>
        {categories.map(category => (
          <button
            key={category.categoryId}
            className={`px-4 py-2 rounded-lg transition ${selectedCategory === category.categoryId ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => filterByCategory(category.categoryId)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Loading and error states */}
      {loading && <div className="text-center py-10">Đang tải sản phẩm...</div>}
      {error && <div className="text-center text-red-500 py-10">{error}</div>}

      {/* Product grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {packages.length > 0 ? (
  packages.map(pkg => (
    <div key={pkg.packageId} className="border rounded-lg shadow-lg p-4 bg-white hover:shadow-xl transition">
      <img 
        src={(pkg.images && pkg.images.$values && pkg.images.$values.length > 0) 
          ? pkg.images.$values[0].url 
          : (pkg.packageImages && pkg.packageImages.length > 0 
              ? pkg.packageImages[0].url 
              : 'placeholder-image.jpg')} 
        alt={pkg.name} 
        className="w-full h-40 object-contain mb-4" 
      />
      <h2 className="text-lg font-semibold truncate">{pkg.name}</h2>
      <p className="text-sm text-gray-500 mb-2">{pkg.manufacturer}</p>
      
      {pkg.blindBoxes && pkg.blindBoxes.$values && pkg.blindBoxes.$values.length > 0 ? (
        <p className="text-green-600 font-bold text-lg">
          {pkg.blindBoxes.$values[0].discountedPrice.toLocaleString('vi-VN')} ₫
          {pkg.blindBoxes.$values[0].discount > 0 && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {pkg.blindBoxes.$values[0].price.toLocaleString('vi-VN')} ₫
            </span>
          )}
        </p>
      ) : pkg.blindBoxes && pkg.blindBoxes.length > 0 ? (
        <p className="text-green-600 font-bold text-lg">
          {pkg.blindBoxes[0].discountedPrice.toLocaleString('vi-VN')} ₫
          {pkg.blindBoxes[0].discount > 0 && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {pkg.blindBoxes[0].price.toLocaleString('vi-VN')} ₫
            </span>
          )}
        </p>
      ) : (
        <p className="text-gray-500">Giá không có sẵn</p>
      )}
      
      <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
        Xem chi tiết
      </button>
    </div>
  ))
        ) : (
          <div className="col-span-full text-center py-10">
            Không tìm thấy sản phẩm nào
          </div>
        )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Trước
                </button>
                
                {[...Array(pagination.totalPages).keys()].map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination({...pagination, currentPage: page + 1})}
                    className={`px-3 py-1 rounded border ${
                      pagination.currentPage === page + 1 ? 'bg-blue-500 text-white' : ''
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
                
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ShoppingPage;