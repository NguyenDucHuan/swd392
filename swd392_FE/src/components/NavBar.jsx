import React, { useState } from 'react';
import { RiSearchLine, RiNotification3Line, RiMailLine, RiUserLine, RiLockPasswordLine, RiLoginCircleLine, RiLogoutBoxLine } from 'react-icons/ri';

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
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
        <div className="relative">
          <button
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMessages(false);
              setShowProfile(false);
            }}
          >
            <RiNotification3Line className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
              <h3 className="px-4 py-2 text-lg font-semibold">Thông báo</h3>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className="w-full px-4 py-3 hover:bg-gray-50 flex items-center"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <RiNotification3Line className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-gray-500">{notification.subtitle}</div>
                  </div>
                  {notification.count > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-500 px-2 py-1 rounded-full text-xs">
                      {notification.count}
                    </span>
                  )}
                </button>
              ))}
              <button className="w-full px-4 py-2 text-blue-500 hover:bg-gray-50 text-sm">
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowProfile(false);
            }}
          >
            <RiMailLine className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
              <h3 className="px-4 py-2 text-lg font-semibold">Hộp thư</h3>
              {messages.map((message) => (
                <button
                  key={message.id}
                  className="w-full px-4 py-3 hover:bg-gray-50 flex items-center"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <RiMailLine className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{message.title}</div>
                    <div className="text-sm text-gray-500">{message.subtitle}</div>
                  </div>
                  {message.count > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-500 px-2 py-1 rounded-full text-xs">
                      {message.count}
                    </span>
                  )}
                </button>
              ))}
              <button className="w-full px-4 py-2 text-blue-500 hover:bg-gray-50 text-sm">
                Xem tất cả tin nhắn
              </button>
            </div>
          )}
        </div>

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
              src="https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGcMEnwVDGNYm6BMBSkqdiHc26spGUkh89zbqykZSSHz0vnM8QtB7XTzJe98t0fMX3FMxnmXouQ4lG1D7Y67UAm&_nc_ohc=KJmesXmESXMQ7kNvgF3vHtn&_nc_oc=AdgXn4CnGa15fpCoWR55QcmgSNRhXWDDpm6eNGnOOP8rIFjeMdrMmWBMwT2LPcjPVdE&_nc_zt=23&_nc_ht=scontent.fsgn2-11.fna&_nc_gid=A8g48XRSR3rS-ycViEn3qXZ&oh=00_AYCe0Y_bKPnXE3WT6KEmfhnz695niRsHt_YnLJFGBvBrSQ&oe=67BBDBE8"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-medium">PaneWay</span>
              <span className="text-sm text-gray-500">Admin</span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
              {profileOptions.map((option, index) => (
                <React.Fragment key={option.id}>
                  <button className="w-full px-4 py-2 hover:bg-gray-50 flex items-center whitespace-nowrap">
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

export default Navbar;