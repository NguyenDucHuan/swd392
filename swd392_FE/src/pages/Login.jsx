// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const result = await login({
                email,
                password,
                rememberMe
            });
            
            if (result.success) {
                toast.success('Đăng nhập thành công!');
                
                // Redirect based on user role
                if (result.role === 'Admin' || result.role === 'Staff') {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#74ACFF]">
            <div className="bg-white rounded-lg p-8 w-full max-w-md z-10 shadow-xl border-4 border-white/30 justify-center">
                <div className="text-center mt-[50px]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập tài khoản</h2>
                    <p className="text-gray-600 text-sm mb-4">Hãy nhập mật khẩu để tiếp tục</p>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
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
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                                    Mật khẩu
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-bold opacity-60 hover:opacity-100 hover:text-pink-600 transition-all duration-200"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="• • • • • • • •"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg tracking-widest placeholder:text-lg placeholder:tracking-[0.2em]"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                Nhớ mật khẩu
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Bạn không có tài khoản?{' '}
                    <Link
                        to="/register"
                        className="text-pink-500 font-bold hover:text-pink-600 underline underline-offset-2 decoration-pink-500/30 hover:decoration-pink-600"
                    >
                        Tạo tài khoản
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;