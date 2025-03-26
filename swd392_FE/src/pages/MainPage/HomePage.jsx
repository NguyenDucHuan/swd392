import logo2 from '../../assets/logo.jpg';
import logo1 from '../../assets/main1.jpg';
import { FaSearch, FaShoppingCart, FaUser, FaGift, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-[600px] overflow-hidden">
                <img
                    className="w-full h-full object-cover"
                    src={logo1}
                    alt="Hero Background"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl">
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                                Khám Phá Thế Giới BlindBox
                            </h1>
                            <p className="text-xl text-white mb-8">
                                Sưu tầm những nhân vật đáng yêu từ bộ sưu tập Labubu và Baby Three độc đáo
                            </p>
                            <Link
                                to="/shopping"
                                className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                            >
                                Mua Sắm Ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <FaGift className="text-4xl text-blue-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Sản Phẩm Chính Hãng</h3>
                            <p className="text-gray-600">100% chính hãng, đầy đủ tem bảo hành</p>
                        </div>
                        <div className="text-center p-6">
                            <FaTruck className="text-4xl text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Giao Hàng Nhanh</h3>
                            <p className="text-gray-600">Đóng gói cẩn thận, vận chuyển toàn quốc</p>
                        </div>
                        <div className="text-center p-6">
                            <FaShieldAlt className="text-4xl text-purple-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Bảo Mật Thanh Toán</h3>
                            <p className="text-gray-600">Thanh toán an toàn qua VNPAY</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Promotions Section */}
            <div className="py-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">Ưu Đãi Đặc Biệt</h2>
                    <p className="text-xl mb-8">Giảm giá lên đến 50% cho các sản phẩm BlindBox</p>
                    <Link
                        to="/shopping"
                        className="bg-white text-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                    >
                        Xem Ngay
                    </Link>
                </div>
            </div>

            {/* Categories Section */}
            <div className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Danh Mục Sản Phẩm</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Link to="/shopping?category=labubu" className="group">
                            <div className="relative h-64 rounded-lg overflow-hidden">
                                <img
                                    src="/assets/labubu.jpg"
                                    alt="Labubu"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xl font-semibold">Labubu</span>
                                </div>
                            </div>
                        </Link>
                        <Link to="/shopping?category=baby-three" className="group">
                            <div className="relative h-64 rounded-lg overflow-hidden">
                                <img
                                    src="/assets/baby3.jpg"
                                    alt="Baby Three"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xl font-semibold">Baby Three</span>
                                </div>
                            </div>
                        </Link>
                        <Link to="/shopping?category=blind-box" className="group">
                            <div className="relative h-64 rounded-lg overflow-hidden">
                                <img
                                    src="/assets/tuimu.jpg"
                                    alt="Blind Box"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xl font-semibold">Blind Box</span>
                                </div>
                            </div>
                        </Link>
                        <Link to="/lucky-wheel" className="group">
                            <div className="relative h-64 rounded-lg overflow-hidden">
                                <img
                                    src="/assets/gacha.jpg"
                                    alt="Lucky Wheel"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xl font-semibold">Vòng Quay May Mắn</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="py-16 bg-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Đăng Ký Nhận Tin</h2>
                    <p className="text-gray-600 mb-8">Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
                    <div className="max-w-md mx-auto flex gap-4">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
                            Đăng Ký
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;