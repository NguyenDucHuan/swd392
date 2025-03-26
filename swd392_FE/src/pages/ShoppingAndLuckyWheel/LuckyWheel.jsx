import React, { useEffect, useRef, useState } from 'react';

const LuckyWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const spinnerRef = useRef(null);

  // Token được cung cấp
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9zaWQiOiIxIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoidGFubG1zZTE3MDU4N0BmcHQuZWR1LnZuIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiVXNlciIsIm5iZiI6MTc0Mjc1MDczNiwiZXhwIjoxNzQyNzU5NzM2LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3Mjk1IiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzI5NSJ9.TOShAT0mFCaULoEOhw5dJOVQxzhGpOGzPefihsaahH4";

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
        const response = await fetch('/api/wheel', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        const data = await response.json();
        setItems(data.packages);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, [token]);

  // Hàm xử lý mở rương
  const handleOpenCase = async () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    try {
      const response = await fetch(`/api/wheel/play?times=1&amount=2.49`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      // Tạo danh sách items mới với vị trí item trúng
      const newItems = [];
      for (let i = 0; i < 50; i++) {
        newItems.push(items[Math.floor(Math.random() * items.length)]);
      }

      // Chèn item trúng vào vị trí xác định (item ở giữa khi dừng)
      const winningItem = data[0]; // Giả sử API trả về mảng các item trúng
      const winningPosition = 25;
      newItems[winningPosition] = winningItem;

      setItems(newItems);
      setOffset(0);

      // Animation mở rương
      setTimeout(() => {
        // Tạo hiệu ứng quay với tốc độ giảm dần
        const targetOffset = (winningPosition - 2) * -120; // Số pixel để di chuyển đến vị trí item trúng
        const duration = 5000; // Thời gian animation
        const startTime = Date.now();

        const animate = () => {
          const elapsedTime = Date.now() - startTime;
          const progress = Math.min(elapsedTime / duration, 1);

          // Easing function tạo hiệu ứng chậm dần
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const easedProgress = progress < 0.7
            ? progress
            : 0.7 + (easeOutCubic - 0.7) * (1 / 0.3) * (progress - 0.7);

          setOffset(targetOffset * easedProgress);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Hoàn thành animation
            setSpinning(false);
            setResult(winningItem);
          }
        };

        requestAnimationFrame(animate);
      }, 500);
    } catch (error) {
      console.error('Error playing wheel:', error);
      setSpinning(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto bg-gray-900 text-white p-6 rounded-lg my-12">
      <h1 className="text-3xl font-bold mb-6">Blindbox Case Opener</h1>

      {/* Hiển thị rương */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 mb-6 w-full">
        <div className="flex justify-center mb-4">
          <img src="/api/placeholder/200/150" alt="Case" className="h-32 hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Dreams & Nightmares Case</h2>
          <p className="text-gray-400 text-sm">Có thể nhận được các skin hiếm và dao</p>
        </div>
      </div>

      {/* Khu vực quay spinner */}
      <div className="relative w-full h-32 border-4 border-gray-700 rounded-lg mb-6 overflow-hidden">
        {/* Marker chỉ vị trí trúng */}
        <div className="absolute top-0 left-1/2 h-full w-1 bg-yellow-500 z-10 transform -translate-x-1/2"></div>

        {/* Bộ spinner chứa các items */}
        <div
          ref={spinnerRef}
          className="absolute flex h-full transition-transform duration-100"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {items.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`flex flex-col items-center justify-center flex-shrink-0 w-32 h-full ${rarities[item.rarity]} p-2 mx-1 rounded-md border border-gray-600`}
            >
              <div className="h-16 w-full flex items-center justify-center">
                <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-center mt-1">
                <p className="text-xs font-medium truncate">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nút mở rương */}
      <button
        onClick={handleOpenCase}
        disabled={spinning}
        className={`px-8 py-3 rounded-lg text-lg font-bold transition-all duration-200 
          ${spinning
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 shadow-lg hover:shadow-yellow-500/30'
          }`}
      >
        {spinning ? 'Đang mở...' : 'Mở rương (2.49$)'}
      </button>

      {/* Hiển thị kết quả */}
      {result && (
        <div className="mt-8 w-full">
          <div className="text-center mb-2">
            <h3 className="text-xl font-bold">Bạn đã nhận được!</h3>
          </div>
          <div className={`flex items-center justify-center p-6 ${rarities[result.rarity]} rounded-lg border border-gray-600`}>
            <div className="mr-4">
              <img src={result.image} alt={result.name} className="w-32 h-24 object-contain" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Bạn đã nhận được</p>
              <h4 className="text-2xl font-bold">{result.name}</h4>
              <p className={`text-sm capitalize`}>{result.rarity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyWheel;