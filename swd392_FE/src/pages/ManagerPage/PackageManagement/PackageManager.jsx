import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { RiAddLine, RiCloseFill, RiDeleteBin6Line, RiEditLine, RiFilter3Line, RiSearchLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../configs/globalVariables';

function PackageManager() {
  // State management
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/categories`);
        if (response.data && Array.isArray(response.data)) {
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
      let filterParam = selectedFilter || undefined;
      
      const response = await axios.get(`${BASE_URL}/packages`, {
        params: {
          page: pagination.currentPage,
          size: pagination.pageSize,
          search: searchTerm || undefined,
          filter: filterParam,
          categoryId: selectedCategory > 0 ? selectedCategory : undefined
        }
      });
      
      let packageData = [];
      if (response.data && response.data.items && Array.isArray(response.data.items.$values)) {
        packageData = response.data.items.$values;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        packageData = response.data.items;
      } else if (response.data && Array.isArray(response.data.$values)) {
        packageData = response.data.$values;
      } else if (Array.isArray(response.data)) {
        packageData = response.data;
      } else {
        console.error("Unexpected API response format:", response.data);
      }
      
      setPackages(packageData);
      setPagination({
        ...pagination,
        totalItems: response.data.total || 0,
        totalPages: response.data.totalPages || 1
      });
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách package");
      toast.error("Không thể tải danh sách package");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchPackages();
  }, [pagination.currentPage, pagination.pageSize, selectedCategory, selectedFilter]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
    fetchPackages();
  };

  // Filter by category
  const filterByCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;
    
    try {
      await axios.delete(`${BASE_URL}/package/delete-package?packageId=${packageToDelete.packageId}`);
      toast.success("Package đã được xóa thành công");
      fetchPackages();
    } catch (err) {
      console.error("Failed to delete package:", err);
      toast.error(err.response?.data?.detail || "Không thể xóa package");
    } finally {
      setShowDeleteModal(false);
      setPackageToDelete(null);
    }
  };

  // Filter options
  const filterOptions = [
    { value: '', label: 'AllAll' },
    { value: 'available', label: 'available' },
    { value: 'sold', label: 'sold' }
  ];

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Package</h1>
        
        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Link to="/package/create-unknown" className="flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50">
            <RiAddLine className="mr-2" />
            Create Unknown Package
          </Link>
          <Link to="/package/create-known" className="flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50">
            <RiAddLine className="mr-2" />
            Create Known Package
          </Link>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg col-span-2 hover:bg-blue-600">
            <RiFilter3Line className="mr-2" />
            Xuất báo cáo
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="md:flex-1">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã package..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                >
                  Tìm kiếm
                </button>
              </form>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative">
                <button 
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <RiFilter3Line className="mr-2" />
                  {filterOptions.find(option => option.value === selectedFilter)?.label || 'Trạng thái'}
                </button>
                
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                    {filterOptions.map(option => (
                      <button
                        key={option.value}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${selectedFilter === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
                        onClick={() => {
                          setSelectedFilter(option.value);
                          setShowFilterDropdown(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category filters */}
          <div className="mt-4 flex gap-2">
  <div className="relative">
    <button 
      className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 min-w-[200px]"
      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
    >
      <span>
        {selectedCategory === 0 
          ? 'All Categories' 
          : categories.find(c => c.categoryId === selectedCategory)?.name || 'Danh mục'}
      </span>
      <RiFilter3Line className="ml-2" />
    </button>
    
    {showCategoryDropdown && (
      <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
        <div className="p-2 border-b">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm danh mục..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          <button
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${selectedCategory === 0 ? 'bg-blue-50 text-blue-600' : ''}`}
            onClick={() => {
              filterByCategory(0);
              setShowCategoryDropdown(false);
              setCategorySearchTerm('');
            }}
          >
            Tất cả danh mục
          </button>
          {categories
            .filter(category => 
              category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
            )
            .map(category => (
              <button
                key={category.categoryId}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${selectedCategory === category.categoryId ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => {
                  filterByCategory(category.categoryId);
                  setShowCategoryDropdown(false);
                  setCategorySearchTerm('');
                }}
              >
                {category.name}
              </button>
            ))}
        </div>
      </div>
    )}
  </div>
</div>
        </div>

        {/* Loading and error states */}
        {loading && <div className="text-center py-10">Đang tải dữ liệu...</div>}
        {error && <div className="text-center text-red-500 py-10">{error}</div>}

        {/* Package list */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên Package
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhà sản xuất
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số BlindBox
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.length > 0 ? (
                    packages.map(pkg => (
                      <tr key={pkg.packageId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pkg.pakageCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.category?.name || 'Không có'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.manufacturer || 'Không có'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.blindBoxes?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pkg.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              to={`/package/edit/${pkg.packageId}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                            >
                              <RiEditLine size={18} />
                            </Link>
                            <button 
                              className="text-red-600 hover:text-red-900 p-1"
                              onClick={() => {
                                setPackageToDelete(pkg);
                                setShowDeleteModal(true);
                              }}
                            >
                              <RiDeleteBin6Line size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        Không tìm thấy package nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center">
                  <button
                    disabled={pagination.currentPage === 1}
                    onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                    className="px-3 py-1 rounded border mr-2 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  
                  {[...Array(pagination.totalPages).keys()].map(page => (
                    <button
                      key={page}
                      onClick={() => setPagination({...pagination, currentPage: page + 1})}
                      className={`px-3 py-1 rounded border mx-1 ${
                        pagination.currentPage === page + 1 ? 'bg-blue-500 text-white' : ''
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  
                  <button
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                    className="px-3 py-1 rounded border ml-2 disabled:opacity-50"
                  >
                    Tiếp
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Xác nhận xoá</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <RiCloseFill size={24} />
              </button>
            </div>
            <p className="mb-4">
              Bạn có chắc chắn muốn xoá package "{packageToDelete?.name}" không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleDeletePackage}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackageManager;