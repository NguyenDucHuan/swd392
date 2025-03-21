import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { user } = useAuth(); // Lấy thông tin người dùng từ AuthContext
  
  // Tạo key riêng cho mỗi người dùng
  const getCartKey = () => {
    return user ? `paneway-cart-${user.id}` : 'paneway-cart-guest';
  };

  // Load cart từ localStorage khi component mount hoặc user thay đổi
  useEffect(() => {
    const loadCart = () => {
      const cartKey = getCartKey();
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } else {
        // Reset giỏ hàng nếu không có dữ liệu cho user hiện tại
        setCartItems([]);
      }
    };
    
    loadCart();
  }, [user]); // Re-run khi user thay đổi (đăng nhập/đăng xuất)

  // Cập nhật localStorage và tính toán tổng khi cartItems thay đổi
  useEffect(() => {
    if (cartItems.length > 0) {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
    
    // Tính toán số lượng và tổng tiền
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    
    setCartCount(itemCount);
    setCartTotal(totalPrice);
  }, [cartItems, user]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (item) => {
    setCartItems(prevItems => {
      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.pakageCode === item.pakageCode && cartItem.type === item.type
      );

      if (existingItemIndex !== -1) {
        // Cập nhật số lượng nếu sản phẩm đã tồn tại
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        // Thêm sản phẩm mới
        return [...prevItems, item];
      }
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (pakageCode, type) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.pakageCode === pakageCode && item.type === type))
    );
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (pakageCode, type, quantity) => {
    if (quantity <= 0) {
      removeFromCart(pakageCode, type);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.pakageCode === pakageCode && item.type === type) 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCartItems([]);
    const cartKey = getCartKey();
    localStorage.removeItem(cartKey);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartCount, 
        cartTotal, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};