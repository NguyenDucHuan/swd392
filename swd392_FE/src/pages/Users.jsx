import React from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const timeData = [
  { name: 'T2', value: 45 },
  { name: 'T3', value: 30 },
  { name: 'T4', value: 35 },
  { name: 'T5', value: 55 },
  { name: 'T6', value: 35 },
  { name: 'T7', value: 0 },
  { name: 'CN', value: 0 },
];

const ageData = [
  { age: '16-24', female: 75.4, male: 26.6 },
  { age: '25-34', female: 15, male: 5 },
  { age: '35-44', female: 5, male: 2 },
  { age: '45-54', female: 3, male: 1 },
  { age: '55+', female: 1.6, male: 0.4 },
];

const cityData = [
  { city: 'Hồ Chí Minh', percentage: 27.4 },
  { city: 'Hà Nội', percentage: 18.7 },
  { city: 'Bình Dương', percentage: 12.1 },
  { city: 'Vũng Tàu', percentage: 9.6 },
  { city: 'Huế, Đà Nẵng', percentage: 2.8 },
];

function Users() {
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lí Người dùng</h1>

        <div className="flex space-x-6">
          <div className="w-64 bg-white rounded-lg p-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/users"
                className="flex items-center p-2 rounded-lg bg-blue-50 text-blue-600"
              >
                <span className="ml-2">Người dùng</span>
              </Link>
              <Link
                to="/users/gold"
                className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <span className="ml-2">Tài khoản Vàng</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-gray-500 text-sm">Tổng số Người dùng</h3>
                    <p className="text-2xl font-bold mt-1">1000</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="text-green-500 text-sm">
                  1.8% Up from yesterday
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-gray-500 text-sm">Người dùng mới</h3>
                    <p className="text-2xl font-bold mt-1">1000</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                </div>
                <div className="text-green-500 text-sm">
                  1.8% Up from yesterday
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-gray-500 text-sm">Tỉ lệ chuyển đổi</h3>
                    <p className="text-2xl font-bold mt-1">1000</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
                <div className="text-red-500 text-sm">
                  4.3% Down from yesterday
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-gray-500 text-sm">Hạng Tài khoản</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Thành viên</span>
                    <span className="font-bold">500</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Bạc</span>
                    <span className="font-bold">400</span>
                  </div>
                  <div className="flex justify-between text-yellow-500">
                    <span>Vàng</span>
                    <span className="font-bold">100</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Thông tin nhân khẩu học</h3>
                <h4 className="text-gray-500 mb-4">Độ tuổi và Giới tính</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="age" type="category" />
                      <Tooltip />
                      <Bar dataKey="female" fill="#60A5FA" name="Nữ" stackId="stack" />
                      <Bar dataKey="male" fill="#064E3B" name="Nam" stackId="stack" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-6">Tỉnh/thành phố có nhiều người dùng nhất</h3>
                <div className="space-y-4">
                  {cityData.map((item) => (
                    <div key={item.city} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.city}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Thời gian sử dụng</h3>
                  <h4 className="text-gray-500">Trung bình hàng ngày</h4>
                  <div className="text-2xl font-bold mt-2">10 giờ 50 phút</div>
                </div>
                <div className="flex items-center text-sm text-blue-500">
                  <span className="bg-blue-50 px-2 py-1 rounded">38% từ tuần trước</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData}>
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
        </div>
      </div>
    </div>
  );
}

export default Users;