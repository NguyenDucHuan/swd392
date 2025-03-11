import React from 'react';

function Settings() {
  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt chung</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2">
            <button className="text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <button className="text-blue-500 text-sm">Cập nhập Logo</button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên trang web
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Orbit Web"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề SEO
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Orbit web is a hybrid dashboard"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ khoá SEO
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="CEO"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copy Right
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="All rights Reserved@orbitweb"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả SEO
              </label>
              <textarea
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 h-32"
                placeholder="Orbit web is a hybrid dashboard"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;