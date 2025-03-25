import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../configs/globalVariables';
import { useAuth } from '../../contexts/AuthContext';
import QRNH from '../../assets/QRNH.png';
import QRMOMO from '../../assets/QRMOMO.png';
import ImageModal from '../../components/ImageModal';

function RechargePage() {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');
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
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error('Không thể tải thông tin người dùng');
            }
        };

        fetchUserProfile();
    }, []);

    const handleRecharge = async () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (!selectedPaymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }

        const confirmed = window.confirm(`Bạn có chắc chắn muốn nạp ${amount} vào tài khoản không?`);
        if (!confirmed) return;

        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            await axios.post(BASE_URL + '/users/recharge', { amount, paymentMethod: selectedPaymentMethod }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toast.success('Nạp tiền thành công!');
            setAmount('');
        } catch (error) {
            console.error('Failed to recharge:', error);
            toast.error('Nạp tiền thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleQRCodeClick = (imageUrl) => {
        setModalImageUrl(imageUrl);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Nạp tiền vào tài khoản</h1>
            {userProfile && (
                <div className="mb-4">
                    <div className="flex items-center mb-4">
                        <img
                            src={userProfile.imageUrl || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-16 h-16 rounded-full mr-4 cursor-pointer"
                            onClick={() => setIsModalOpen(true)}
                        />
                        <div>
                            <p className="text-lg font-bold">{userProfile.name}</p>
                            <p className="text-gray-600">Số dư: {userProfile.balance} VND</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="mb-4">
                <label className="block text-gray-700">Số tiền:</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                    placeholder="Nhập số tiền cần nạp"
                />
            </div>
            <h2 className="text-xl font-bold mt-8 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-4">
                <div className="p-4 border border-gray-300 rounded">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="bankTransfer"
                            checked={selectedPaymentMethod === 'bankTransfer'}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="mr-2"
                        />
                        <span className="text-lg font-bold">Chuyển khoản ngân hàng</span>
                    </label>
                    {selectedPaymentMethod === 'bankTransfer' && (
                        <div className="mt-2">
                            <p className="text-gray-600">Thông tin tài khoản ngân hàng:</p>
                            <p className="text-gray-600">Ngân hàng: ABC Bank</p>
                            <p className="text-gray-600">Số tài khoản: 123456789</p>
                            <p className="text-gray-600">Chủ tài khoản: Nguyễn Văn A</p>
                        </div>
                    )}
                </div>
                <div className="p-4 border border-gray-300 rounded">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="qrCode"
                            checked={selectedPaymentMethod === 'qrCode'}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="mr-2"
                        />
                        <span className="text-lg font-bold">Quét mã QR</span>
                    </label>
                    {selectedPaymentMethod === 'qrCode' && (
                        <div className="mt-2">
                            <img
                                src={QRNH}
                                alt="QR Code"
                                className="w-32 h-32 cursor-pointer"
                                onClick={() => handleQRCodeClick(QRNH)}
                            />
                        </div>
                    )}
                </div>
                <div className="p-4 border border-gray-300 rounded">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="momoPay"
                            checked={selectedPaymentMethod === 'momoPay'}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="mr-2"
                        />
                        <span className="text-lg font-bold">MOMO Pay</span>
                    </label>
                    {selectedPaymentMethod === 'momoPay' && (
                        <div className="mt-2">
                            <img
                                src={QRMOMO}
                                alt="MOMO QR Code"
                                className="w-32 h-32 cursor-pointer"
                                onClick={() => handleQRCodeClick(QRMOMO)}
                            />
                        </div>
                    )}
                </div>
            </div>
            <button
                onClick={handleRecharge}
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4 ${loading ? 'cursor-not-allowed' : ''}`}
            >
                {loading ? 'Đang xử lý...' : 'Nạp tiền'}
            </button>

            <ImageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageUrl={modalImageUrl}
            />
        </div>
    );
}

export default RechargePage;