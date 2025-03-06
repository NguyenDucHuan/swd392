import { useState } from 'react';
import { BsQuestionOctagon } from "react-icons/bs";
import { RiAdvertisementLine, RiArrowLeftLine, RiArrowRightLine, RiDashboardLine, RiFileTextLine, RiLogoutBoxLine, RiSettings4Line, RiUserLine } from 'react-icons/ri';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function ManegerSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: RiDashboardLine, text: 'Tổng quan', path: '/dashboard' },
    { icon: RiFileTextLine, text: 'Nội dung', path: '/content' },
    { icon: RiUserLine, text: 'Quản lí Người dùng', path: '/users' },
    { icon: RiAdvertisementLine, text: 'Trung tâm Quảng cáo', path: '/ads' },
    { icon: BsQuestionOctagon, text: 'Trung tâm Trợ giúp', path: '/help' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <div 
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-gray-700"
      >
        {isCollapsed ? (
          <RiArrowRightLine className="w-4 h-4" />
        ) : (
          <RiArrowLeftLine className="w-4 h-4" />
        )}
      </button>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <img src="https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGcMEnwVDGNYm6BMBSkqdiHc26spGUkh89zbqykZSSHz0vnM8QtB7XTzJe98t0fMX3FMxnmXouQ4lG1D7Y67UAm&_nc_ohc=KJmesXmESXMQ7kNvgF3vHtn&_nc_oc=AdgXn4CnGa15fpCoWR55QcmgSNRhXWDDpm6eNGnOOP8rIFjeMdrMmWBMwT2LPcjPVdE&_nc_zt=23&_nc_ht=scontent.fsgn2-11.fna&_nc_gid=A8g48XRSR3rS-ycViEn3qXZ&oh=00_AYCe0Y_bKPnXE3WT6KEmfhnz695niRsHt_YnLJFGBvBrSQ&oe=67BBDBE8" alt="PaneWay" className="h-8" />
          {!isCollapsed && <span className="ml-2 font-semibold text-xl">PaneWay</span>}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname === item.path || 
                  (item.path === '/users' && location.pathname.startsWith('/users'))
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isCollapsed ? item.text : ''}
              >
                <item.icon className="w-6 h-6" />
                {!isCollapsed && <span className="ml-3">{item.text}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-2">
          <li>
            <Link
              to="/settings"
              className={`flex items-center p-2 rounded-lg ${
                location.pathname === '/settings'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isCollapsed ? 'Cài đặt' : ''}
            >
              <RiSettings4Line className="w-6 h-6" />
              {!isCollapsed && <span className="ml-3">Cài đặt</span>}
            </Link>
          </li>
          <li>
            <button 
              className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
              title={isCollapsed ? 'Đăng xuất' : ''}
              onClick={handleLogout}
            >
              <RiLogoutBoxLine className="w-6 h-6" />
              {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ManegerSidebar;