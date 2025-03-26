// src/pages/About.jsx
import logo2 from '../../assets/baby3.jpg';
import logo4 from '../../assets/gacha.jpg';
import logo1 from '../../assets/labubu.jpg';
import logo3 from '../../assets/tuimu.jpg';
import { FaShieldAlt, FaTruck, FaHeadset, FaTags } from 'react-icons/fa';

function About() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Về Chúng Tôi
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Khám phá thế giới BlindBox đầy màu sắc và đáng yêu tại cửa hàng chính hãng của chúng tôi
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Chào mừng đến với BlindBox Shop
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Chúng tôi tự hào là địa chỉ tin cậy cho những người yêu thích sưu tầm BlindBox,
            đặc biệt là các sản phẩm Labubu và Baby Three chính hãng. Với cam kết mang đến
            trải nghiệm mua sắm tốt nhất, chúng tôi luôn nỗ lực để đáp ứng mọi nhu cầu của khách hàng.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
            <FaShieldAlt className="text-4xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sản Phẩm Chính Hãng</h3>
            <p className="text-gray-600">100% chính hãng, đầy đủ tem bảo hành</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
            <FaTags className="text-4xl text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Giá Cả Hợp Lý</h3>
            <p className="text-gray-600">Luôn cập nhật mức giá cạnh tranh</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
            <FaTruck className="text-4xl text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Giao Hàng Nhanh</h3>
            <p className="text-gray-600">Đóng gói cẩn thận, vận chuyển toàn quốc</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
            <FaHeadset className="text-4xl text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Hỗ Trợ 24/7</h3>
            <p className="text-gray-600">Đội ngũ CSKH luôn sẵn sàng tư vấn</p>
          </div>
        </div>

        {/* Products Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Sản Phẩm Của Chúng Tôi</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập đa dạng các sản phẩm BlindBox chất lượng cao
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <img className="w-full h-full object-cover" src={logo1} alt="Labubu The Monsters" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-lg font-semibold">Xem Chi Tiết</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-center mb-2">Labubu The Monsters</h3>
              <p className="text-gray-600 text-center">Bộ sưu tập quái vật đáng yêu</p>
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <img className="w-full h-full object-cover" src={logo2} alt="Baby Three" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-lg font-semibold">Xem Chi Tiết</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-center mb-2">Baby Three</h3>
              <p className="text-gray-600 text-center">Phiên bản đặc biệt cho người sưu tầm</p>
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <img className="w-full h-full object-cover" src={logo3} alt="Blind Box" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-lg font-semibold">Xem Chi Tiết</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-center mb-2">Blind Box</h3>
              <p className="text-gray-600 text-center">Trải nghiệm mở hộp bất ngờ</p>
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative h-64">
              <img className="w-full h-full object-cover" src={logo4} alt="Gacha trúng thưởng" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-lg font-semibold">Xem Chi Tiết</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-center mb-2">Gacha Trúng Thưởng</h3>
              <p className="text-gray-600 text-center">Cơ hội nhận thưởng hấp dẫn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;