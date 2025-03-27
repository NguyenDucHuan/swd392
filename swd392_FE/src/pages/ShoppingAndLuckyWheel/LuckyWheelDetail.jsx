import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";

const LuckyWheelDetail = () => {
  const { packageCode } = useParams();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [wheelInfo, setWheelInfo] = useState({
    price: 0,
    totalBlindBoxes: 0,
  });
  const [userWallet, setUserWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const spinnerRef = useRef(null);
  const navigate = useNavigate();

  // Các phân loại skin với màu sắc tương ứng
  const rarities = {
    common: "text-gray-400 bg-gray-800",
    uncommon: "text-pink-400 bg-pink-900",
    rare: "text-purple-400 bg-purple-900",
    mythical: "text-pink-400 bg-pink-900",
    legendary: "text-red-400 bg-red-900",
    ancient: "text-yellow-400 bg-yellow-900",
    special: "text-yellow-400 bg-red-900",
  };

  // Fetch thông tin ví của user
  useEffect(() => {
    const fetchUserWallet = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setUserWallet(response.data.walletBalance || 0);
        }
      } catch (error) {
        console.error("Error fetching wallet:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchUserWallet();
  }, [navigate]);

  // Fetch danh sách items từ API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");

        if (!token) {
          toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
          navigate("/login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/wheel-detail`, {
          params: {
            packageCode: packageCode,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setWheelInfo({
            price: response.data.price || 0,
            totalBlindBoxes: response.data.totalBlindBoxes || 0,
          });

          if (!response.data.wheelBlindBoxes?.$values) {
            throw new Error("Không có dữ liệu vòng quay");
          }

          // Chuyển đổi dữ liệu wheelBlindBoxes thành định dạng hiển thị
          const formattedItems = response.data.wheelBlindBoxes.$values
            .filter((wheelBox) => wheelBox.blindBoxes?.$values?.length > 0)
            .map((wheelBox) => {
              const box = wheelBox.blindBoxes.$values[0];
              return {
                id: box.blindBoxId,
                name: `${box.packageName} - ${box.color}`,
                image: box.imageUrls?.$values?.[0]?.url || "/placeholder.png",
                secondaryImage: box.imageUrls?.$values?.[1]?.url,
                rarity: box.isSpecial ? "special" : "common",
                price: box.discountedPrice || 0,
                originalPrice: box.price || 0,
                isSpecial: box.isSpecial || false,
                isKnowned: box.isKnowned || false,
                color: box.color || "",
                packageCode: box.packageCode || "",
                features: box.features?.$values || [],
                rate: wheelBox.rate || 0,
                number: box.number || 0,
                size: box.size || 0,
              };
            });

          if (formattedItems.length === 0) {
            throw new Error("Không có sản phẩm nào khả dụng");
          }

          setItems(formattedItems);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        setError(error.message || "Không thể tải danh sách sản phẩm");
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
          navigate("/login");
        } else {
          toast.error(error.message || "Không thể tải danh sách sản phẩm");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [navigate, packageCode]);

  // Hàm xử lý quay vòng quay
  const handleOpenCase = async () => {
    if (spinning) return;

    // Kiểm tra số dư ví
    if (userWallet < (wheelInfo?.price || 0)) {
      toast.error("Số dư không đủ để quay. Vui lòng nạp thêm tiền vào ví!");
      return;
    }

    setSpinning(true);
    setResult(null);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
        navigate("/login");
        return;
      }

      const response = await axios.post(`${BASE_URL}/wheel/spin`, null, {
        params: {
          packageCode: packageCode,
          times: 1,
          amount: wheelInfo?.price || 0,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.$values?.[0]) {
        // Lấy ID của blind box trúng từ response
        const winningBlindBoxId = response.data.$values[0];

        // Tìm thông tin chi tiết của blind box trúng từ danh sách items gốc
        const winningItem = items.find((item) => item.id === winningBlindBoxId);

        if (!winningItem) {
          throw new Error("Không tìm thấy thông tin sản phẩm trúng thưởng");
        }

        // Tạo danh sách items mới với vị trí item trúng
        const spinItems = Array(50)
          .fill(null)
          .map((_, i) => {
            if (i === 25) return winningItem; // Vị trí giữa là item trúng
            return items[Math.floor(Math.random() * items.length)];
          });

        // Cập nhật số dư ví
        setUserWallet((prev) => prev - (wheelInfo?.price || 0));

        // Animation quay
        const itemWidth = 136;
        const centerPosition = Math.floor(window.innerWidth / 2);
        const targetOffset = -(25 * itemWidth) + centerPosition - itemWidth / 2;

        setItems(spinItems);
        setOffset(0);

        setTimeout(() => {
          const duration = 5000;
          const startTime = Date.now();

          const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const easedProgress =
              progress < 0.7
                ? progress
                : 0.7 + (easeOutCubic - 0.7) * (1 / 0.3) * (progress - 0.7);

            setOffset(targetOffset * easedProgress);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setSpinning(false);
              setResult(winningItem);
              toast.success("Chúc mừng bạn đã nhận được phần thưởng!");
            }
          };

          requestAnimationFrame(animate);
        }, 500);
      }
    } catch (error) {
      console.error("Error playing wheel:", error);
      setSpinning(false);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        navigate("/login");
      } else {
        toast.error(error.message || "Có lỗi xảy ra khi quay");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-4">Đã có lỗi xảy ra</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => navigate("/lucky-wheel")}
          className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto bg-gray-900 text-white p-6 rounded-lg my-12">
      <h1 className="text-3xl font-bold mb-6">Vòng Quay May Mắn</h1>

      {/* Hiển thị thông tin vòng quay */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 mb-6 w-full">
        <div className="flex justify-center mb-4">
          <img
            src={items[0]?.image || "/placeholder.png"}
            alt="Wheel"
            className="h-32 hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Vòng Quay {packageCode}</h2>
          <p className="text-gray-400 text-sm">
            Có thể nhận được các sản phẩm giá trị
          </p>
          <p className="text-yellow-400 mt-2">
            Giá mỗi lần quay: {wheelInfo.price.toLocaleString("vi-VN")} ₫
          </p>
          <p className="text-gray-400 mt-1">
            Tổng số box: {wheelInfo.totalBlindBoxes}
          </p>
          <p className="text-blue-400 mt-1">
            Số dư ví: {userWallet.toLocaleString("vi-VN")} ₫
          </p>
          {userWallet < wheelInfo.price && (
            <button
              onClick={() => navigate("/deposit")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Nạp thêm tiền
            </button>
          )}
        </div>
      </div>

      {/* Khu vực quay spinner */}
      <div className="relative w-full h-32 border-4 border-gray-700 rounded-lg mb-6 overflow-hidden">
        {/* Marker chỉ vị trí trúng */}
        <div className="absolute top-0 left-1/2 h-full w-1 bg-yellow-500 z-10 transform -translate-x-1/2"></div>

        {/* Bộ spinner chứa các items */}
        <div
          ref={spinnerRef}
          className="absolute flex h-full transition-transform duration-100 left-1/2"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {items.map((item, index) => (
            <div
              key={`${item?.id}-${index}`}
              className={`flex flex-col items-center justify-center flex-shrink-0 w-32 h-full ${
                rarities[item?.rarity]
              } p-2 mx-1 rounded-md border border-gray-600`}
            >
              <div className="h-16 w-full flex items-center justify-center">
                <img
                  src={item?.image}
                  alt={item?.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="text-center mt-1">
                <p className="text-xs font-medium truncate">{item?.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nút quay */}
      <button
        onClick={handleOpenCase}
        disabled={spinning || userWallet < wheelInfo.price}
        className={`px-8 py-3 rounded-lg text-lg font-bold transition-all duration-200 
          ${
            spinning || userWallet < wheelInfo.price
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 shadow-lg hover:shadow-yellow-500/30"
          }`}
      >
        {spinning
          ? "Đang quay..."
          : userWallet < wheelInfo.price
          ? "Số dư không đủ"
          : `Quay (${wheelInfo.price.toLocaleString("vi-VN")} ₫)`}
      </button>

      {/* Hiển thị kết quả */}
      {result && (
        <div className="mt-8 w-full">
          <div className="text-center mb-2">
            <h3 className="text-xl font-bold">Bạn đã nhận được!</h3>
          </div>
          <div
            className={`flex items-center justify-center p-6 ${
              rarities[result?.rarity]
            } rounded-lg border border-gray-600`}
          >
            <div className="mr-4">
              <img
                src={result?.image}
                alt={result?.name}
                className="w-32 h-24 object-contain"
              />
            </div>
            <div>
              <p className="text-sm text-gray-300">Bạn đã nhận được</p>
              <h4 className="text-2xl font-bold">{result?.name}</h4>
              <p className="text-sm">Số thứ tự: #{result?.number}</p>
              <p className="text-sm">Kích thước: {result?.size}</p>
              {result?.features?.map((feature, index) => (
                <p key={index} className="text-sm text-gray-300">
                  {feature.type}: {feature.description}
                </p>
              ))}
              {result?.isSpecial && (
                <span className="inline-block px-2 py-1 bg-yellow-500 text-black text-xs rounded mt-1">
                  Special
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyWheelDetail;
