DROP DATABASE IF EXISTS blindbox_db;
CREATE DATABASE blindbox_db;
USE blindbox_db;

CREATE TABLE voucher (
    voucher_id INT AUTO_INCREMENT PRIMARY KEY,
    voucher_code VARCHAR(255) NOT NULL,
    `description` VARCHAR(255),
    discount_amount DECIMAL(10, 2) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    minimum_purchase DECIMAL(10, 2),
    usage_limit INT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE `user` (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    wallet_balance DECIMAL(10, 2) DEFAULT 0,
    `role` ENUM('Admin', 'Staff', 'User'),
    date_of_birth DATE,
    confirmed_email BOOLEAN NOT NULL DEFAULT 0,
    `status` BOOLEAN NOT NULL DEFAULT 1,
    phone VARCHAR(10),
    image VARCHAR(255)
);

CREATE TABLE user_voucher (
    user_voucher_id INT AUTO_INCREMENT PRIMARY KEY,
    redeemed_date DATETIME,
    `status` BOOLEAN NOT NULL DEFAULT 0,
    user_id INT NOT NULL,
    voucher_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id)
);

CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
);

CREATE TABLE package (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    pakage_code VARCHAR(255) NOT NULL,
    `name` VARCHAR(255),
    `description` VARCHAR(255),
    manufacturer VARCHAR(255),
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE package_image (
    package_image_id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    package_id INT NOT NULL,
    FOREIGN KEY (package_id) REFERENCES package(package_id)
);

CREATE TABLE blind_box (
    blind_box_id INT AUTO_INCREMENT PRIMARY KEY,
    color VARCHAR(255),
    `status` BOOLEAN NOT NULL DEFAULT 1,
    size DOUBLE,    
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(4, 2) NOT NULL DEFAULT 0,
    `number` INT NOT NULL,
    is_knowned BOOLEAN NOT NULL,
    is_special BOOLEAN NOT NULL,
    is_sold BOOLEAN NOT NULL DEFAULT 0,
    package_id INT NOT NULL,
    FOREIGN KEY (package_id) REFERENCES package(package_id)
);

CREATE TABLE blind_box_image (
    blind_box_image_id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    blind_box_id INT NOT NULL,
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id)
);

CREATE TABLE feature (
    feature_id INT AUTO_INCREMENT PRIMARY KEY,
    `description` VARCHAR(255) NOT NULL,
    `type` ENUM('Eye', 'Skin')
);

CREATE TABLE blind_box_feature (
	blind_box_feature_id INT AUTO_INCREMENT PRIMARY KEY,
    blind_box_id INT NOT NULL,
    feature_id INT NOT NULL,
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id),
    FOREIGN KEY (feature_id) REFERENCES feature(feature_id)
);

CREATE TABLE `order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,    
    order_date DATETIME NOT NULL, 
    total_amount DECIMAL(10, 2) NOT NULL,
    phone VARCHAR(10) NOT NULL, 
    address VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    voucher_id INT,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id)
);

CREATE TABLE order_status (
	order_status_id INT AUTO_INCREMENT PRIMARY KEY,
    `status` ENUM('Pending', 'Paid', 'Shipping', 'Completed', 'Canceled'),
    update_time DATETIME NOT NULL,
    order_id INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES `order`(order_id)
);

CREATE TABLE order_detail (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_price DECIMAL(10, 2) NOT NULL,
    order_id INT NOT NULL,
    blind_box_id INT,
    package_id INT,
    FOREIGN KEY (order_id) REFERENCES `order`(order_id),
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id),
    FOREIGN KEY (package_id) REFERENCES package(package_id)
);

CREATE TABLE `transaction` (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('Deposit', 'Deduction', 'BlindBoxOpen'),
    related_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `description` VARCHAR(255),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
);

CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,       
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(255),
    create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` BOOLEAN NOT NULL DEFAULT 1,
    user_id INT NOT NULL,
    blind_box_id INT NOT NULL, 
    FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id)
);

CREATE TABLE feedback_vote (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_date DATETIME NOT NULL,
    vote_type ENUM('Upvote', 'Downvote'),
    FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id),
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
);

CREATE TABLE inventory_item (
    inventory_item_id INT AUTO_INCREMENT PRIMARY KEY,
    add_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    blind_box_id INT NOT NULL,    
    status ENUM('Available', 'Used', 'etc'),
    FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id)
);

