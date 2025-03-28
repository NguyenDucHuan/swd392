import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { RiAddLine, RiCloseFill, RiDeleteBin6Line, RiEditLine, RiFilter3Line, RiInformationLine, RiSearchLine } from 'react-icons/ri';
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
  const [isKnownFilter, setIsKnownFilter] = useState(null); // null means "all"
  const [showIsKnownDropdown, setShowIsKnownDropdown] = useState(false);
  
  // For the dropdown UI
  const [expandedPackageId, setExpandedPackageId] = useState(null);
  const detailsDropdownRef = useRef(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleOutsideClick(event) {
      if (expandedPackageId !== null && 
          detailsDropdownRef.current && 
          !detailsDropdownRef.current.contains(event.target)) {
        setExpandedPackageId(null);
      }
    }
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [expandedPackageId]);

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
          categoryId: selectedCategory > 0 ? selectedCategory : undefined,
          isKnown: isKnownFilter 
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
  }, [pagination.currentPage, pagination.pageSize, selectedCategory, selectedFilter, isKnownFilter]);
  
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

  const togglePackageDetails = (packageId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedPackageId(prev => prev === packageId ? null : packageId);
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;
    const token = localStorage.getItem('access_token');
    try {
      await axios.delete(`${BASE_URL}/package/delete-package?packageId=${packageToDelete.packageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'available', label: 'Còn hàng' },
    { value: 'sold', label: 'Đã bán' }
  ];

  // Render BlindBox details similar to order details in ProfilePage
  const renderBlindBoxDetails = (pkg) => {
    if (!pkg.blindBoxes || !pkg.blindBoxes.$values || pkg.blindBoxes.$values.length === 0) return null;
  
    const blindBoxes = pkg.blindBoxes.$values;
  
    return (
      <div className="p-4 bg-gray-50">
        <div className="mb-3">
          <h4 className="font-medium text-gray-900 mb-2">Thông tin BlindBox</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blindBoxes.map((box, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">BlindBox #{box.number}</span>
                  <div className="flex space-x-1">
                    {box.isSpecial && (
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs">SECRET</span>
                    )}
                    {box.isSold && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">ĐÃ BÁN</span>
                    )}
                    {!box.status && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">KO HOẠT ĐỘNG</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div><span className="text-gray-500">Màu:</span> {box.color || 'N/A'}</div>
                  <div><span className="text-gray-500">Kích thước:</span> {box.size || 'N/A'}cm</div>
                  <div><span className="text-gray-500">Giá gốc:</span> {box.price?.toLocaleString() || 'N/A'}đ</div>
                  <div>
                    <span className="text-gray-500">Giảm giá:</span>{' '}
                    {box.discount > 0 ? `${box.discount}%` : 'Không giảm giá'}
                  </div>
                  {box.discount > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Giá sau giảm:</span>{' '}
                      <span className="ml-1 text-pink-600 font-medium">
                        {box.discountedPrice?.toLocaleString() || 'N/A'}đ
                      </span>
                    </div>
                  )}
                  <div><span className="text-gray-500">Loại:</span> {box.isKnowned ? 'Known Box' : 'Unknown Box'}</div>
                  <div>
                    <span className="text-gray-500">Trạng thái:</span>{' '}
                    {box.isSold ? 'Chưa bán' : 'Đã bán'}
                  </div>
                </div>
                
                {box.features && box.features.$values && box.features.$values.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-500 text-sm">Đặc tính:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {box.features.$values.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {feature.description || feature.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {box.imageUrls && box.imageUrls.$values && box.imageUrls.$values.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-500 text-sm">Hình ảnh:</span>
                    <div className="flex overflow-x-auto space-x-2 mt-1 pb-1">
                      {box.imageUrls.$values.map((image, imgIdx) => (
                        <img
                          key={imgIdx}
                          src={image.url}
                          alt={`BlindBox ${box.number}`}
                          className="w-16 h-16 object-cover rounded"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Package</h1>
        
        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Link to="/package/create-unknown" className="flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50">
            <RiAddLine className="mr-2" />
            Create Unknown Package
          </Link>
          <Link to="/package/create-known" className="flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50">
            <RiAddLine className="mr-2" />
            Create Known Package
          </Link>
          <button className="flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg col-span-2 hover:bg-pink-600">
            <RiFilter3Line className="mr-2" />
            Xuất báo cáo
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col space-y-4">
          {/* Search */}
          <div className="w-full">
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
                className="px-4 py-2 bg-pink-500 text-white rounded-r-lg hover:bg-pink-600"
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="relative">
              <button 
                className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 min-w-[150px]"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <span>
                  {filterOptions.find(option => option.value === selectedFilter)?.label || 'Trạng thái'}
                </span>
                <RiFilter3Line className="ml-2" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                  {filterOptions.map(option => (
                    <button
                      key={option.value}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${selectedFilter === option.value ? 'bg-pink-50 text-pink-600' : ''}`}
                      onClick={() => {
                        setSelectedFilter(option.value);
                        setShowFilterDropdown(false);
                        setPagination({ ...pagination, currentPage: 1 });
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button 
                className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 min-w-[200px]"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span>
                  {selectedCategory === 0 
                    ? 'Tất cả danh mục' 
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
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${selectedCategory === 0 ? 'bg-pink-50 text-pink-600' : ''}`}
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
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${selectedCategory === category.categoryId ? 'bg-pink-50 text-pink-600' : ''}`}
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

            {/* isKnown Filter */}
            <div className="relative">
              <button 
                className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 min-w-[180px]"
                onClick={() => setShowIsKnownDropdown(!showIsKnownDropdown)}
              >
                <span>
                  {isKnownFilter === null ? 'Tất cả Package' : 
                  isKnownFilter === true ? 'Known Package' : 'Unknown Package'}
                </span>
                <RiFilter3Line className="ml-2" />
              </button>
              
              {showIsKnownDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${isKnownFilter === null ? 'bg-pink-50 text-pink-600' : ''}`}
                    onClick={() => {
                      setIsKnownFilter(null);
                      setShowIsKnownDropdown(false);
                      setPagination({ ...pagination, currentPage: 1 });
                    }}
                  >
                    Tất cả Package
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${isKnownFilter === true ? 'bg-pink-50 text-pink-600' : ''}`}
                    onClick={() => {
                      setIsKnownFilter(true);
                      setShowIsKnownDropdown(false);
                      setPagination({ ...pagination, currentPage: 1 });
                    }}
                  >
                    Known Package
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${isKnownFilter === false ? 'bg-pink-50 text-pink-600' : ''}`}
                    onClick={() => {
                      setIsKnownFilter(false);
                      setShowIsKnownDropdown(false);
                      setPagination({ ...pagination, currentPage: 1 });
                    }}
                  >
                    Unknown Package
                  </button>
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            <button 
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('');
                setSelectedCategory(0);
                setIsKnownFilter(null);
                setPagination({ ...pagination, currentPage: 1 });
              }}
            >
              <RiCloseFill className="mr-1" />
              Xóa bộ lọc
            </button>
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
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chi tiết
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.length > 0 ? (
                    <>
                      {packages.map(pkg => (
                        <React.Fragment key={pkg.packageId}>
                          {/* Main package row */}
                          <tr className={`hover:bg-gray-50 ${expandedPackageId === pkg.packageId ? 'bg-gray-50 border-b-0' : ''}`}>
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
                              {pkg.blindBoxes?.$values?.length || pkg.totalBlindBox || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {pkg.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              {pkg.blindBoxes && pkg.blindBoxes.$values && pkg.blindBoxes.$values.length > 0 ? (
                                <button 
                                  className="text-pink-600 hover:text-pink-800 flex items-center justify-center mx-auto"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setExpandedPackageId(expandedPackageId === pkg.packageId ? null : pkg.packageId);
                                  }}
                                >
                                  <RiInformationLine className="mr-1" size={18} />
                                  {expandedPackageId === pkg.packageId ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                </button>
                              ) : (
                                <span className="text-gray-400">Không có dữ liệu</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link 
                                  to={`/package/edit/${pkg.packageId}`}
                                  className="text-pink-600 hover:text-pink-900 p-1"
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
                          
                          {/* Expanded details row */}
                          {expandedPackageId === pkg.packageId && (
                            <tr>
                              <td colSpan="8" className="px-0 py-0 border-t-0">
                                {renderBlindBoxDetails(pkg)}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
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
                        pagination.currentPage === page + 1 ? 'bg-pink-500 text-white' : ''
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