import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { user } = useAuth();
  
  const getCartKey = () => {
    return user ? `blindbox-cart-${user.id}` : 'blindbox-cart-guest';
  };

  useEffect(() => {
    const loadCart = () => {
      const cartKey = getCartKey();
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (error) {
          console.error("Error parsing cart data:", error);
          setCartItems([]);
          localStorage.removeItem(cartKey);
        }
      } else {
        setCartItems([]);
      }
    };
    
    loadCart();
  }, [user]); 

  useEffect(() => {
    const cartKey = getCartKey();
    
    // Always update localStorage, even with empty cart
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
    
    // Calculate quantity and total price
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    let totalPrice = 0;
    for (const item of cartItems) {
      let price = item.price;
      if (typeof price === 'string') {
        // Convert string price to number if needed
        price = parseFloat(price.replace(/[^\d.]/g, ''));
      }
      if (!isNaN(price)) {
        totalPrice += price * item.quantity;
      }
    }
    
    setTotalItems(itemCount);
    setCartTotal(totalPrice);
  }, [cartItems, user]);

  // Add product to cart
  const addToCart = (item) => {
    setCartItems(prevItems => {
      // Check if product is already in cart
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.pakageCode === item.pakageCode && cartItem.type === item.type
      );

      if (existingItemIndex !== -1) {
        // Update quantity if product exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += (item.quantity || 1);
        return updatedItems;
      } else {
        // Add new product
        return [...prevItems, {...item, quantity: item.quantity || 1}];
      }
    });
  };

  // Remove product from cart
  const removeFromCart = (pakageCode, type) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.pakageCode === pakageCode && item.type === type))
    );
  };

  // Update product quantity
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

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    const cartKey = getCartKey();
    localStorage.removeItem(cartKey);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        totalItems, 
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