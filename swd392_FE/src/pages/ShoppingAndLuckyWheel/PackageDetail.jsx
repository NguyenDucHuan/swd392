import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaBoxOpen,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaShoppingCart,
  FaStar
} from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../configs/globalVariables';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
function PackageDetail() {
  const { packageCode } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState('package');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();
  useEffect(() => {
    const fetchPackageByCode = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/package/by-code`, {
          params: {
            packageCode: packageCode,
            filter: 'available'
          }
        });

        if (response.data) {
          setPackageData(response.data);
          
          // Set the first image as selected image
          if (response.data.images && response.data.images.$values && response.data.images.$values.length > 0) {
            setSelectedImage(response.data.images.$values[0].url);
          }
        } else {
          setError("Không tìm thấy thông tin package");
        }
      } catch (err) {
        console.error("Failed to fetch package details:", err);
        setError("Không thể tải thông tin package");
        toast.error("Không thể tải thông tin package");
      } finally {
        setLoading(false);
      }
    };

    if (packageCode) {
      fetchPackageByCode();
    }
  }, [packageCode]);
  useEffect(() => {
    if (purchaseType === 'package' && packageData?.totalPackage <= 0) {
      setPurchaseType('blindbox');
      toast.info('Đã chuyển sang mua từng BlindBox do Package đã hết hàng');
    }
  }, [packageData, purchaseType]);

  const handleImageClick = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    const images = getImages();
    if (images.length > 1) {
      const newIndex = (currentImageIndex - 1 + images.length) % images.length;
      setCurrentImageIndex(newIndex);
      setSelectedImage(images[newIndex].url);
    }
  };

  const handleNextImage = () => {
    const images = getImages();
    if (images.length > 1) {
      const newIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(newIndex);
      setSelectedImage(images[newIndex].url);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      setAddingToCart(true);
      let processedPrice = 0;
      if (typeof packageData.price === 'string') {
        const priceString = packageData.price;
        if (priceString.includes('-')) {
          const prices = priceString.split('-').map(p => 
            parseInt(p.trim().replace(/[^\d]/g, ''))
          );
          
          if (purchaseType === 'package') {
            processedPrice = prices[1] || prices[0];
          } else {
            processedPrice = prices[0];
          }
        } else {
          processedPrice = parseInt(priceString.replace(/[^\d]/g, ''));
        }
      } else if (typeof packageData.price === 'number') {
        processedPrice = packageData.price;
      }
      
      const cartItem = {
        type: purchaseType === 'package' ? 'Package' : 'BlindBox',
        pakageCode: packageData.pakageCode,
        quantity: quantity,
        name: packageData.name,
        price: processedPrice, // Lưu giá dạng số để tính toán
        formattedPrice: formatCurrency(processedPrice), // Thêm định dạng tiền tệ 
        imageUrl: packageData.images && packageData.images.$values && packageData.images.$values.length > 0 
          ? packageData.images.$values[0].url 
          : null
      };
      
      addToCart(cartItem);
      
      toast.success(`Đã thêm ${quantity} ${purchaseType === 'package' ? 'package' : 'blindbox'} vào giỏ hàng!`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Không thể thêm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };
  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: `/package-detail/${packageCode}` } });
  };

  const getImages = () => {
    if (!packageData || !packageData.images) return [];
    return packageData.images.$values || [];
  };

  const getBlindBoxes = () => {
    if (!packageData || !packageData.blindBoxes) return [];
    return packageData.blindBoxes.$values || [];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link to="/shopping" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <FaArrowLeft className="inline mr-2" /> Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  // No package found
  if (!packageData) {
    return (
      <div className="container mx-auto p-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-lg mb-4">Không tìm thấy sản phẩm</p>
        <Link to="/shopping" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <FaArrowLeft className="inline mr-2" /> Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const images = getImages();
  const blindBoxes = getBlindBoxes();

  return (
    <div className="container mx-auto p-4 bg-gray-50">
      <div className="mb-6">
        <Link to="/shopping" className="inline-flex items-center text-blue-500 hover:text-blue-700">
          <FaArrowLeft className="mr-2" /> Quay lại cửa hàng
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="mb-4 bg-white border rounded-lg p-4 flex items-center justify-center relative">
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
              <img 
                src={selectedImage} 
                alt={packageData.name} 
                className="max-w-full max-h-80 object-contain" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/400x400?text=Không+có+hình';
                }}
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`cursor-pointer border p-1 rounded ${
                      selectedImage === image.url ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    onClick={() => handleImageClick(image.url, index)}
                  >
                    <img 
                      src={image.url} 
                      alt={`Thumbnail ${index+1}`} 
                      className="w-full h-16 object-contain"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {/* Tags section */}
              {packageData.totalPackage > 0 && (
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {packageData.totalPackage} Package{packageData.totalBlindBox > 1 ? 's' : ''}
                </span>
              )}
              {packageData.totalBlindBox > 0 && (
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {packageData.totalBlindBox} BlindBox{packageData.totalBlindBox > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{packageData.name}</h1>
            <p className="text-sm text-gray-500 mb-4">Mã SP: {packageData.pakageCode}</p>
            
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-2xl font-semibold text-red-600">
                  {packageData.price}
                </h2>
              </div>
            </div>
            
            {/* Mystery Message */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <div className="flex items-start">
                <FaInfoCircle className="text-yellow-500 mt-1 mr-2" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Blind Box là gì?</span> 
                  <br />
                  Blind Box là những hộp bí ẩn có chứa nhân vật hoặc vật phẩm ngẫu nhiên. 
                  Bạn sẽ không biết được chính xác món đồ nào bên trong cho đến khi mở hộp!
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-4 ${
                    activeTab === 'details'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Chi tiết
                </button>
                <button
                  onClick={() => setActiveTab('blindboxes')}
                  className={`py-2 px-4 ${
                    activeTab === 'blindboxes'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  BlindBoxes ({blindBoxes.length})
                </button>
              </div>

              {activeTab === 'details' && (
                <>
                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Mô tả:</h3>
                    <p className="text-gray-700">{packageData.description || 'Không có mô tả sản phẩm'}</p>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="space-y-2">
                    {packageData.manufacturer && (
                      <div className="flex">
                        <span className="w-40 text-gray-600">Nhà sản xuất:</span>
                        <span className="text-gray-800">{packageData.manufacturer}</span>
                      </div>
                    )}
                    {packageData.category && (
                      <div className="flex">
                        <span className="w-40 text-gray-600">Danh mục:</span>
                        <span className="text-gray-800">{packageData.category.name}</span>
                      </div>
                    )}
                    <div className="flex">
                      <span className="w-40 text-gray-600">Số Package còn lại:</span>
                      <span className="text-gray-800">{packageData.totalPackage || 0}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Mã Package:</span>
                      <span className="text-gray-800">{packageData.pakageCode}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Số lượng BlindBox:</span>
                      <span className="text-gray-800">{packageData.totalBlindBox}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Số Package còn lại:</span>
                      <span className="text-gray-800">{packageData.totalPackage || 0}</span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'blindboxes' && (
                <div className="space-y-4">
                  {blindBoxes.map((box, index) => (
                    <div key={box.blindBoxId || index} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FaBoxOpen className="mr-2 text-indigo-500" />
                          <span className="font-medium">BlindBox #{box.number}</span>
                        </div>
                        {box.isSpecial && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded flex items-center">
                            <FaStar className="mr-1" /> Đặc biệt
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Màu sắc:</span> {box.color || 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-600">Kích thước:</span> {box.size ? `${box.size}cm` : 'N/A'}
                        </div>
                        <div>
                          <span className="text-gray-600">Giá gốc:</span> {box.price.toLocaleString('vi-VN')} ₫
                        </div>
                        <div>
                          <span className="text-gray-600">Giá sau giảm:</span> {box.discountedPrice.toLocaleString('vi-VN')} ₫
                        </div>
                        <div>
                          <span className="text-gray-600">Giảm giá:</span> {box.discount}%
                        </div>
                        <div>
                          <span className="text-gray-600">Trạng thái:</span> {box.isSold ? 'Đã bán' : 'Có sẵn'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase Options */}
            <div className="border-t pt-4 mb-4">
              <div className="font-medium mb-2">Chọn loại mua hàng:</div>
              <div className="flex space-x-4 mb-4">
                <label className={`flex items-center ${packageData.totalPackage <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    type="radio"
                    name="purchaseType"
                    value="package"
                    checked={purchaseType === 'package'}
                    onChange={() => setPurchaseType('package')}
                    className="mr-2"
                    disabled={packageData.totalPackage <= 0}
                  />
                  <span>Mua nguyên package {packageData.totalPackage <= 0 && '(Hết hàng)'}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="purchaseType"
                    value="blindbox"
                    checked={purchaseType === 'blindbox'}
                    onChange={() => setPurchaseType('blindbox')}
                    className="mr-2"
                  />
                  <span>Mua từng BlindBox</span>
                </label>
              </div>
            </div>

            {/* Add To Cart */}
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <label htmlFor="quantity" className="mr-4 font-medium">Số lượng:</label>
                <div className="flex items-center border rounded-md">
                  <button 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-l-md"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-none focus:outline-none"
                    min="1" 
                  />
                  <button 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-r-md"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70"
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="mr-2" /> Thêm vào giỏ hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Bạn cần đăng nhập</h3>
            <p className="mb-6">Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng và mua hàng.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleLoginRedirect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackageDetail;