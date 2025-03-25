import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BASE_URL } from '../../configs/globalVariables';

function PaymentResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const { success, orderInfo, error } = location.state || {};

    useEffect(() => {
        const handlePaymentCallback = async () => {
            try {
                // Lấy tất cả query parameters từ URL
                const params = Object.fromEntries(searchParams.entries());

                // Gọi API payment-callback
                const response = await axios.get(`${BASE_URL}/api/Payment/payment-callback`, {
                    params: params,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Xử lý kết quả từ API
                if (response.data) {
                    setPaymentStatus({
                        success: true,
                        message: 'Thanh toán thành công!'
                    });
                }
            } catch (error) {
                console.error('Payment callback error:', error);
                setPaymentStatus({
                    success: false,
                    message: error.response?.data?.detail || 'Có lỗi xảy ra trong quá trình xác nhận thanh toán'
                });
            } finally {
                setLoading(false);
            }
        };

        // Nếu có query parameters (từ callback), xử lý callback
        if (searchParams.toString()) {
            handlePaymentCallback();
        } else {
            // Nếu không có query parameters, sử dụng state từ location
            setPaymentStatus({
                success: success,
                message: success ? 'Thanh toán thành công!' : (error || 'Thanh toán thất bại')
            });
            setLoading(false);
        }
    }, [searchParams, success, error]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!paymentStatus) {
        toast.error('Không tìm thấy thông tin thanh toán');
        navigate('/cart');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    {paymentStatus.success ? (
                        <>
                            <div className="flex justify-center mb-4">
                                <FaCheckCircle className="text-green-500 text-6xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
                            <p className="text-gray-600 mb-4">
                                Cảm ơn bạn đã mua hàng tại cửa hàng chúng tôi.
                            </p>
                            {orderInfo && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <p className="text-sm text-gray-600">Mã đơn hàng: #{orderInfo.orderId}</p>
                                    <p className="text-sm text-gray-600">
                                        Tổng tiền: {orderInfo.totalAmount.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center mb-4">
                                <FaTimesCircle className="text-red-500 text-6xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h2>
                            <p className="text-gray-600 mb-4">
                                {paymentStatus.message}
                            </p>
                        </>
                    )}

                    <button
                        onClick={() => navigate('/cart')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaArrowLeft className="mr-2" />
                        Quay lại giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentResultPage; 