import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaBox, FaCreditCard, FaEdit, FaEye, FaSave, FaShoppingBag, FaUser, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../configs/globalVariables';
import { useAuth } from '../../contexts/AuthContext';

function ProfilePage() {
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [orderHistory, setOrderHistory] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phone, setPhone] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // Payment modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orderToPayment, setOrderToPayment] = useState(null);
    const [paymentType, setPaymentType] = useState('Order'); // Default to online payment
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
    
                const response = await axios.get(BASE_URL + '/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
    
                setUserProfile(response.data);
                setName(response.data.name || '');
                setPhone(response.data.phone || '');
                // Format date for input if it exists
                if (response.data.dateOfBirth) {
                    const date = new Date(response.data.dateOfBirth);
                    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                    setDateOfBirth(formattedDate);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error('Failed to load profile information');
                setLoading(false);
            }
        };

        const fetchOrderHistory = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                const response = await axios.get(`${BASE_URL}/orders/user-order`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Handle the nested response structure
                const orders = response.data.items?.$values || [];
                setOrderHistory(orders);
            } catch (error) {
                console.error('Failed to fetch order history:', error);
                toast.error('Failed to load order history');
            }
        };

        const fetchInventory = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await axios.get(`${BASE_URL}/inventories`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setInventory(response.data);
            } catch (error) {
                console.error('Failed to fetch inventory:', error);
                toast.error('Failed to load inventory items');
            }
        };

        fetchUserProfile();
        fetchOrderHistory();
        fetchInventory();
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setShowConfirmModal(true);
    };
    
    const handleConfirmSave = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
    
            // Build the query parameters 
            const params = new URLSearchParams();
            if (name) params.append('Name', name);
            if (dateOfBirth) params.append('DateOfBirth', dateOfBirth);
            if (phone) params.append('Phone', phone);
    
            await axios.patch(`${BASE_URL}/users/update-profile?${params.toString()}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            // Update the local state with the new values
            setUserProfile(prevProfile => ({ 
                ...prevProfile, 
                name,
                dateOfBirth,
                phone
            }));
            
            setIsEditing(false);
            toast.success('Thông tin cá nhân đã được cập nhật');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Không thể cập nhật thông tin: ' + (error.response?.data?.message || 'Lỗi không xác định'));
        } finally {
            setShowConfirmModal(false);
        }
    };

    // Handle payment button click to show modal
    const handlePayment = (orderId) => {
        const order = orderHistory.find(o => o.orderId === orderId);
        if (!order) {
            toast.error('Không tìm thấy thông tin đơn hàng');
            return;
        }
        
        setOrderToPayment(order);
        setShowPaymentModal(true);
        setPaymentType('Order'); // Reset to default payment type
    };

    // Process payment with selected payment type
    const processPayment = async () => {
        if (!orderToPayment) return;
        
        // Check if wallet balance is sufficient when using wallet payment
        if (paymentType === 'Wallet' && userProfile.walletBalance < orderToPayment.totalAmount) {
            toast.error('Số dư trong ví không đủ để thanh toán đơn hàng này');
            return;
        }
        
        setPaymentLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Vui lòng đăng nhập để thanh toán!');
                setShowPaymentModal(false);
                return;
            }

            // Call payment API with the selected payment type
            const response = await axios.post(
                `${BASE_URL}/payments/payment?orderId=${orderToPayment.orderId}&type=${paymentType}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Handle different payment types
            if (paymentType === 'Order') {
                if (response.data) {
                    toast.info('Đang chuyển hướng đến cổng thanh toán VNPAY...', {
                        autoClose: 2000,
                    });
                    setTimeout(() => {
                        window.location.href = response.data;
                    }, 1500);
                } else {
                    toast.error('Không nhận được liên kết thanh toán');
                    setPaymentLoading(false);
                }
            } else {
                // For Wallet type, show success and refresh
                toast.success('Thanh toán thành công!');
                setShowPaymentModal(false);
                
                // Refresh order history
                const refreshResponse = await axios.get(`${BASE_URL}/orders/user-order`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const orders = refreshResponse.data.items?.$values || [];
                setOrderHistory(orders);
                
                // Refresh user profile to get updated wallet balance
                const profileResponse = await axios.get(BASE_URL + '/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserProfile(profileResponse.data);
                
                // Add additional success notification with more details
                toast.success(`Đã thanh toán ${formatCurrency(orderToPayment.totalAmount)} từ ví của bạn!`, {
                    autoClose: 5000, // Keep this notification visible longer
                });
            }
        } catch (err) {
            console.error('Payment processing error:', err);
            if (err.response?.status === 400 && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else if (err.response?.data?.detail) {
                toast.error(err.response.data.detail);
            } else {
                toast.error('Có lỗi xảy ra khi xử lý thanh toán');
            }
        } finally {
            if (paymentType !== 'Order') {
                setPaymentLoading(false);
            }
        }
    };

    const formatCurrency = (amount) => {
        return amount?.toLocaleString('vi-VN') + ' ₫';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatDateTime = (dateString) => {
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

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-blue-100 text-blue-800';
            case 'shipping':
                return 'bg-pink-100 text-pink-800';
            case 'processing':
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
    
    // Get current status of an order
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

    // Check if order is already paid
    const isOrderPaid = (order) => {
        if (!order.statuses || !order.statuses.$values) return false;
        
        return order.statuses.$values.some(
            status => status.status.toLowerCase() === 'paid'
        );
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
                        className={`px-6 py-3 flex items-center ${activeTab === 'profile' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FaUser className="mr-2" /> Thông tin tài khoản
                    </button>
                    <button
                        className={`px-6 py-3 flex items-center ${activeTab === 'orders' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <FaShoppingBag className="mr-2" /> Đơn hàng
                    </button>
                    <button
                        className={`px-6 py-3 flex items-center ${activeTab === 'inventory' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <FaBox className="mr-2" /> Bộ sưu tập
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Thông tin tài khoản</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-md">{userProfile.name || 'Chưa cập nhật'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-md">{userProfile.phone || 'Chưa cập nhật'}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                   
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={dateOfBirth}
                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                {userProfile.dateOfBirth ? formatDate(userProfile.dateOfBirth) : 'N/A'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
                                        <div className="p-3 bg-gray-50 rounded-md">
                                            {userProfile.walletBalance ? formatCurrency(userProfile.walletBalance) : formatCurrency("0")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6"> 
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <div className="p-3 bg-gray-50 rounded-md">{userProfile.email}</div>
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
                    {activeTab === 'orders' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h2>
                            {orderHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {orderHistory.map((order) => (
                                        <div key={order.orderId} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                                <div>
                                                    <span className="font-medium">Đơn hàng #{order.orderId}</span>
                                                    <span className="mx-3 text-gray-400">|</span>
                                                    <span className="text-gray-600">{formatDate(order.orderDate)}</span>
                                                    <span className="mx-3 text-gray-400">|</span>
                                                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(getCurrentStatus(order))}`}>
                                                        {getCurrentStatus(order)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        className="text-pink-600 hover:text-pink-800 flex items-center"
                                                        onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                                                    >
                                                        <FaEye className="mr-1" />
                                                        {expandedOrder === order.orderId ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedOrder === order.orderId && (
                                                <div className="p-4">
                                                    {/* Order status timeline */}
                                                    <div className="mb-6">
                                                        <h4 className="font-medium mb-2">Trạng thái đơn hàng:</h4>
                                                        <div className="relative">
                                                            {/* Status History Timeline */}
                                                            <div className="flex flex-col space-y-4">
                                                                {order.statuses?.$values
                                                                    ?.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
                                                                    .map((status, index) => (
                                                                        <div key={index} className="flex items-start">
                                                                            <div className="relative">
                                                                                <div className={`w-4 h-4 rounded-full ${getStatusBadgeClass(status.status)} border border-white`}></div>
                                                                                {index < (order.statuses.$values.length - 1) && (
                                                                                    <div className="absolute top-4 left-1/2 w-0.5 h-5 -ml-px bg-gray-200"></div>
                                                                                )}
                                                                            </div>
                                                                            <div className="ml-4">
                                                                                <div className="flex items-center">
                                                                                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(status.status)}`}>
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
                                                        <h4 className="font-medium mb-2">Chi tiết vận chuyển:</h4>
                                                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                                            <p>Địa chỉ: {order.address || 'N/A'}</p>
                                                            <p>Số điện thoại: {order.phone || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Transaction details if available */}
                                                    {order.transaction && (
                                                        <div className="mb-4">
                                                            <h4 className="font-medium mb-2">Thông tin thanh toán:</h4>
                                                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                                                <p>Loại giao dịch: {order.transaction.type}</p>
                                                                <p>Thời gian: {formatDateTime(order.transaction.createDate)}</p>
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
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sản phẩm</th>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {order.details?.$values?.map((detail, index) => (
                                                                    <tr key={index}>
                                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                                            #{detail.orderDetailId}
                                                                        </td>
                                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                                            {detail.packageId ? 'Package' : 'BlindBox'}
                                                                        </td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-right font-medium">
                                                                            {formatCurrency(detail.price)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Total and payment button */}
                                                    <div className="mt-4 text-right">
                                                        <div className="text-lg font-bold">Tổng cộng: {formatCurrency(order.totalAmount)}</div>
                                                        
                                                        {/* Only show payment button if not already paid */}
                                                        {!isOrderPaid(order) && (
                                                            <button
                                                                onClick={() => handlePayment(order.orderId)}
                                                                disabled={isProcessingPayment}
                                                                className="mt-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-pink-400 flex items-center justify-center ml-auto"
                                                            >
                                                                {isProcessingPayment ? (
                                                                    <>
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                        Đang xử lý...
                                                                    </>
                                                                ) : (
                                                                    'Tiến hành thanh toán'
                                                                )}
                                                            </button>
                                                        )}
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
                        </div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Bộ sưu tập</h2>
                            {inventory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {inventory.map((item) => (
                                        <div key={item.inventoryItemId} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                                {item.blindBox?.image ? (
                                                    <img
                                                        src={item.blindBox.image}
                                                        alt={item.blindBox.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image' }}
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
                                                <h3 className="font-bold text-lg mb-1">{item.blindBox?.name || 'Unknown BlindBox'}</h3>
                                                {item.blindBox?.pakageCode && (
                                                    <p className="text-sm text-gray-500 mb-2">Mã: {item.blindBox.pakageCode}</p>
                                                )}
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="text-pink-600 font-medium">
                                                        {formatCurrency(item.blindBox?.price)}
                                                    </div>
                                                    {item.blindBox?.isSpecial && (
                                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                            Đặc biệt
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-gray-50 rounded-lg">
                                    <FaBox className="mx-auto text-gray-300 text-5xl mb-4" />
                                    <p className="text-gray-600">Bạn chưa có món đồ nào trong bộ sưu tập.</p>
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
                        <h3 className="text-xl font-semibold mb-4">Thanh toán đơn hàng #{orderToPayment.orderId}</h3>
                        
                        {/* Order summary */}
                        <div className="mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">Ngày đặt:</span>
                                    <span>{formatDateTime(orderToPayment.orderDate)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">Địa chỉ:</span>
                                    <span>{orderToPayment.address || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">Số điện thoại:</span>
                                    <span>{orderToPayment.phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold mt-2 pt-2 border-t">
                                    <span>Tổng tiền:</span>
                                    <span className="text-pink-600">{formatCurrency(orderToPayment.totalAmount)}</span>
                                </div>
                            </div>
                            
                            {/* Product details */}
                            <h4 className="font-medium mb-2">Chi tiết sản phẩm:</h4>
                            <div className="overflow-x-auto mb-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orderToPayment.details?.$values?.map((detail, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    Chi tiết #{detail.orderDetailId}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    {detail.packageId ? 'Package' : 'BlindBox'}
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
                                        paymentType === 'Order' 
                                            ? 'border-pink-500 bg-pink-50' 
                                            : 'border-gray-200 hover:border-pink-300'
                                    }`}
                                    onClick={() => setPaymentType('Order')}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                            paymentType === 'Order' ? 'border-pink-500' : 'border-gray-400'
                                        }`}>
                                            {paymentType === 'Order' && <div className="w-3 h-3 rounded-full bg-pink-500"></div>}
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
                                        paymentType === 'Wallet' 
                                            ? 'border-pink-500 bg-pink-50' 
                                            : 'border-gray-200 hover:border-pink-300'
                                    }`}
                                    onClick={() => setPaymentType('Wallet')}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                            paymentType === 'Wallet' ? 'border-pink-500' : 'border-gray-400'
                                        }`}>
                                            {paymentType === 'Wallet' && <div className="w-3 h-3 rounded-full bg-pink-500"></div>}
                                        </div>
                                        <div className="ml-3">
                                            <span className="font-medium flex items-center">
                                                <FaWallet className="mr-2 text-gray-600" />
                                                Thanh toán bằng ví
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Số dư ví: {formatCurrency(userProfile.walletBalance || 0)}
                                            </p>
                                            {/* Show warning if wallet balance is insufficient */}
                                            {paymentType === 'Wallet' && userProfile.walletBalance < orderToPayment.totalAmount && (
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
                                disabled={paymentLoading || (paymentType === 'Wallet' && userProfile.walletBalance < orderToPayment.totalAmount)}
                                className={`px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center justify-center ${
                                    (paymentLoading || (paymentType === 'Wallet' && userProfile.walletBalance < orderToPayment.totalAmount)) ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {paymentLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Tiến hành thanh toán'
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