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
    `type` ENUM('Wallet', 'Deposit', 'Deduction', 'BlindBoxOpen'),
    related_id INT,
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



