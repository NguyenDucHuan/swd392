// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

function Register() {
    const { register, error } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!');
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await register({
                name,
                email,
                password,
                dateOfBirth,
                phone
            });

            if (result.success) {
                toast.success('Đăng ký thành công!');
                navigate('/login'); // Redirect to login page
            }
        } catch (error) {
            toast.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#74ACFF]">
            <div className="bg-white rounded-lg p-8 w-full max-w-md z-10 shadow-xl border-4 border-white/30 justify-center">
                <div className="text-center mt-[50px]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký tài khoản</h2>
                    <p className="text-gray-600 text-sm mb-4">Hãy nhập thông tin để tạo tài khoản</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 text-left">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nguyễn Văn A"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 text-left">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="abc@gmail.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-gray-700 text-left">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0912345678"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-bold text-gray-700 text-left">
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 text-left">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="• • • • • • • •"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 text-left">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="• • • • • • • •"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Bạn đã có tài khoản?{' '}
                    <Link
                        to="/login"
                        className="text-pink-500 font-bold hover:text-pink-600 underline underline-offset-2 decoration-pink-500/30 hover:decoration-pink-600"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;