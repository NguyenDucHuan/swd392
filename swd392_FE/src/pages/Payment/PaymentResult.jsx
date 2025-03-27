import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../configs/globalVariables";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const type = searchParams.get("type");
    const message = searchParams.get("message");

    if (!type || !message) {
      toast.error("Thông tin thanh toán không hợp lệ");
      navigate("/");
      return;
    }

    setResult({
      type,
      message: decodeURIComponent(message),
    });

    // Lấy ID của transaction từ message
    const transactionId = message.match(/\d+$/)?.[0];
    if (transactionId) {
      fetchTransactionDetails(transactionId);
    }

    // Xử lý chuyển hướng dựa trên kết quả
    const handleRedirect = () => {
      setLoading(false);
      if (type === "success") {
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate("/customer/profile");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // Nếu thất bại, chuyển về trang chủ sau 3 giây
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    handleRedirect();
  }, [searchParams, navigate]);

  const fetchTransactionDetails = async (transactionId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/transactions/id?id=${transactionId}`
      );
      setTransaction(response.data);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex flex-col items-center">
          {result.type === "success" ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Thanh toán thành công!
              </h2>
              {transaction && (
                <div className="w-full mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã giao dịch:</span>
                      <span className="font-semibold">
                        #{transaction.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại giao dịch:</span>
                      <span className="font-semibold">
                        {transaction.type === "Wallet"
                          ? "Nạp tiền vào ví"
                          : "Thanh toán đơn hàng"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-semibold">
                        {formatDate(transaction.createDate)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-4">
                Chuyển hướng sau {countdown} giây...
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-gray-600 text-center mb-4">{result.message}</p>
              <p className="text-sm text-gray-500">
                Chuyển hướng về trang chủ sau 3 giây...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
