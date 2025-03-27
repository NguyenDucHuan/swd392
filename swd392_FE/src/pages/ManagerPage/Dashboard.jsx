import React from 'react';
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoReload } from "react-icons/io5";
import { RiAdvertisementLine, RiArticleLine, RiFileTextLine, RiUserLine } from 'react-icons/ri';
import { TbCircleDashedPlus } from "react-icons/tb";
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

const StatCard = ({ title, value, change, icon: Icon, changeType = 'up' }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-pink-500" />
      </div>
    </div>
    <div className="flex items-baseline">
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
    <div className={`flex items-center mt-2 ${changeType === 'up' ? 'text-green-500' : 'text-red-500'
      }`}>
      <span className="text-sm">{change}</span>
      <span className="text-gray-500 text-sm ml-1">Up from yesterday</span>
    </div>
  </div>
);

function Dashboard() {
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
      <div className="grid grid-cols-4 gap-6 mb-6">
          <button className="flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg col-span-2">
            <RiArticleLine  className="mr-2" />
            Tạo Bài viết
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg">
            <RiAdvertisementLine  className="mr-2" />
            Tạo Quảng cáo
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg">
            <TbCircleDashedPlus className="mr-2" />
            Tạo Tin
          </button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
            <p className="text-gray-500">1 tháng qua</p>
          </div>

        </div>

        <div className="grid grid-cols-4 gap-6">
          <StatCard
            title="Tổng số Người dùng"
            value="1000"
            change="1.8%"
            icon={RiUserLine}
          />
          <StatCard
            title="Người dùng mới"
            value="1000"
            change="1.8%"
            icon={AiOutlineUsergroupAdd}
          />
          <StatCard
            title="Tổng số Bài viết"
            value="1000"
            change="1.8%"
            icon={RiFileTextLine}
          />
          <StatCard
            title="Tỉ lệ chuyển đổi"
            value="1000"
            change="4.3%"
            icon={IoReload}
            changeType="down"
          />
        </div>
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
    </div>
  );
}

export default Dashboard;