import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  RiCloseFill,
  RiEyeLine,
  RiFileChartLine,
  RiFilter3Line,
  RiRefreshLine,
  RiSearchLine
} from 'react-icons/ri';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../configs/globalVariables';

function OrderManagerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Get the current (most recent) status from the statuses array
  const getCurrentStatus = (order) => {
    if (!order.statuses || !order.statuses.$values || order.statuses.$values.length === 0) {
      return 'Pending';
    }
    
    // Sort by updateTime descending and get the most recent status
    const sortedStatuses = [...order.statuses.$values].sort((a, b) => 
      new Date(b.updateTime) - new Date(a.updateTime)
    );
    
    return sortedStatuses[0].status;
  };
  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, pagination.pageSize, selectedFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedFilter) {
        params.status = selectedFilter;
      }
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Bạn cần đăng nhập để xem đơn hàng");
        toast.error("Bạn cần đăng nhập để xem đơn hàng");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${BASE_URL}/orders/all-order`, { 
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      let orderData = [];
      if (response.data && response.data.items && response.data.items.$values) {
        orderData = response.data.items.$values;
      } else if (response.data && response.data.$values) {
        orderData = response.data.$values;
      } else if (Array.isArray(response.data)) {
        orderData = response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        orderData = response.data.items;
      } else {
        console.error("Unexpected API response format:", response.data);
      }
      
      setOrders(orderData);
      setPagination({
        ...pagination,
        totalItems: response.data.total || 0,
        totalPages: response.data.totalPages || 1
      });
      setError(null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        setError("Không thể tải danh sách đơn hàng");
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
    fetchOrders();
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      toast.error("Bạn cần đăng nhập để cập nhật trạng thái đơn hàng");
      return;
    }

    const currentStatus = getCurrentStatus(selectedOrder)?.toLowerCase();
    
    // Status transition validation logic
    switch (newStatus.toLowerCase()) {
      case 'pending':
        // Pending can be set from any status (for reset purposes)
        break;
        
      case 'paid':
        // Only allow transition to Paid from Pending
        if (currentStatus !== 'pending') {
          toast.error("Chỉ đơn hàng ở trạng thái Chờ xử lý mới có thể chuyển sang Đã thanh toán");
          return;
        }
        break;
        
      case 'shipping':
        // Only allow transition to Shipping from Paid
        if (currentStatus !== 'paid') {
          toast.error("Chỉ những đơn hàng đã thanh toán mới có thể chuyển sang trạng thái vận chuyển");
          return;
        }
        
        // Use confirm-order endpoint for shipping status
        await axios.post(`${BASE_URL}/orders/confirm-order?orderId=${orderId}`, 
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        // Return early as we've already made the API call
        break;
        
      case 'completed':
        // Only allow completion from Shipping status
        if (currentStatus !== 'shipping') {
          toast.error("Chỉ đơn hàng ở trạng thái Đang vận chuyển mới có thể chuyển sang Hoàn thành");
          return;
        }
        break;
        
      case 'canceled':
        // Only allow cancellation from Pending or Paid, not from Shipping or Completed
        if (currentStatus !== 'pending' && currentStatus !== 'paid') {
          toast.error("Không thể hủy đơn hàng đã vận chuyển hoặc hoàn thành");
          return;
        }
        break;
    }
    
    // If not shipping status (which is already handled), make the regular status update API call
    if (newStatus.toLowerCase() !== 'shipping') {
      await axios.put(`${BASE_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    }
    
    // Update local state
    const updatedOrders = orders.map(order => {
      if (order.orderId === orderId) {
        const newStatusObj = {
          status: newStatus,
          updateTime: new Date().toISOString()
        };
        
        return {
          ...order,
          statuses: {
            $id: order.statuses?.$id || "",
            $values: [newStatusObj, ...(order.statuses?.$values || [])]
          }
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    
    toast.success("Trạng thái đơn hàng đã được cập nhật!");
    
    if (selectedOrder?.orderId === orderId) {
      const newStatusObj = {
        status: newStatus,
        updateTime: new Date().toISOString()
      };
      
      setSelectedOrder({
        ...selectedOrder,
        statuses: {
          $id: selectedOrder.statuses?.$id || "",
          $values: [newStatusObj, ...(selectedOrder.statuses?.$values || [])]
        }
      });
    }
  } catch (err) {
    console.error("Failed to update order status:", err);
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    } else {
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    }
  }
};

  // Export orders to CSV/Excel
  const exportOrders = () => {
    toast.info("Tính năng xuất báo cáo đang được phát triển");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN') + ' ₫';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-pink-100 text-pink-800';
      case 'shipping':
        return 'bg-pink-100 text-pink-800';
      
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter options
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'shipping', label: 'Đang vận chuyển' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'canceled', label: 'Đã hủy' }
  ];

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Đơn hàng</h1>
        
        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <button 
            onClick={exportOrders}
            className="flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg col-span-2 hover:bg-pink-600"
          >
            <RiFileChartLine className="mr-2" />
            Xuất báo cáo
          </button>
          <button 
            onClick={fetchOrders}
            className="flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50"
          >
            <RiRefreshLine className="mr-2" />
            Làm mới
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
                    placeholder="Tìm theo mã đơn hàng hoặc số điện thoại..."
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
                    {statusOptions.find(option => option.value === selectedFilter)?.label || 'Trạng thái'}
                  </span>
                  <RiFilter3Line className="ml-2" />
                </button>
                
                {showFilterDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                    {statusOptions.map(option => (
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

              {/* Clear Filters Button */}
              <button 
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('');
                  setPagination({ ...pagination, currentPage: 1 });
                  fetchOrders();
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

        {/* Orders list */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    <>
                      {orders.map(order => (
                        <React.Fragment key={order.orderId}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">#{order.orderId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{order.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{order.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.orderDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(getCurrentStatus(order))}`}>
                                {getCurrentStatus(order)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => viewOrderDetails(order)}
                                className="text-pink-600 hover:text-pink-900 mr-3"
                              >
                                <RiEyeLine size={18} />
                              </button>
                            </td>
                          </tr>
                          
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        Không tìm thấy đơn hàng nào
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

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chi tiết đơn hàng #{selectedOrder.orderId}</h3>
              <button 
                onClick={() => setShowOrderDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <RiCloseFill size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium mb-2 text-gray-700">Thông tin khách hàng</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-1"><span className="font-medium">Tên:</span> {selectedOrder.user?.userName || 'N/A'}</p>
                  <p className="mb-1"><span className="font-medium">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                  <p className="mb-1"><span className="font-medium">Số điện thoại:</span> {selectedOrder.phone || 'N/A'}</p>
                  <p><span className="font-medium">Địa chỉ:</span> {selectedOrder.address || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-gray-700">Thông tin đơn hàng</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-1"><span className="font-medium">Mã đơn hàng:</span> #{selectedOrder.orderId}</p>
                  <p className="mb-1"><span className="font-medium">Ngày đặt:</span> {formatDate(selectedOrder.orderDate)}</p>
                  <p className="mb-1"><span className="font-medium">Tổng tiền:</span> {formatCurrency(selectedOrder.totalAmount)}</p>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Trạng thái hiện tại:</span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(getCurrentStatus(selectedOrder))}`}>
                      {getCurrentStatus(selectedOrder)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Status Timeline */}
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-gray-700">Lịch sử trạng thái</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                {selectedOrder.statuses?.$values?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedOrder.statuses.$values
                      .sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
                      .map((statusItem, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className="relative">
                            <div className={`w-4 h-4 rounded-full ${getStatusBadgeClass(statusItem.status)} border border-white`}></div>
                            {idx < (selectedOrder.statuses.$values.length - 1) && (
                              <div className="absolute top-4 left-1/2 w-0.5 h-5 -ml-px bg-gray-200"></div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(statusItem.status)}`}>
                                {statusItem.status}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatDate(statusItem.updateTime)}
                              </span>
                            </div>
                            {statusItem.note && (
                              <p className="mt-1 text-xs text-gray-600">{statusItem.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Không có thông tin lịch sử trạng thái</p>
                )}
              </div>
            </div>
            
            <h4 className="font-medium mb-2 text-gray-700">Chi tiết sản phẩm</h4>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedOrder.details?.$values?.map((detail, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{detail.pakageCode || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{detail.type || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                        {detail.quantity || 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                        {formatCurrency(detail.price)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                        {formatCurrency(detail.price * (detail.quantity || 1))}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">
                        Không có thông tin chi tiết
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-medium">Tổng cộng:</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 text-gray-700">Cập nhật trạng thái</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.orderId, 'Pending')}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    getCurrentStatus(selectedOrder)?.toLowerCase() === 'pending' 
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Chờ xử lý
                </button>
                
                <button
                  onClick={() => updateOrderStatus(selectedOrder.orderId, 'Paid')}
                  disabled={getCurrentStatus(selectedOrder)?.toLowerCase() !== 'pending'}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    getCurrentStatus(selectedOrder)?.toLowerCase() === 'paid' 
                      ? 'bg-pink-100 border-pink-300 text-pink-800' 
                      : getCurrentStatus(selectedOrder)?.toLowerCase() !== 'pending'
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Đã thanh toán
                </button>
                
                <button
                  onClick={() => updateOrderStatus(selectedOrder.orderId, 'Shipping')}
                  disabled={getCurrentStatus(selectedOrder)?.toLowerCase() !== 'paid'}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    getCurrentStatus(selectedOrder)?.toLowerCase() === 'shipping' 
                      ? 'bg-pink-100 border-pink-300 text-pink-800' 
                      : getCurrentStatus(selectedOrder)?.toLowerCase() !== 'paid'
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Đang vận chuyển
                </button>
                
                <button
                  onClick={() => updateOrderStatus(selectedOrder.orderId, 'Completed')}
                  disabled={getCurrentStatus(selectedOrder)?.toLowerCase() !== 'shipping'}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    getCurrentStatus(selectedOrder)?.toLowerCase() === 'completed' 
                      ? 'bg-green-100 border-green-300 text-green-800' 
                      : getCurrentStatus(selectedOrder)?.toLowerCase() !== 'shipping'
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Hoàn thành
                </button>
                
                <button
                  onClick={() => updateOrderStatus(selectedOrder.orderId, 'Canceled')}
                  disabled={['shipping', 'completed'].includes(getCurrentStatus(selectedOrder)?.toLowerCase())}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    getCurrentStatus(selectedOrder)?.toLowerCase() === 'canceled' 
                      ? 'bg-red-100 border-red-300 text-red-800' 
                      : ['shipping', 'completed'].includes(getCurrentStatus(selectedOrder)?.toLowerCase())
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Hủy đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagerPage;