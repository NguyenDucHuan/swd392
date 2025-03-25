import axios from 'axios';
import React, { useState } from 'react';
import { FaArrowLeft, FaCreditCard, FaShoppingBag, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../configs/globalVariables';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    phone: '',
    address: 'Nhận tại cửa hàng'
  });

  const calculateSubtotal = () => {
    let total = 0;
    cartItems.forEach(item => {
      let priceStr = item.price;
      if (typeof priceStr === 'string') {
        priceStr = priceStr.replace(/[^\d]/g, '');
        if (priceStr) {
          total += parseInt(priceStr) * item.quantity;
        }
      } else if (typeof priceStr === 'number') {
        total += priceStr * item.quantity;
      }
    });
    return total;
  };
  const handleCheckout = () => {
    const token = localStorage.getItem('access_token');
    
    if (!isAuthenticated || !token) {
      toast.warning('Vui lòng đăng nhập để tiến hành thanh toán!');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    setShowCheckoutModal(true);
  };

  const processOrder = async () => {
    // Validate required fields
    if (!shippingInfo.phone) {
      toast.error('Vui lòng nhập số điện thoại!');
      return;
    }
    
    // Additional validation for delivery address
    if (shippingInfo.address === 'Giao hàng tận nơi' && !shippingInfo.addressDetail) {
      toast.error('Vui lòng nhập địa chỉ chi tiết!');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const orderItems = cartItems.map(item => ({
        type: item.type,
        pakageCode: item.pakageCode,
        quantity: item.quantity
      }));
      
      const orderData = {
        phone: shippingInfo.phone,
        address: shippingInfo.address === 'Giao hàng tận nơi' 
          ? `${shippingInfo.address}: ${shippingInfo.addressDetail}` 
          : shippingInfo.address,
        products: orderItems  
      };
      
      console.log('Sending order data:', orderData);
      
      const response = await axios.post(`${BASE_URL}/orders/order`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.data) {
        if (typeof response.data === 'string' && response.data.includes("successfully")) {
          toast.success('Đặt hàng thành công!');
          clearCart();
          setShowCheckoutModal(false);
          navigate('/shopping');
          return;
        }
        if (typeof response.data === 'number' || (typeof response.data === 'string' && !isNaN(response.data))) {
          toast.success('Đặt hàng thành công!');
          clearCart();
          setShowCheckoutModal(false);
          navigate('/shopping');
          return;
        }
        
        if (response.data.isSuccess) {
          toast.success('Đặt hàng thành công!');
          clearCart();
          setShowCheckoutModal(false);
          navigate('/shopping');
          return;
        }
        
        toast.success('Đặt hàng thành công!');
        console.log('Unexpected success response format:', response.data);
        clearCart();
        setShowCheckoutModal(false);
        navigate('/shopping');
      } else {
        toast.error('Đặt hàng không thành công: Vui lòng thử lại sau');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // More detailed error handling
      if (error.response) {
        // The server responded with an error status
        if (error.response.status === 500) {
          toast.error('Lỗi máy chủ: Không thể xử lý đơn hàng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
        } else if (error.response.data && error.response.data.detail) {
          toast.error(error.response.data.detail);
        } else {
          toast.error(`Lỗi ${error.response.status}: Không thể xử lý đơn hàng`);
        }
      } else if (error.request) {
        toast.error('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        toast.error('Có lỗi xảy ra khi xử lý đơn hàng: ' + error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FaShoppingBag className="text-gray-300 text-6xl" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiến hành mua hàng</p>
          <Link to="/shopping" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center">
            <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn ({totalItems} sản phẩm)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Sản phẩm</th>
                  <th className="text-center py-3">Số lượng</th>
                  <th className="text-right py-3">Giá</th>
                  <th className="text-right py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4">
                      <div className="flex items-center">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-16 h-16 object-contain mr-4" 
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center mr-4">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            Loại: {item.type === 'Package' ? 'Package' : 'BlindBox'}
                          </p>
                          <p className="text-sm text-gray-500">Mã: {item.pakageCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center">
                        <button 
                          className="px-2 py-1 border rounded-l-md"
                          onClick={() => updateQuantity(item.pakageCode, item.type, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.pakageCode, item.type, parseInt(e.target.value) || 1)} 
                          className="w-12 text-center border-t border-b"
                        />
                        <button 
                          className="px-2 py-1 border rounded-r-md"
                          onClick={() => updateQuantity(item.pakageCode, item.type, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-right font-medium">
                      {typeof item.formattedPrice === 'string' 
                        ? item.formattedPrice 
                        : formatCurrency(item.price)}
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => removeFromCart(item.pakageCode, item.type)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <Link to="/shopping" className="text-blue-600 hover:text-blue-800 flex items-center">
              <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
            </Link>
            <button 
              onClick={clearCart}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
            >
              Xóa giỏ hàng
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h2>
            
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>Tạm tính:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:bg-blue-400"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaCreditCard className="mr-2" /> Checkout 
                </>
              )}
            </button>
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Thông tin giao hàng</h3>
                    <button 
                      onClick={() => setShowCheckoutModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingInfo.phone}
                          onChange={handleShippingInfoChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                          placeholder="Nhập số điện thoại của bạn"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ nhận hàng <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleShippingInfoChange}
                          className="w-full p-2 border text-gray-700 border-gray-300 rounded-md"
                          required
                        >
                          <option value="Nhận tại cửa hàng">Nhận tại cửa hàng</option>
                          <option value="Giao hàng tận nơi">Giao hàng tận nơi</option>
                        </select>
                      </div>
                      
                      {shippingInfo.address === 'Giao hàng tận nơi' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chi tiết địa chỉ <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="addressDetail"
                            value={shippingInfo.addressDetail || ''}
                            onChange={handleShippingInfoChange}
                            className="w-full p-2 border text-gray-700 border-gray-300 rounded-md"
                            rows="3"
                            required
                            placeholder="Nhập địa chỉ chi tiết của bạn"
                          ></textarea>
                        </div>
                      )}
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-700 mb-1">Tổng cộng:</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(calculateSubtotal())}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button 
                        onClick={() => setShowCheckoutModal(false)}
                        className="px-4 py-2 border text-gray-700 border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={isProcessing}
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={processOrder}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {isProcessing ? "Đang xử lý..." : "Tiến hành thanh toán"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;