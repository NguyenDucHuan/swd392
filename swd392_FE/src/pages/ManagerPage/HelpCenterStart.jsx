import React, { useState } from 'react';

function HelpCenterStart() {
    const [selectedRating, setSelectedRating] = useState(null);

    const ratings = [
        'Rất hài lòng',
        'Hơi hài lòng',
        'Bình thường',
        'Hơi không hài lòng',
        'Rất không hài lòng'
    ];

    return (
        <div className="flex-1 bg-gray-50 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Trung tâm Trợ giúp</h1>

            <div className="bg-white rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-medium">Vấn đề gần đây về Tài khoản</h2>
                    <div className="flex items-center">

                    </div>
                </div>
                <div className="text-sm text-gray-500 mb-4">2/10/2024 - 31/10/2024</div>

                <div className="flex items-center mb-8">
                    <div className="flex space-x-4">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                            Chưa giải quyết
                        </button>
                        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                            Đã giải quyết
                        </button>
                    </div>
                    
                    <button className="flex items-center text-blue-500 ml-auto">
                        <span className="flex items-center border rounded-lg px-4 py-2">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            30 ngày qua
                            <svg className="w-4 h-4 ml-2 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
</svg>
                        </span>
                    </button>
                </div>
                <hr></hr>
                <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">Không có vấn đề gì về Tài khoản</h3>
                    <p className="text-gray-500">Bạn không có vấn đề gì về tài khoản trong 30 ngày qua.</p>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-medium mb-6">
                    Bạn hài lòng hoặc không hài lòng đến mức nào với sự trợ giúp dành cho vấn đề của bạn?
                </h3>
                <div className="space-y-4">
                    {ratings.map((rating, index) => (
                        <label key={index} className="flex items-center">
                            <input
                                type="radio"
                                name="rating"
                                value={rating}
                                checked={selectedRating === rating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                className="w-5 h-5 text-blue-500 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3">{rating}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HelpCenterStart;