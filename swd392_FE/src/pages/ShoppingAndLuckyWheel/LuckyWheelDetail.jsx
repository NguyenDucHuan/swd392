import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";

const LuckyWheelDetail = () => {
  const { packageCode } = useParams();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [items, setItems] = useState([]);
  const [spinningItems, setSpinningItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [wheelInfo, setWheelInfo] = useState({
    price: 0,
    totalBlindBoxes: 0,
    packageInfo: null,
  });
  const [userWallet, setUserWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const spinnerRef = useRef(null);
  const animationRef = useRef(null);
  const navigate = useNavigate();

  // Các phân loại skin với màu sắc tương ứng
  const rarities = useMemo(
    () => ({
      common: "text-gray-600 bg-gray-100",
      uncommon: "text-pink-600 bg-pink-100",
      rare: "text-purple-600 bg-purple-100",
      mythical: "text-pink-600 bg-pink-100",
      legendary: "text-red-600 bg-red-100",
      ancient: "text-yellow-600 bg-yellow-100",
      special: "text-yellow-600 bg-red-100",
    }),
    []
  );

  // Xử lý cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Fetch thông tin ví của user với retry logic
  const fetchUserWallet = useCallback(
    async (retryCount = 3) => {
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
        if (retryCount > 0 && error.response?.status !== 401) {
          setTimeout(() => fetchUserWallet(retryCount - 1), 1000);
        } else if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchUserWallet();
  }, [fetchUserWallet]);

  // Fetch thông tin package
  const fetchPackageInfo = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/package/by-code`, {
        params: { packageCode },
      });

      if (response.data) {
        const packageData = response.data;
        setWheelInfo((prev) => ({
          ...prev,
          packageInfo: {
            name: packageData.name,
            description: packageData.description,
            image: packageData.images?.$values?.[0]?.url,
            secondaryImage: packageData.images?.$values?.[1]?.url,
            priceRange: packageData.price,
            manufacturer: packageData.manufacturer,
            totalPackage: packageData.totalPackage,
            totalBlindBox: packageData.totalBlindBox,
            categoryId: packageData.categoryId,
            packageId: packageData.packageId,
            images: packageData.images?.$values?.map((img) => img.url) || [],
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching package info:", error);
      toast.error("Không thể tải thông tin gói");
    }
  }, [packageCode]);

  useEffect(() => {
    fetchPackageInfo();
  }, [fetchPackageInfo]);

  // Fetch danh sách items từ API với retry logic
  const fetchItems = useCallback(
    async (retryCount = 3) => {
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
          params: { packageCode },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setWheelInfo((prev) => ({
            ...prev,
            price: response.data.price || 0,
            totalBlindBoxes: response.data.totalBlindBoxes || 0,
          }));

          if (!response.data.wheelBlindBoxes?.$values) {
            throw new Error("Không có dữ liệu vòng quay");
          }

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
                color: wheelBox.color || "",
                packageCode: box.packageCode || "",
                features: box.features?.$values || [],
                rate: wheelBox.rate || 0,
                quantity: wheelBox.quantity || 0,
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
        if (retryCount > 0 && error.response?.status !== 401) {
          setTimeout(() => fetchItems(retryCount - 1), 1000);
        } else {
          setError(error.message || "Không thể tải danh sách sản phẩm");
          if (error.response?.status === 401) {
            toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
            navigate("/login");
          } else {
            toast.error(error.message || "Không thể tải danh sách sản phẩm");
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate, packageCode]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Xử lý animation với requestAnimationFrame
  const handleAnimation = useCallback((startTime, duration, winningItem) => {
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const easedProgress =
        progress < 0.7
          ? progress
          : 0.7 + (easeOutCubic - 0.7) * (1 / 0.3) * (progress - 0.7);

      setOffset(-(25 * 160) * easedProgress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(() => animate());
      } else {
        setSpinning(false);
        setResult(winningItem);
        toast.success("Chúc mừng bạn đã nhận được phần thưởng!");
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Xử lý quay vòng quay với debounce
  const handleOpenCase = useCallback(async () => {
    if (spinning) return;

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
          packageCode,
          times: 1,
          amount: wheelInfo?.price || 0,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.$values?.[0]) {
        const winningBlindBoxId = response.data.$values[0];
        let winningItem = null;
        let retryCount = 0;
        const maxRetries = 5;

        // Tìm kiếm phần thưởng với cơ chế retry
        while (!winningItem && retryCount < maxRetries) {
          winningItem = items.find((item) => item.id === winningBlindBoxId);
          if (!winningItem) {
            retryCount++;
            // Đợi 1 giây trước khi thử lại
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Refresh lại danh sách items
            await fetchItems();
          }
        }

        // Nếu vẫn không tìm thấy sau khi retry, sử dụng item ngẫu nhiên
        if (!winningItem) {
          console.warn(
            "Không tìm thấy phần thưởng chính xác, sử dụng phần thưởng ngẫu nhiên"
          );
          winningItem = items[Math.floor(Math.random() * items.length)];
        }

        const spinItems = Array(50)
          .fill(null)
          .map((_, i) =>
            i === 25
              ? winningItem
              : items[Math.floor(Math.random() * items.length)]
          );

        setUserWallet((prev) => prev - (wheelInfo?.price || 0));
        setSpinningItems(spinItems);
        setOffset(0);

        setTimeout(() => {
          handleAnimation(Date.now(), 5000, winningItem);
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
  }, [
    spinning,
    userWallet,
    wheelInfo.price,
    items,
    navigate,
    packageCode,
    handleAnimation,
    fetchItems,
  ]);

  // Render tối ưu cho items
  const renderItems = useMemo(() => {
    // Sắp xếp items theo rate tăng dần
    const sortedItems = [...items].sort((a, b) => a.rate - b.rate);
    return sortedItems.map((item, index) => (
      <div
        key={index}
        className={`${
          rarities[item.rarity]
        } border rounded-lg p-2 transition-transform hover:scale-105`}
      >
        <div className="aspect-square flex items-center justify-center">
          <img
            src={item.image}
            alt={item.color}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="text-center mt-2 space-y-1">
          <p className="text-xs font-medium truncate text-gray-800">
            {item.color}
          </p>
          <div className="flex justify-between text-xs text-gray-600">
            <span>x{item.quantity}</span>
            <span>{item.rate.toFixed(1)}%</span>
          </div>
          <div className="text-xs font-medium text-green-600">
            {item.price.toLocaleString("vi-VN")} ₫
          </div>
        </div>
      </div>
    ));
  }, [items, rarities]);

  // Render tối ưu cho spinning items
  const renderSpinningItems = useMemo(() => {
    return (spinning ? spinningItems : items).map((item, index) => (
      <div
        key={`${item?.id}-${index}`}
        className={`flex flex-col items-center justify-center flex-shrink-0 w-40 h-full ${
          rarities[item?.rarity]
        } p-2 mx-1 rounded-lg border`}
      >
        <div className="h-24 w-full flex items-center justify-center">
          <img
            src={item?.image}
            alt={item?.name}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="text-center mt-1">
          <p className="text-xs font-medium truncate">{item?.color}</p>
        </div>
      </div>
    ));
  }, [spinning, spinningItems, items, rarities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-6">
        <h1 className="text-3xl font-bold mb-4">Đã có lỗi xảy ra</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate("/lucky-wheel")}
          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Vòng Quay May Mắn
        </h1>

        {/* Thông tin vòng quay */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg border border-gray-200">
          <div className="flex justify-center mb-4">
            <img
              src={wheelInfo.packageInfo?.image || "/placeholder.png"}
              alt="Package"
              className="h-32 hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              {wheelInfo.packageInfo?.name || `Vòng Quay ${packageCode}`}
            </h2>
            <p className="text-gray-600 text-sm mb-3">
              {wheelInfo.packageInfo?.description ||
                "Có thể nhận được các sản phẩm giá trị"}
            </p>
            <p className="text-yellow-600 font-medium">
              Phạm vi giá:{" "}
              {wheelInfo.packageInfo?.priceRange || "Chưa có thông tin"}
            </p>
            <p className="text-yellow-600 mt-2 font-medium">
              Giá mỗi lần quay: {wheelInfo.price.toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-gray-600 mt-1">
              Tổng số box: {wheelInfo.totalBlindBoxes}
            </p>
            <p className="text-blue-600 mt-1 font-medium">
              Số dư ví: {userWallet.toLocaleString("vi-VN")} ₫
            </p>
            {userWallet < wheelInfo.price && (
              <button
                onClick={() => navigate("/deposit")}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Nạp thêm tiền
              </button>
            )}
          </div>
        </div>

        {/* Khu vực quay */}
        <div className="relative mb-8">
          <div
            className={`relative h-40 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg`}
          >
            <div className="absolute top-0 left-1/2 h-full w-1 bg-yellow-500 z-10 transform -translate-x-1/2"></div>
            <div
              ref={spinnerRef}
              className="absolute flex h-full transition-transform duration-100 left-1/2"
              style={{ transform: `translateX(${offset}px)` }}
            >
              {renderSpinningItems}
            </div>
          </div>
          {result && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg"></div>
            </div>
          )}
        </div>

        {/* Nút quay */}
        <div className="text-center mb-8">
          <button
            onClick={handleOpenCase}
            disabled={spinning || userWallet < wheelInfo.price}
            className={`px-8 py-3 rounded-lg text-lg font-bold transition-all duration-200 
              ${
                spinning || userWallet < wheelInfo.price
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-yellow-500/30"
              }`}
          >
            {spinning
              ? "Đang quay..."
              : userWallet < wheelInfo.price
              ? "Số dư không đủ"
              : `Quay (${wheelInfo.price.toLocaleString("vi-VN")} ₫)`}
          </button>
        </div>

        {/* Hiển thị các item có thể nhận */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Danh sách phần thưởng
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {renderItems}
          </div>
        </div>

        {/* Kết quả */}
        {result && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full animate-fade-up shadow-xl">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
                Bạn đã nhận được!
              </h3>
              <div
                className={`${
                  rarities[result?.rarity]
                } border border-gray-200 rounded-lg p-6`}
              >
                <div className="flex items-center">
                  <div className="w-1/3">
                    <img
                      src={result?.image}
                      alt={result?.name}
                      className="w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="w-2/3 pl-6">
                    <h4 className="text-2xl font-bold mb-2 text-gray-800">
                      {result?.name}
                    </h4>
                    {result?.features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500">{feature.type}:</span>
                        <span className="text-gray-700">
                          {feature.description}
                        </span>
                      </div>
                    ))}
                    {result?.isSpecial && (
                      <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-sm rounded-full mt-2">
                        Special
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={() => setResult(null)}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyWheelDetail;