INSERT INTO `user` (`name`, email, `password`, wallet_balance, `role`, date_of_birth, confirmed_email, `status`, phone, image)
VALUES 
('string', 'tanlmse170587@fpt.edu.vn', '$2a$11$A46icdJigFN1XwpE2VFfs.bvFKBtF7go.zey13OZbEJ6yzu3JppHm', 0.00, 'User', '2024-01-01', 0, 1, 'string', NULL);

INSERT INTO voucher (voucher_code, `description`, discount_amount, start_date, end_date, minimum_purchase, usage_limit, `status`) VALUES
('SUMMER2025', 'Discount for summer season', 20000.00, '2025-01-01 00:00:00', '2025-06-30 23:59:59', 100000.00, 100, 1),
('BLACKFRIDAY25', 'Black Friday Special Discount', 25000.00, '2025-11-24 00:00:00', '2025-11-25 23:59:59', 50000.00, 100, 1),
('XMAS2025', 'Christmas Discount', 15000.00, '2025-12-20 00:00:00', '2025-12-25 23:59:59', 75000.00, 100, 1),
('NEWYEAR2025', 'New Year Celebration Discount', 30000.00, '2025-01-01 00:00:00', '2025-01-05 23:59:59', 120000.00, 100, 1),
('CLEARANCE10', 'Discount on clearance items', 10000.00, '2025-03-01 00:00:00', '2025-03-15 23:59:59', NULL, 100, 1);

INSERT INTO user_voucher (user_id, voucher_id) VALUES 
(1, 1), 
(1, 2),
(1, 3),
(1, 4),
(1, 5);

INSERT INTO category (name) VALUES
('Toys'),
('Collectibles'),
('Accessories');

INSERT INTO package (pakage_code, name, description, manufacturer, category_id) VALUES
('haha', 'Super Hero Series', 'Blind box containing superhero-themed items.', 'HeroCraft Co.', 1),
('hihi', 'Mystic Creatures', 'Mystical creatures from legends and folklore.', 'Fantasy Creations', 2),
('hoho', 'Gadget Mystery', 'Blind box with tech and gadget accessories.', 'TechWorld', 3),

('PKG001', 'Luxury Package', 'A luxurious collection of blind boxes', 'Premium Toys Co.', 1),
('PKG001', 'Luxury Package', 'A luxurious collection of blind boxes', 'Premium Toys Co.', 1);

INSERT INTO blind_box (color, status, size, price, discount, number, is_knowned, is_special, package_id) VALUES
('Red', 1, 12.5, 19.99, 10, 1, 0, 0, 1),
('Blue', 1, 10.0, 15.99, 5, 1, 0, 1, 1),
('Green', 1, 8.0, 12.49, 0.00, 1, 1, 0, 2),
('Yellow', 1, 11.0, 20.99, 20, 1, 0, 1, 2),
('Black', 1, 9.5, 18.50, 15, 1, 1, 0, 3),
('White', 1, 7.5, 10.99, 5, 1, 0, 0, 3),

('Red', 1, 12.5, 19.99, 10, 1, 0, 0, 4),
('Red', 1, 12.5, 19.99, 10, 2, 0, 0, 4),
('Red', 1, 12.5, 19.99, 10, 3, 0, 0, 4),
('Red', 1, 12.5, 19.99, 10, 4, 0, 0, 4),
('Red', 1, 12.5, 19.99, 10, 5, 0, 0, 4),
('Red', 1, 12.5, 19.99, 10, 6, 0, 0, 4),
('Red', 1, 12.5, 19.99, 10, 7, 0, 0, 4),
('Red', 1, 12.5, 19.99, 10, 8, 0, 0, 4),

('Red', 1, 12.5, 19.99, 10, 1, 0, 0, 5),
('Red', 1, 12.5, 19.99, 10, 2, 0, 0, 5),
('Red', 1, 12.5, 19.99, 10, 3, 0, 0, 5),
('Red', 1, 12.5, 19.99, 10, 4, 0, 0, 5),
('Red', 1, 12.5, 19.99, 10, 5, 0, 0, 5),
('Red', 1, 12.5, 19.99, 10, 6, 0, 0, 5),
('Red', 1, 12.5, 19.99, 10, 7, 0, 0, 5),
('Red', 1, 12.5, 19.99, 10, 8, 0, 0, 5);

