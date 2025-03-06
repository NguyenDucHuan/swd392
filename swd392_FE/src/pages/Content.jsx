import React, { useState } from 'react';
import { RiSearchLine, RiCalendarLine } from 'react-icons/ri';
import { IoGridOutline, IoListOutline } from "react-icons/io5";

function Content() {
    const [selectedTab, setSelectedTab] = useState('posted');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const posts = [
        {
            id: 1,
            title: 'TỪ 1/11 BẢO TÀNG LỊCH SỬ QUÂN SỰ VIỆT NAM MIỄN PHÍ VÉ',
            date: '21/10/2024',
            location: 'Thái Bình',
            views: 188,
            likes: 92,
            dislikes: 17,
            author: 'Báo Thái Bình',
            authorAvatar: 'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg',
            images: [
                'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg',
                'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg',
                'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg',
                'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg'
            ]
        },
        {
            id: 2,
            title: 'Tour leo núi Fansipan 2N1Đ (Xuất phát từ Sa Pa)',
            date: '22/10/2024',
            location: 'Hà Nội',
            views: 212,
            likes: 134,
            dislikes: 11,
            author: 'Viettrekking',
            authorAvatar: 'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg',
            images: [
                'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg',
                'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg',
                'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg',
                'https://scontent.fsgn2-11.fna.fbcdn.net/v/t39.30808-6/476330707_122104752284750484_5215047765037178064_n.jpg'
            ]
        }
    ];

    const tabs = [
        { id: 'posted', label: 'Đã đăng' },
        { id: 'scheduled', label: 'Đã lên lịch' },
        { id: 'draft', label: 'Bản nháp' },
        { id: 'expiringSoon', label: 'Sắp hết hạn' },
        { id: 'expired', label: 'Đã hết hạn' }
    ];

    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 p-3">
                        {post.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt=""
                                className="w-full h-32 object-cover rounded"
                            />
                        ))}
                    </div>
                    <div className="p-4">
                        <div className="font-medium mb-2 line-clamp-2">{post.title}</div>
                        <div className="flex items-center mb-3">
                            <img
                                src={post.authorAvatar}
                                alt={post.author}
                                className="w-5 h-5 rounded-full mr-2"
                            />
                            <span className="text-sm text-gray-500">{post.author}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                            <div>Ngày đăng: {post.date}</div>
                            <div>Địa điểm: {post.location}</div>
                            <div>Lượt xem: {post.views}</div>
                            <div>Hữu ích: {post.likes}</div>
                            <div>Không hữu ích: {post.dislikes}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const ListView = () => (
        <table className="w-full mt-6">
            <thead>
                <tr className="text-left text-gray-500 border-b">
                    <th className="pb-4 w-8">
                        <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="pb-4 text-center">Tiêu đề</th>
                    <th className="pb-4 text-center">Ngày đăng</th>
                    <th className="pb-4 text-center">Địa điểm</th>
                    <th className="pb-4 text-center">Số người tiếp cận</th>
                    <th className="pb-4 text-center">Lượt Hữu ích</th>
                    <th className="pb-4 text-center">Lượt Không hữu ích</th>
                </tr>
            </thead>
            <tbody>
                {posts.map((post) => (
                    <tr key={post.id} className="border-b">
                        <td className="py-4">
                            <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="py-2">
                            <div className="flex items-center">
                                <div className="grid grid-cols-2 gap-1 w-20 mr-3">
                                    {post.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt=""
                                            className="w-full h-10 object-cover rounded"
                                        />
                                    ))}
                                </div>
                                <div className="max-w-[300px]">
                                    <div className="font-medium break-words whitespace-normal">
                                        {post.title}
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <img
                                            src={post.authorAvatar}
                                            alt={post.author}
                                            className="w-4 h-4 rounded-full mr-2"
                                        />
                                        <span className="text-xs text-gray-500 truncate">
                                            {post.author}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="py-4 text-center">{post.date}</td>
                        <td className="py-4 text-center">{post.location}</td>
                        <td className="py-4 text-center">{post.views}</td>
                        <td className="py-4 text-center">{post.likes}</td>
                        <td className="py-4 text-center">{post.dislikes}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="flex-1 bg-gray-50 p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Nội dung</h1>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-1 p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`px-4 py-2 rounded-lg ${selectedTab === tab.id
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    onClick={() => setSelectedTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div className="relative w-full md:w-96">
                                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo ID hoặc thẻ..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center space-x-4 flex-1 justify-end">
                                <select className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white min-w-[140px]">
                                    <option>Loại bài viết</option>
                                </select>

                                <button className="flex items-center px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
                                    <RiCalendarLine className="w-5 h-5 mr-2 text-gray-500" />
                                    <span>90 ngày qua: 2/9/2024 - 31/10/2024</span>
                                </button>

                                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                    <button 
                                        className={`flex items-center px-3 py-2.5 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <IoListOutline className="w-5 h-5 text-gray-500" />
                                    </button>
                                    <button 
                                        className={`flex items-center px-3 py-2.5 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <IoGridOutline className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {viewMode === 'grid' ? <GridView /> : <ListView />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Content;