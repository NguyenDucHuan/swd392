import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoReload } from "react-icons/io5";
import {
  RiAdvertisementLine,
  RiArticleLine,
  RiFileTextLine,
  RiUserLine,
} from "react-icons/ri";
import { TbCircleDashedPlus } from "react-icons/tb";
import { toast } from "react-toastify";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BASE_URL } from "../../configs/globalVariables";

const StatCard = ({ title, value, change, icon: Icon, changeType = "up" }) => (
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
    <div
      className={`flex items-center mt-2 ${
        changeType === "up" ? "text-green-500" : "text-red-500"
      }`}
    >
      <span className="text-sm">{change}</span>
      <span className="text-gray-500 text-sm ml-1">So với tháng trước</span>
    </div>
  </div>
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [quarterlyRevenue, setQuarterlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [monthlyFeedbacks, setMonthlyFeedbacks] = useState([]);
  const [quarterlyFeedbacks, setQuarterlyFeedbacks] = useState([]);
  const [yearlyFeedbacks, setYearlyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) return;

        // Fetch dashboard overview
        const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(dashboardResponse.data);

        // Fetch revenue data
        const [monthlyRev, quarterlyRev, yearlyRev] = await Promise.all([
          axios.get(`${BASE_URL}/dashboard/monthly-revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/dashboard/quarterly-revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/dashboard/yearly-revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setMonthlyRevenue(monthlyRev.data.$values || []);
        setQuarterlyRevenue(quarterlyRev.data.$values || []);
        setYearlyRevenue(yearlyRev.data.$values || []);

        // Fetch feedback data
        const [monthlyFb, quarterlyFb, yearlyFb] = await Promise.all([
          axios.get(`${BASE_URL}/dashboard/monthly-total-feedbacks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/dashboard/quarterly-total-feedbacks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/dashboard/yearly-total-feedbacks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setMonthlyFeedbacks(monthlyFb.data.$values || []);
        setQuarterlyFeedbacks(quarterlyFb.data.$values || []);
        setYearlyFeedbacks(yearlyFb.data.$values || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getChartData = () => {
    switch (selectedTimeRange) {
      case "month":
        return monthlyRevenue.map((item) => ({
          name: `Tháng ${item.month}/${item.year}`,
          value: item.amount,
        }));
      case "quarter":
        return quarterlyRevenue.map((item) => ({
          name: `Q${item.quarter}/${item.year}`,
          value: item.amount,
        }));
      case "year":
        return yearlyRevenue.map((item) => ({
          name: `Năm ${item.year}`,
          value: item.amount,
        }));
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <button className="flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg col-span-2">
            <RiArticleLine className="mr-2" />
            Tạo Bài viết
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg">
            <RiAdvertisementLine className="mr-2" />
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
            value={dashboardData?.totalUsers || 0}
            change="+1.8%"
            icon={RiUserLine}
          />
          <StatCard
            title="Package đã bán"
            value={`${dashboardData?.isSoldPackages || 0}/${
              dashboardData?.totalPackages || 0
            }`}
            change="+1.8%"
            icon={AiOutlineUsergroupAdd}
          />
          <StatCard
            title="BlindBox đã bán"
            value={`${dashboardData?.isSoldBlindBoxes || 0}/${
              dashboardData?.totalBlindBoxes || 0
            }`}
            change="+1.8%"
            icon={RiFileTextLine}
          />
          <StatCard
            title="Đơn hàng hoàn thành"
            value={`${dashboardData?.completedOrders || 0}/${
              dashboardData?.totalOrders || 0
            }`}
            change="+4.3%"
            icon={IoReload}
            changeType="down"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Doanh thu</h2>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="month">Theo tháng</option>
            <option value="quarter">Theo quý</option>
            <option value="year">Theo năm</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => label}
              />
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
