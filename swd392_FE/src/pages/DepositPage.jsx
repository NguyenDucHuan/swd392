import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../configs/globalVariables';

const DepositPage = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentStep, setPaymentStep] = useState('input'); // 'input', 'processing', 'redirecting'
    const navigate = useNavigate();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPaymentStep('processing');

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
                navigate('/login');
                return;
            }

            // Additional validation
            if (parseFloat(amount) < 50000) {
                toast.error('Số tiền tối thiểu phải là 50,000₫');
                setLoading(false);
                setPaymentStep('input');
                return;
            }

            // Gọi API payment để tạo giao dịch nạp tiền
            const response = await axios.post(
                `${BASE_URL}/payments/wallet-payment`,
                null,
                {
                    params: {
                        amount: parseFloat(amount)
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200 && response.data) {
                // Set redirecting state before actually redirecting
                setPaymentStep('redirecting');
                toast.info('Đang chuyển hướng đến cổng thanh toán...');
                
                // Small delay to show the redirecting state
                setTimeout(() => {
                    sessionStorage.setItem('paymentAmount', amount);
                    sessionStorage.setItem('paymentTimestamp', new Date().toISOString());
                    
                    // Chuyển hướng đến trang thanh toán VNPAY
                    window.location.href = response.data;
                }, 1000);
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            setPaymentStep('input');
            
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                navigate('/login');
            } else if (error.response?.status === 400) {
                toast.error(error.response?.data?.detail || 'Số tiền không hợp lệ');
            } else if (error.response?.status === 503) {
                toast.error('Dịch vụ thanh toán hiện đang bảo trì');
            } else {
                toast.error(error.response?.data?.detail || 'Có lỗi xảy ra khi tạo giao dịch nạp tiền');
            }
        } finally {
            if (paymentStep !== 'redirecting') {
                setLoading(false);
            }
        }
    };

    const renderContent = () => {
        if (paymentStep === 'redirecting') {
            return (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium">Đang chuyển hướng đến cổng thanh toán...</h3>
                    <p className="text-sm text-gray-500 mt-2">Vui lòng không đóng trình duyệt</p>
                </div>
            );
        }
        
        if (paymentStep === 'processing') {
            return (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium">Đang xử lý giao dịch...</h3>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Số tiền (VNĐ)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                            placeholder="0"
                            min="50000"
                            step="1000"
                            required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₫</span>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Số tiền tối thiểu: {formatCurrency(50000)}
                    </p>
                    {amount && parseFloat(amount) >= 50000 && (
                        <p className="mt-2 text-sm text-green-600">
                            Bạn sẽ nạp: {formatCurrency(parseFloat(amount))}
                        </p>
                    )}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading || amount < 50000}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            ${(loading || amount < 50000)
                                ? 'bg-pink-400 cursor-not-allowed'
                                : 'bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'
                            }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Nạp Tiền qua VNPAY'}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Nạp Tiền</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Nhập số tiền bạn muốn nạp vào ví
                    </p>
                </div>

                {renderContent()}

                {paymentStep === 'input' && (
                    <div className="mt-6 text-center">
                        <img src="/vnpay-logo.png" alt="VNPAY" className="h-8 mx-auto" />
                        <p className="mt-2 text-sm text-gray-500">
                            Thanh toán an toàn qua cổng thanh toán VNPAY
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepositPage;