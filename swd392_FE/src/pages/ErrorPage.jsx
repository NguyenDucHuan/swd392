import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.webp";

const ErrorPage = ({ statusCode = 404, message = "Trang không tồn tại" }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <img className="mx-auto h-24 w-auto" src={logo} alt="SGL Logo" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Lỗi {statusCode}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau hoặc quay về trang
            chủ.
          </p>
        </div>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
