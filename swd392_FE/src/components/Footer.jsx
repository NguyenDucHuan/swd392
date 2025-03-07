import React from 'react';

import logo from '../assets/Footer.jpg'


const Footer = () => {
    return (
        <footer className="bg-pink-300 text-white py-10">
            <div className="container mx-auto grid grid-cols-5 gap-8">
                {/* Contact Info */}
                <div>

                    <h3 className="font-bold text-lg">Hotline</h3>
                    <p>📲097.347.5702</p>
                    <h3 className="font-bold text-lg mt-4">Email</h3>
                    <p>👝khoavdse170395@fpt.edu.vn</p>
                    <p className="mt-4">CHÍNH SÁCH BÁN HÀNG</p>
                    <p>HƯỚNG DẪN MUA HÀNG</p>
                </div>

                {/* Hanoi Locations */}
                <div>
                    <h3 className="font-bold text-lg">Chính sách</h3>
                    <ul className="mt-2">
                        <li>Chính sách bảo mật</li>
                        <li>Chính sách vận chuyển</li>
                        <li>Chính sách đổi trả</li>
                        <li>Quy định sử dụng</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-lg">Danh mục nổi bật</h3>
                    <ul className="mt-2">
                        <li>SALE UP TO 50%

                        </li>
                        <li>ALL PRODUCTS
                        </li>
                        <li>BLINDBOX SERIES
                        </li>
                        <li>ART TOYS , FIGURE LIMITED EDITION
                            DISPLAY BOX</li>
                    </ul>
                </div>

                {/* HCM Locations */}
                <div>
                    <h3 className="font-bold text-lg">TP. HỒ CHÍ MINH (9h30 - 22h)</h3>
                    <ul className="mt-2">
                        <li>Nhà Văn Hoá Sinh Viên Thành Phố Thủ Đức</li>
                    </ul>
                </div>

                <div className="font-bold text-lg">
                    <img src={logo} alt="Footer Image" className="mx-auto" />
                </div>
            </div>

            {/* Social & Copyright */}
            <div className="container mx-auto text-center mt-8">
                <p className="text-sm">Copyright © 2024. All Rights Reserved</p>
            </div>

            {/* Add Image Below Footer */}



        </footer>
    );
};

export default Footer;
