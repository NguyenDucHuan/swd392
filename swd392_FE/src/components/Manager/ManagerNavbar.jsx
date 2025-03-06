// src/components/Manager/ManagerNavbar.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { RiLockPasswordLine, RiLoginCircleLine, RiLogoutBoxLine, RiSearchLine, RiUserLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

function ManagerNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
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
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const notifications = [
    { id: 1, title: 'Cài đặt', subtitle: 'Cập nhật Tổng quan', count: 14 },
    { id: 2, title: 'Sự kiện', subtitle: 'Sự kiện mới đang diễn ra', count: 26 },
    { id: 3, title: 'Hồ sơ', subtitle: 'Cập nhật hồ sơ', count: 11 },
    { id: 4, title: 'Lỗi', subtitle: 'Lượt gửi báo cáo mới', count: 5 },
  ];

  const messages = [
    { id: 1, title: 'Nodmas Team', subtitle: 'Cập nhật Tổng quan', count: 12 },
    { id: 2, title: 'Sự kiện', subtitle: 'Sự kiện mới đang diễn ra', count: 6 },
    { id: 3, title: 'Tin nhắn từ người lạ', subtitle: 'Có thể bạn biết', count: 3 },
  ];

  const profileOptions = [
    { id: 1, title: 'Quản lí Tài khoản', icon: RiUserLine },
    { id: 2, title: 'Đổi mật khẩu', icon: RiLockPasswordLine },
    { id: 3, title: 'Hoạt động đăng nhập', icon: RiLoginCircleLine },
    { id: 4, title: 'Đăng xuất', icon: RiLogoutBoxLine },
  ];

  const handleProfileOptionClick = (optionId) => {
    if (optionId === 4) {
      // Handle logout
      logout();
      toast.success('Đăng xuất thành công!');
      navigate('/'); // Redirect to home page after logout
    } else if (optionId === 1) {
      // Navigate to account management
      navigate('/profile');
    } else if (optionId === 2) {
      // Navigate to change password
      navigate('/change-password');
    }
    // Close the dropdown
    setShowProfile(false);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Search input */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 mr-8">
        {/* Notifications and Messages sections remain the same */}
        {/* ... */}

        <div className="relative">
          <button
            className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowMessages(false);
            }}
          >
            <img
              src={userProfile?.avatarUrl || "https://ui-avatars.com/api/?name=User&background=random"}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-medium">
                {loading ? 'Đang tải...' : (userProfile?.fullName || user?.email || 'Người dùng')}
              </span>
              <span className="text-sm text-gray-500">
                {loading ? '' : (userProfile?.role || user?.role || 'User')}
              </span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
              {profileOptions.map((option, index) => (
                <React.Fragment key={option.id}>
                  <button 
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center whitespace-nowrap"
                    onClick={() => handleProfileOptionClick(option.id)}
                  >
                    <option.icon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{option.title}</span>
                  </button>
                  {index < profileOptions.length - 1 && <hr className="my-1" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerNavbar;