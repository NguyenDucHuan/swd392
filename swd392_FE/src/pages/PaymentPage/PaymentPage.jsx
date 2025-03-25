import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCreditCard, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BASE_URL } from '../../configs/globalVariables';

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const [cardInfo, setCardInfo] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    const [zaloPayInfo, setZaloPayInfo] = useState(null);

    useEffect(() => {
        // Get order info from location state
        if (location.state?.orderInfo) {
            setOrderInfo(location.state.orderInfo);
        } else {
            toast.error('Không tìm thấy thông tin đơn hàng');
            navigate('/cart');
        }

        // Lấy thông tin ZaloPay Wallet
        const fetchZaloPayInfo = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/Payment/zalopay-wallet`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data) {
                    setZaloPayInfo(response.data);
                    // Cập nhật thông tin thẻ từ ZaloPay
                    setCardInfo({
                        cardNumber: response.data.cardNumber || '',
                        cardName: response.data.cardName || '',
                        expiryDate: response.data.expiryDate || '',
                        cvv: response.data.cvv || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching ZaloPay info:', error);
                toast.error('Không thể lấy thông tin thẻ ZaloPay');
            }
        };

        fetchZaloPayInfo();
    }, [location, navigate]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gọi API thanh toán với ZaloPay
            const response = await axios.post(`${BASE_URL}/api/Payment/make-payment`, null, {
                params: {
                    orderId: orderInfo.orderId,
                    type: 'ZALOPAY',
                    cardInfo: cardInfo // Gửi thông tin thẻ
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Xử lý response từ API
            if (response.data) {
                // Nếu API trả về URL thanh toán, chuyển hướng người dùng
                if (response.data.paymentUrl) {
                    window.location.href = response.data.paymentUrl;
                    return;
                }

                // Nếu thanh toán thành công ngay lập tức
                navigate('/payment-result', {
                    state: {
                        success: true,
                        orderInfo: orderInfo
                    }
                });
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.detail || 'Có lỗi xảy ra trong quá trình thanh toán');

            navigate('/payment-result', {
                state: {
                    success: false,
                    orderInfo: orderInfo,
                    error: error.response?.data?.detail || 'Có lỗi xảy ra trong quá trình thanh toán'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    if (!orderInfo) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Thanh toán đơn hàng</h2>
                        <p className="mt-2 text-gray-600">Đơn hàng #{orderInfo.orderId}</p>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="font-bold text-lg">{orderInfo.totalAmount.toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số thẻ
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cardInfo.cardNumber}
                                    onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
                                    placeholder="Nhập số thẻ"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <FaCreditCard className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên chủ thẻ
                            </label>
                            <input
                                type="text"
                                value={cardInfo.cardName}
                                onChange={(e) => setCardInfo({ ...cardInfo, cardName: e.target.value })}
                                placeholder="Nhập tên chủ thẻ"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày hết hạn
                                </label>
                                <input
                                    type="text"
                                    value={cardInfo.expiryDate}
                                    onChange={(e) => setCardInfo({ ...cardInfo, expiryDate: e.target.value })}
                                    placeholder="MM/YY"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CVV
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardInfo.cvv}
                                        onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                                        placeholder="Nhập mã CVV"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <FaLock className="absolute right-3 top-3 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    'Thanh toán'
                                )}
                            </button>
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            <p>Thông tin thẻ được lấy từ ZaloPay Wallet</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage; 