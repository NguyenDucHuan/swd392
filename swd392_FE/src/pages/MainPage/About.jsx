// src/pages/About.jsx
import logo2 from '../../assets/baby3.jpg';
import logo4 from '../../assets/gacha.jpg';
import logo1 from '../../assets/labubu.jpg';
import logo3 from '../../assets/tuimu.jpg';






function About() {
  return (
    <>
      <div className="container mx-auto my-6 py-6">
        <h1 className="text-center text-3xl font-semibold">About Us</h1>
        <hr className="my-4" />
        <p className="text-center text-lg">
          Chào mừng bạn đến với BlindBox Shop – điểm đến lý tưởng cho những ai yêu thích túi mù! 🌟
          <br />
          Chúng tôi chuyên cung cấp các sản phẩm Labubu và Baby Three chính hãng, từ mô hình sưu tầm đến các phiên bản giới hạn, giúp bạn dễ dàng sở hữu những nhân vật đáng yêu này. Với cam kết mang đến trải nghiệm mua sắm tốt nhất, chúng tôi đảm bảo:
          <br />
          <div className="flex justify-center space-x-8 mt-4">
            <div className="flex items-center max-w-xs">
              <span className="font-bold text-green-500">✅</span>
              <span className="ml-2">Sản phẩm chất lượng – 100% chính hãng, đầy đủ tem bảo hành.</span>
            </div>
            <div className="flex items-center max-w-xs">
              <span className="font-bold text-green-500">✅</span>
              <span className="ml-2">Giá cả cạnh tranh – Luôn cập nhật mức giá hợp lý, ưu đãi hấp dẫn.</span>
            </div>
            <div className="flex items-center max-w-xs">
              <span className="font-bold text-green-500">✅</span>
              <span className="ml-2">Giao hàng nhanh chóng – Đóng gói cẩn thận, vận chuyển toàn quốc.</span>
            </div>
          </div>
          <br />
          <div className="text-center">
            <span className="font-bold text-green-500">✅</span> Hỗ trợ tận tình – Đội ngũ CSKH luôn sẵn sàng tư vấn cho bạn.
          </div>
          <br />
          Hãy cùng chúng tôi khám phá thế giới Labubu đầy màu sắc và đáng yêu! 💖✨
        </p>

        <h2 className="text-center py-8 text-2xl font-semibold">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="max-w-sm mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img className="w-full h-60 object-cover" src={logo1} alt="Labubu The Monsters" />
              <div className="p-4">
                <h5 className="text-center text-xl font-semibold">Labubu The Monsters</h5>
              </div>
            </div>
          </div>
          <div className="max-w-sm mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img className="w-full h-60 object-cover" src={logo2} alt="Baby Three" />
              <div className="p-4">
                <h5 className="text-center text-xl font-semibold">Baby Three</h5>
              </div>
            </div>
          </div>
          <div className="max-w-sm mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img className="w-full h-60 object-cover" src={logo3} alt="Blind Box" />
              <div className="p-4">
                <h5 className="text-center text-xl font-semibold">Blind Box</h5>
              </div>
            </div>
          </div>
          <div className="max-w-sm mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img className="w-full h-60 object-cover" src={logo4} alt="Gacha trúng thưởng" />
              <div className="p-4">
                <h5 className="text-center text-xl font-semibold">Gacha trúng thưởng</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

export default About