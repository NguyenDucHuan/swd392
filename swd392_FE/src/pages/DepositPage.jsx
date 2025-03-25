import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../configs/globalVariables';

const DepositPage = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
                navigate('/login');
                return;
            }

            // Gọi API payment để tạo giao dịch nạp tiền
            const response = await axios.post(
                `${BASE_URL}/Payment/api/payments/wallet-payment`,
                null,
                {
                    params: {
                        amount: parseFloat(amount)
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 && response.data) {
                // Chuyển hướng đến trang thanh toán VNPAY
                window.location.href = response.data;
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.detail || 'Có lỗi xảy ra khi tạo giao dịch nạp tiền');
            }
        } finally {
            setLoading(false);
        }
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
                                className="block w-full pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                            Số tiền tối thiểu: 50,000₫
                        </p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || amount < 50000}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                ${(loading || amount < 50000)
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                        >
                            {loading ? 'Đang xử lý...' : 'Nạp Tiền qua VNPAY'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <img src="/vnpay-logo.png" alt="VNPAY" className="h-8 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">
                        Thanh toán an toàn qua cổng thanh toán VNPAY
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DepositPage; 