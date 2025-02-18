DROP DATABASE IF EXISTS blindbox_db;
CREATE DATABASE blindbox_db;
USE blindbox_db;

CREATE TABLE voucher (
    voucher_id INT PRIMARY KEY,
    voucher_code VARCHAR(255) NOT NULL,
    `description` VARCHAR(255),
    discount_amount DOUBLE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    minimum_purchase DOUBLE,
    usage_limit DOUBLE NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE `user` (
    user_id INT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    wallet_balance DECIMAL(10, 2) DEFAULT 0,
    `role` ENUM('Admin', 'Staff', 'User'),
    date_of_birth DATE,
    `status` BOOLEAN NOT NULL DEFAULT 1,
    phone VARCHAR(10),
    image VARCHAR(255)
);

CREATE TABLE user_voucher (
    user_voucher_id INT PRIMARY KEY,
    redeemed_date DATE,
    `status` BOOLEAN NOT NULL DEFAULT 0,
    user_id INT NOT NULL,
    voucher_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id)
);

CREATE TABLE category (
    category_id INT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
);

CREATE TABLE package (
    package_id INT PRIMARY KEY,
    `name` VARCHAR(255),
    `description` VARCHAR(255),
    price DECIMAL(10, 2),
    manufacturer VARCHAR(255),
    themes TEXT,
    stock INT,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE blind_box (
    blind_box_id INT PRIMARY KEY,
    unique_code VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT 1,
    size DOUBLE NOT NULL,
    is_special BOOLEAN NOT NULL,
    package_id INT NOT NULL,
    FOREIGN KEY (package_id) REFERENCES package(package_id)
);

CREATE TABLE blind_box_image (
    blind_box_image_id INT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    blind_box_id INT NOT NULL,
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id)
);

CREATE TABLE feature (
    feature_id INT PRIMARY KEY,
    `description` VARCHAR(255) NOT NULL,
    `type` ENUM('Eye', 'Skin')
);

CREATE TABLE blind_box_feature (
	blind_box_feature_id INT PRIMARY KEY,
    blind_box_id INT NOT NULL,
    feature_id INT NOT NULL,
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id),
    FOREIGN KEY (feature_id) REFERENCES feature(feature_id)
);

CREATE TABLE `order` (
    order_id INT PRIMARY KEY,    
    order_date DATETIME,
    total_amount DECIMAL(10, 2),
    delivery_address VARCHAR(255),
    user_id INT NOT NULL,
    voucher_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id)
);

CREATE TABLE order_status (
    `status` ENUM('InCart', 'Pending', 'Shipped', 'Completed', 'Canceled'),
    update_time DATETIME NOT NULL,
    order_id INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES `order`(order_id)
);

CREATE TABLE order_detail (
    order_detail_id INT PRIMARY KEY,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    order_id INT NOT NULL,
    blind_box_id INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES `order`(order_id),
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id)
);

CREATE TABLE `transaction` (
    transaction_id INT PRIMARY KEY,
    `type` ENUM('Deposit', 'Deduction', 'BlindBoxOpen'),
    related_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `description` VARCHAR(255),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
);

CREATE TABLE feedback (
    feedback_id INT PRIMARY KEY,       
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
    vote_id INT PRIMARY KEY,
    feedback_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_date DATETIME NOT NULL,
    vote_type ENUM('Upvote', 'Downvote'),
    FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id),
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
);

CREATE TABLE inventory_item (
    inventory_item_id INT PRIMARY KEY,
    add_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    blind_box_id INT NOT NULL,    
    status ENUM('Available', 'Used', 'etc.'),
    FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    FOREIGN KEY (blind_box_id) REFERENCES blind_box(blind_box_id)
);