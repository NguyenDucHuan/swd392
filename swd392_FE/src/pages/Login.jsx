import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Simulate login
        const body = {
            email: email,
            password: password,
            role: 'Manager'
        }
        await login(body)
        navigate('/')
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#74ACFF]">
            <div className="bg-white rounded-lg p-8 w-full max-w-md z-10 shadow-xl border-4 border-white/30 justify-center">
                <div className="text-center mt-[50px]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập tài khoản</h2>
                    <p className="text-gray-600 text-sm mb-4">Hãy nhập mật khẩu để tiếp tục</p>
                </div>
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                                    Mật khẩu
                                </label>
                                <a
                                    href="#"
                                    className="text-sm font-bold  opacity-60 hover:opacity-100 hover:text-blue-600 transition-all duration-200"
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="• • • • • • • •"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-widest placeholder:text-lg placeholder:tracking-[0.2em]"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                Nhớ mật khẩu
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Bạn không có tài khoản?{' '}
                    <a
                        href="#"
                        className="text-blue-500 font-bold hover:text-blue-600 underline underline-offset-2 decoration-blue-500/30 hover:decoration-blue-600"
                    >
                        Tạo tài khoản
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Login