INSERT INTO `order` (order_date, total_amount, phone, address, user_id, voucher_id) 
VALUES 
('2020-05-15 05:30:40', 593.63, '0978640397', 'Address 1', 1, NULL),
('2020-12-10 08:58:48', 245.31, '0930151231', 'Address 2', 1, NULL),
('2021-03-28 21:39:26', 905.48, '0972320831', 'Address 3', 1, NULL),
('2021-05-24 00:42:23', 325.83, '0969122117', 'Address 4', 1, NULL),
('2021-10-10 13:48:04', 579.61, '0913665535', 'Address 5', 1, NULL),
('2021-11-26 01:55:12', 607.74, '0991673805', 'Address 6', 1, NULL),
('2022-02-03 03:04:41', 524.44, '0923069612', 'Address 7', 1, NULL),
('2022-06-20 20:43:16', 356.23, '0904372202', 'Address 8', 1, NULL),
('2022-10-05 17:51:29', 930.73, '0971354511', 'Address 9', 1, NULL),
('2023-01-15 05:31:46', 367.47, '0946364024', 'Address 10', 1, NULL),
('2023-04-14 11:34:57', 946.85, '0936829228', 'Address 11', 1, NULL),
('2023-05-18 12:12:28', 858.78, '0913797327', 'Address 12', 1, NULL),
('2023-07-22 01:20:10', 746.47, '0901714561', 'Address 13', 1, NULL),
('2023-11-10 16:10:13', 381.35, '0956201168', 'Address 14', 1, NULL),
('2024-01-20 08:57:22', 992.83, '0949306374', 'Address 15', 1, NULL),
('2024-02-14 14:09:19', 582.22, '0990216793', 'Address 16', 1, NULL),
('2024-05-04 07:16:31', 221.91, '0922587220', 'Address 17', 1, NULL),
('2024-07-30 13:25:08', 606.91, '0939368833', 'Address 18', 1, NULL),
('2024-11-10 10:33:15', 126.77, '0924977472', 'Address 19', 1, NULL),
('2025-01-18 02:14:51', 206.33, '0903466962', 'Address 20', 1, NULL);

INSERT INTO order_status (`status`, update_time, order_id) 
VALUES 
('Pending', '2020-05-15 05:30:40', 1),
('Paid', '2020-06-10 07:00:40', 1),
('Completed', '2020-07-15 09:30:40', 1),
('Pending', '2020-12-10 08:58:48', 2),
('Canceled', '2020-12-20 08:58:48', 2),
('Pending', '2021-03-28 21:39:26', 3),
('Shipping', '2021-04-15 11:45:26', 3),
('Completed', '2021-05-01 12:00:00', 3),
('Pending', '2021-05-24 00:42:23', 4),
('Completed', '2021-06-01 10:00:00', 4),
('Pending', '2021-10-10 13:48:04', 5),
('Paid', '2021-10-15 16:00:00', 5),
('Pending', '2021-11-26 01:55:12', 6),
('Completed', '2021-12-01 10:30:00', 6),
('Pending', '2022-02-03 03:04:41', 7),
('Paid', '2022-02-15 15:00:00', 7),
('Pending', '2022-06-20 20:43:16', 8),
('Paid', '2022-07-01 09:00:00', 8),
('Pending', '2022-10-05 17:51:29', 9),
('Completed', '2022-11-01 14:00:00', 9),
('Pending', '2023-01-15 05:31:46', 10),
('Paid', '2023-02-01 11:00:00', 10),
('Pending', '2023-04-14 11:34:57', 11),
('Paid', '2023-05-01 10:30:00', 11),
('Pending', '2023-05-18 12:12:28', 12),
('Paid', '2023-06-01 12:00:00', 12),
('Pending', '2023-07-22 01:20:10', 13),
('Completed', '2023-08-01 10:30:00', 13),
('Pending', '2023-11-10 16:10:13', 14),
('Completed', '2023-12-01 09:00:00', 14),
('Pending', '2024-01-20 08:57:22', 15),
('Paid', '2024-02-10 10:00:00', 15),
('Pending', '2024-02-14 14:09:19', 16),
('Paid', '2024-03-01 12:00:00', 16),
('Pending', '2024-05-04 07:16:31', 17),
('Completed', '2024-05-20 14:00:00', 17),
('Pending', '2024-07-30 13:25:08', 18),
('Completed', '2024-08-15 10:30:00', 18),
('Pending', '2024-11-10 10:33:15', 19),
('Paid', '2024-12-01 09:00:00', 19),
('Pending', '2025-01-18 02:14:51', 20),
('Completed', '2025-01-30 14:30:00', 20);


