import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaBox, FaEdit, FaEye, FaSave, FaShoppingBag, FaUser } from 'react-icons/fa';
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
    const { user } = useAuth();
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phone, setPhone] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-pink-100 text-pink-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                                                    <div className="mb-4">
                                                        <h4 className="font-medium mb-2">Chi tiết vận chuyển:</h4>
                                                        <div className="text-sm text-gray-600">
                                                            <p>Địa chỉ: {order.address || 'N/A'}</p>
                                                            <p>Số điện thoại: {order.phone || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <h4 className="font-medium mb-2">Sản phẩm:</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {order.details?.$values?.map((detail, index) => (
                                                                    <tr key={index}>
                                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                                            <div className="flex items-center">
                                                                                <div>
                                                                                    <div className="font-medium">Chi tiết đơn hàng #{detail.orderDetailId}</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-right font-medium">
                                                                            {formatCurrency(detail.price)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    
                                                    <div className="mt-4 text-right">
                                                        <div className="text-lg font-bold">Tổng cộng: {formatCurrency(order.totalAmount)}</div>
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
                                                        onError={(e) => {e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}}
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
        </div>
    );
    
}

export default ProfilePage;