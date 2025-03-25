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
                setName(response.data.name);
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

    const handleSaveClick = async () => {
        const confirmed = window.confirm('Bạn có chắc thực hiện thay đổi này chứ?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            await axios.put(BASE_URL + '/users/profile', { name }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUserProfile(prevProfile => ({ ...prevProfile, name }));
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
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
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`px-6 py-3 flex items-center ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FaUser className="mr-2" /> Thông tin tài khoản
                    </button>
                    <button
                        className={`px-6 py-3 flex items-center ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <FaShoppingBag className="mr-2" /> Đơn hàng
                    </button>
                    <button
                        className={`px-6 py-3 flex items-center ${activeTab === 'inventory' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
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
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-md">{userProfile.name || 'Chưa cập nhật'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <div className="p-3 bg-gray-50 rounded-md">{userProfile.email}</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                        <div className="p-3 bg-gray-50 rounded-md capitalize">{userProfile.role}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tham gia</label>
                                        <div className="p-3 bg-gray-50 rounded-md">
                                            {userProfile.joinDate ? formatDate(userProfile.joinDate) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                {isEditing ? (
                                    <button
                                        onClick={handleSaveClick}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                        <FaSave className="mr-2" /> Lưu thay đổi
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEditClick}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
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
                                                        className="text-blue-600 hover:text-blue-800 flex items-center"
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
                                                    <div className="text-blue-600 font-medium">
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
        </div>
    );
}

export default ProfilePage;