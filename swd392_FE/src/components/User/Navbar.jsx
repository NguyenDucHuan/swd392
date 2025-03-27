import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { RiLockPasswordLine, RiLoginCircleLine, RiLogoutBoxLine, RiMoneyDollarCircleLine, RiUserLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../configs/globalVariables';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(BASE_URL + '/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const profileOptions = [
    { id: 1, title: 'Quản lí Tài khoản', icon: RiUserLine, path: '/customer/profile' },
    { id: 2, title: 'Đổi mật khẩu', icon: RiLockPasswordLine, path: '/user-change-password' },
    { id: 3, title: 'Nạp tiền', icon: RiMoneyDollarCircleLine, path: '/deposit' },
    { id: 4, title: 'Hoạt động đăng nhập', icon: RiLoginCircleLine, path: '/login-activity' },
    { id: 5, title: 'Đăng xuất', icon: RiLogoutBoxLine, action: 'logout' },
  ];

  const handleProfileOptionClick = (option) => {
    if (option.action === 'logout') {
      logout();
      toast.success('Đăng xuất thành công!');
    } else if (option.path) {
      navigate(option.path);
    }
    setShowProfile(false);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src='/assets/logo.jpg' alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-semibold">BlindBoxShop</span>
        </Link>
      </div>

      {/* Navigation links */}
      <div className="hidden md:flex items-center space-x-8">
        <Link to="/about" className="text-gray-700 hover:text-pink-600">About</Link>
        <Link to="/blog" className="text-gray-700 hover:text-pink-600">Blog</Link>
        <Link to="/shopping" className="text-gray-700 hover:text-pink-600">Shop</Link>
        <Link to="/lucky-wheel" className="text-gray-700 hover:text-pink-600">Lucky Wheel</Link>
      </div>


      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {/* Chỉ hiển thị cart khi đã đăng nhập */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
              <FaShoppingCart className="text-gray-700 text-xl" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2"
                onClick={() => setShowProfile(!showProfile)}
              >
                <img
                  src={userProfile?.avatarUrl || "https://ui-avatars.com/api/?name=User&background=random"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden md:flex flex-col">
                  <span className="font-medium">
                    {loading ? 'Đang tải...' : (userProfile?.name || 'User')}
                  </span>
                  <span className="text-green-600 font-medium">
                    {loading ? 'Đang tải...' : userProfile?.walletBalance?.toLocaleString('vi-VN') || 'balance'} ₫
                  </span>
                </div>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
                  {profileOptions.map((option, index) => (
                    <div key={option.id}>
                      <button
                        className="w-full px-4 py-2 hover:bg-gray-50 flex items-center whitespace-nowrap"
                        onClick={() => handleProfileOptionClick(option)}
                      >
                        <option.icon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{option.title}</span>
                      </button>
                      {index < profileOptions.length - 1 && <hr className="my-1" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-pink-600 hover:text-pink-800"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;