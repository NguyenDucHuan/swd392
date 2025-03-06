// src/components/User/Navbar.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { RiLockPasswordLine, RiLoginCircleLine, RiLogoutBoxLine, RiUserLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get('https://localhost:7295/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUserProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Silent fail for user navbar
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);
  
  const profileOptions = [
    { id: 1, title: 'Quản lí Tài khoản', icon: RiUserLine, path: '/customer/profile' },
    { id: 2, title: 'Đổi mật khẩu', icon: RiLockPasswordLine, path: '/forgot-password' },
    { id: 3, title: 'Hoạt động đăng nhập', icon: RiLoginCircleLine, path: '/login-activity' },
    { id: 4, title: 'Đăng xuất', icon: RiLogoutBoxLine, action: 'logout' },
  ];

  const handleProfileOptionClick = (option) => {
    if (option.action === 'logout') {
      logout();
      toast.success('Đăng xuất thành công!');
      navigate('/'); // Changed to redirect to home page after logout
    } else if (option.path) {
      navigate(option.path);
    }
    setShowProfile(false);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
      {/* Logo and website name */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src='/assets/logo.jpg' alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-semibold">PaneWay</span>
        </Link>
      </div>
      
      {/* Navigation links */}
      <div className="hidden md:flex items-center space-x-8">
        <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
        <Link to="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
        <Link to="/shopping" className="text-gray-700 hover:text-blue-600">Shop</Link>
        <Link to="/lucky-wheel" className="text-gray-700 hover:text-blue-600">Lucky Wheel</Link>
      </div>

      {/* Auth buttons or profile */}
      <div className="flex items-center space-x-4">
        {user ? (
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
                  {loading ? 'Đang tải...' : (userProfile?.name)}
                </span>
                <span className="text-sm text-gray-500">
                  {loading ? '' : (userProfile?.role || user?.role )}
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
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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