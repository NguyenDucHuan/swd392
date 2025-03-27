import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";

const LuckyWheelDetail = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [wheelInfo, setWheelInfo] = useState(null);
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
  };

  // Fetch danh sách items từ API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
          navigate("/login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/wheel`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setWheelInfo({
            price: response.data.price,
            totalBlindBoxes: response.data.totalBlindBoxes,
          });

          // Chuyển đổi dữ liệu wheelBlindBoxes thành định dạng hiển thị
          const formattedItems = response.data.wheelBlindBoxes.$values.flatMap(
            (wheelBox) =>
              wheelBox?.blindBoxes.$values.map((box) => ({
                id: box?.blindBoxId,
                name: `${box?.packageName} - ${box.color}`,
                image: box?.imageUrls.$values[0]?.url || "/placeholder.png",
                rarity: box?.isSpecial ? "mythical" : "common",
                price: box?.discountedPrice,
                isSpecial: box?.isSpecial,
                isKnowned: box?.isKnowned,
                color: box?.color,
                packageCode: box?.packageCode,
                features: box?.features.$values,
              }))
          );
          console.log(formattedItems);

          if (formattedItems.length === 0) {
            toast.error("Không có sản phẩm nào khả dụng");
            return;
          }

          setItems(formattedItems);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
          navigate("/login");
        } else {
          toast.error("Không thể tải danh sách sản phẩm");
        }
      }
    };

    fetchItems();
  }, [navigate]);

  // Hàm xử lý quay vòng quay
  const handleOpenCase = async () => {
    if (spinning) return;

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
          times: 1,
          amount: wheelInfo?.price || 0,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        // Tạo danh sách items mới với vị trí item trúng
        const newItems = [];
        for (let i = 0; i < 50; i++) {
          newItems.push(items[Math.floor(Math.random() * items.length)]);
        }

        // Lấy ID của blind box trúng từ response
        const winningBlindBoxId = response.data.$values[0];

        // Tìm thông tin chi tiết của blind box trúng từ danh sách items
        const winningItem = items.find((item) => item.id === winningBlindBoxId);

        if (!winningItem) {
          toast.error("Không tìm thấy thông tin sản phẩm trúng thưởng");
          setSpinning(false);
          return;
        }

        const winningPosition = 25;
        newItems[winningPosition] = winningItem;

        setItems(newItems);
        setOffset(0);

        // Animation quay
        setTimeout(() => {
          // Tạo hiệu ứng quay với tốc độ giảm dần
          const itemWidth = 136; // Width của mỗi item (120px) + margin (16px)
          const centerPosition = Math.floor(window.innerWidth / 2); // Vị trí giữa màn hình
          const targetOffset =
            -(winningPosition * itemWidth) + centerPosition - itemWidth / 2; // Điều chỉnh để item dừng ở giữa marker

          const duration = 5000; // Thời gian animation
          const startTime = Date.now();

          const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Easing function tạo hiệu ứng chậm dần
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const easedProgress =
              progress < 0.7
                ? progress
                : 0.7 + (easeOutCubic - 0.7) * (1 / 0.3) * (progress - 0.7);

            setOffset(targetOffset * easedProgress);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Hoàn thành animation
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
        toast.error(error.response?.data?.detail || "Có lỗi xảy ra khi quay");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto bg-gray-900 text-white p-6 rounded-lg my-12">
      <h1 className="text-3xl font-bold mb-6">Vòng Quay May Mắn</h1>

      {/* Hiển thị thông tin vòng quay */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 mb-6 w-full">
        <div className="flex justify-center mb-4">
          <img
            src="/api/placeholder/200/150"
            alt="Wheel"
            className="h-32 hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Vòng Quay May Mắn</h2>
          <p className="text-gray-400 text-sm">
            Có thể nhận được các sản phẩm giá trị
          </p>
          {wheelInfo && (
            <>
              <p className="text-yellow-400 mt-2">
                Giá mỗi lần quay: {wheelInfo.price.toLocaleString("vi-VN")} ₫
              </p>
              <p className="text-gray-400 mt-1">
                Tổng số box: {wheelInfo.totalBlindBoxes}
              </p>
            </>
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
        disabled={spinning}
        className={`px-8 py-3 rounded-lg text-lg font-bold transition-all duration-200 
          ${
            spinning
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 shadow-lg hover:shadow-yellow-500/30"
          }`}
      >
        {spinning
          ? "Đang quay..."
          : `Quay (${wheelInfo?.price?.toLocaleString("vi-VN")} ₫)`}
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
              <p className={`text-sm capitalize`}>{result?.rarity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyWheelDetail;
