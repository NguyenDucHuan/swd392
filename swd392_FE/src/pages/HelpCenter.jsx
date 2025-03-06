import React from 'react';
import { Link } from 'react-router-dom';

function HelpCard({ title, children }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <div className="flex-grow" />
            <div className="flex justify-center">
                {children}
            </div>
        </div>
    );
}

function HelpCenter() {
    const helpTopics = [
        {
            title: 'Cách nâng cấp lên Tài khoản Vàng?',
            link: '#'
        },
        {
            title: 'Các nguyên nhân Quảng cáo không được duyệt?',
            link: '#'
        },
        {
            title: 'Thời gian hoàn phí khi Quảng cáo không được duyệt?',
            link: '#'
        },
        {
            title: 'Chi tiết các gói Quảng cáo hiện tại?',
            link: '#'
        },
        {
            title: 'Tài khoản Vàng có những quyền lợi gì?',
            link: '#'
        }
    ];

    return (
        <div className="flex-1 bg-gray-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Trung tâm Trợ giúp</h1>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Đóng góp ý kiến
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                {helpTopics.slice(0, 3).map((topic, index) => (
                    <HelpCard key={index} title={topic.title}>
                        <button className="text-blue-500 hover:text-blue-600 border border-blue-500 rounded-md px-3 py-1 mt-4">
                            Tìm hiểu thêm
                        </button>
                    </HelpCard>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                {helpTopics.slice(3, 5).map((topic, index) => (
                    <HelpCard key={index} title={topic.title}>
                        <button className="text-blue-500 hover:text-blue-600 border border-blue-500 rounded-md px-3 py-1 mt-4">
                            Tìm hiểu thêm
                        </button>
                    </HelpCard>
                ))}
                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center">
                    <button className="text-blue-500 hover:text-blue-600 flex items-center">
                        Xem tất cả
                        <svg
                            className="w-5 h-5 ml-2 border border-blue-500 rounded"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="bg-blue-500 rounded-lg p-8 text-center text-white">
                <h2 className="text-xl mb-2">Bạn vẫn cần trợ giúp?</h2>
                <p className="text-2xl font-medium mb-6">
                    Tìm câu trả lời hoặc liên hệ với bộ phận hỗ trợ
                </p>
                <Link
                to="/starthelp" className="px-6 py-2 bg-white text-blue-500 rounded-lg hover:bg-gray-100">
                    Bắt đầu
                </Link>
            </div>
        </div>
    );
}

export default HelpCenter;