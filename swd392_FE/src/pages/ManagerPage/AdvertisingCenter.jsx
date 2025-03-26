import React, { useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiArticleLine, RiFilter3Line } from 'react-icons/ri';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { name: '25k', value: 40 },
    { name: '199k', value: 84 },
    { name: '269k', value: 40 },
    { name: '499k', value: 45 },
    { name: '659k', value: 48 },
    { name: '1499k', value: 25 },
    { name: '1999k', value: 12 },
  ];
function AdvertisingCenter() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const ads = [
    {
      id: 1,
      account: 'Báo Thái Bình',
      avatar: 'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGcMEnwVDGNYm6BMBSkqdiHc26spGUkh89zbqykZSSHz0vnM8QtB7XTzJe98t0fMX3FMxnmXouQ4lG1D7Y67UAm&_nc_ohc=KJmesXmESXMQ7kNvgF3vHtn&_nc_oc=AdgXn4CnGa15fpCoWR55QcmgSNRhXWDDpm6eNGnOOP8rIFjeMdrMmWBMwT2LPcjPVdE&_nc_zt=23&_nc_ht=scontent.fsgn2-11.fna&_nc_gid=A8g48XRSR3rS-ycViEn3qXZ&oh=00_AYCe0Y_bKPnXE3WT6KEmfhnz695niRsHt_YnLJFGBvBrSQ&oe=67BBDBE8',
      purchaseDate: '20/10/2024',
      activeTime: '21.10.2024 - 12:53 PM',
      type: 'Header',
      price: '259,000 VND',
      status: 'Đã dùng'
    },
    {
      id: 2,
      account: 'Vietrekking',
      avatar: 'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGcMEnwVDGNYm6BMBSkqdiHc26spGUkh89zbqykZSSHz0vnM8QtB7XTzJe98t0fMX3FMxnmXouQ4lG1D7Y67UAm&_nc_ohc=KJmesXmESXMQ7kNvgF3vHtn&_nc_oc=AdgXn4CnGa15fpCoWR55QcmgSNRhXWDDpm6eNGnOOP8rIFjeMdrMmWBMwT2LPcjPVdE&_nc_zt=23&_nc_ht=scontent.fsgn2-11.fna&_nc_gid=A8g48XRSR3rS-ycViEn3qXZ&oh=00_AYCe0Y_bKPnXE3WT6KEmfhnz695niRsHt_YnLJFGBvBrSQ&oe=67BBDBE8',
      purchaseDate: '5/11/2024',
      activeTime: '10.11.2024 - 15:28 PM',
      type: 'Onpage',
      price: '499,000 VND',
      status: 'Chưa dùng'
    },
    {
      id: 3,
      account: 'Báo Tuổi trẻ',
      avatar: 'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGcMEnwVDGNYm6BMBSkqdiHc26spGUkh89zbqykZSSHz0vnM8QtB7XTzJe98t0fMX3FMxnmXouQ4lG1D7Y67UAm&_nc_ohc=KJmesXmESXMQ7kNvgF3vHtn&_nc_oc=AdgXn4CnGa15fpCoWR55QcmgSNRhXWDDpm6eNGnOOP8rIFjeMdrMmWBMwT2LPcjPVdE&_nc_zt=23&_nc_ht=scontent.fsgn2-11.fna&_nc_gid=A8g48XRSR3rS-ycViEn3qXZ&oh=00_AYCe0Y_bKPnXE3WT6KEmfhnz695niRsHt_YnLJFGBvBrSQ&oe=67BBDBE8',
      purchaseDate: '11/11/2024',
      activeTime: '12.11.2024 - 8:30 AM',
      type: 'Onpage',
      price: '199,000 VND',
      status: 'Đợi duyệt'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã dùng':
        return 'bg-green-100 text-green-800';
      case 'Chưa dùng':
        return 'bg-pink-100 text-pink-800';
      case 'Đợi duyệt':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
      <div className="grid grid-cols-4 gap-6 mb-6">
            <button className="flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg col-span-2">
              <RiArticleLine  className="mr-2" />
              Tạo Header
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg">
            <RiArticleLine  className="mr-2" />
            Tạo Onpage
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg">
            <FaEdit className="mr-2" />
            Chỉnh sửa
            </button>
          </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Trung tâm Quảng cáo</h1>

        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Sales Details</h2>
          <select className="px-4 py-2 border border-gray-200 rounded-lg">
            <option>Tháng 10</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#60A5FA"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

        <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Chi tiết giao dịch</h2>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg">
                  <RiFilter3Line />
                  <span>Bộ lọc</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-4">Tên tài khoản</th>
                  <th className="pb-4">Thời điểm mua</th>
                  <th className="pb-4">Thời gian đăng bài</th>
                  <th className="pb-4">Loại Quảng cáo</th>
                  <th className="pb-4">Gói</th>
                  <th className="pb-4">Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b">
                    <td className="py-4">
                      <div className="flex items-center">
                        <img
                          src={ad.avatar}
                          alt={ad.account}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <span>{ad.account}</span>
                      </div>
                    </td>
                    <td className="py-4">{ad.purchaseDate}</td>
                    <td className="py-4">{ad.activeTime}</td>
                    <td className="py-4">{ad.type}</td>
                    <td className="py-4">{ad.price}</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          ad.status
                        )}`}
                      >
                        {ad.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvertisingCenter;