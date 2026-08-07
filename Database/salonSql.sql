CREATE DATABASE IF NOT EXISTS hair_salon_db;

USE hair_salon_db;

CREATE TABLE role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO role (name) VALUES ('ADMIN'), ('RECEPTIONIST'), ('STYLIST'), ('CUSTOMER');

CREATE TABLE gender (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO gender (name) VALUES ('MALE'), ('FEMALE'), ('OTHER');

CREATE TABLE appointment_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO appointment_status (name) VALUES ('PENDING'), ('CONFIRMED'), ('IN_SERVICE'), ('COMPLETED'), ('CANCELLED');

CREATE TABLE payment_method (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO payment_method (name) VALUES ('CASH'), ('MOMO'), ('VNPAY'), ('ZALOPAY');

CREATE TABLE payment_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO payment_status (name) VALUES ('PENDING'), ('PAID'), ('FAILED'), ('REFUNDED');

CREATE TABLE base_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    avatar VARCHAR(255) NULL,
    role_id INT NOT NULL DEFAULT 4, 
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES role(id)
);

CREATE TABLE customer_profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    dob DATE NULL,
    gender_id INT NULL,
    total_visits INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,

    FOREIGN KEY (gender_id) REFERENCES gender(id),
    FOREIGN KEY (user_id) REFERENCES base_user(id) ON DELETE CASCADE
);

CREATE TABLE stylist_profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    specialization VARCHAR(255) NULL, 
    experience_years INT DEFAULT 0,
    bio TEXT NULL,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,

    FOREIGN KEY (user_id) REFERENCES base_user(id) ON DELETE CASCADE
);

CREATE TABLE stylist_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stylist_id INT NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_off BOOLEAN DEFAULT FALSE,
    is_checked_in BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (stylist_id) REFERENCES stylist_profile(id) ON DELETE CASCADE,
    UNIQUE KEY uq_stylist_date (stylist_id, work_date)
);

CREATE TABLE category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL
);

INSERT INTO category (name) VALUES ('Cắt tóc nam'), ('Cắt tóc nữ'), ('Gội đầu'), ('Uốn tóc'), ('Duỗi tóc'), ('Nhuộm tóc'), ('Phục hồi tóc'), ('Combo làm tóc');

CREATE TABLE service (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30, 
    image_url VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE supplier (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    address VARCHAR(255) NULL
);

CREATE TABLE product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 5, -- Mức cảnh báo sắp hết hàng
    image_url VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE SET NULL
);

CREATE TABLE purchase_order (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    note VARCHAR(255) NULL,

    FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

CREATE TABLE purchase_order_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    import_price DECIMAL(10, 2) NOT NULL,

    FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE appointment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    stylist_id INT NOT NULL,
    service_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status_id INT NOT NULL DEFAULT 1,
    customer_note TEXT NULL,
    stylist_note TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customer_profile(id) ON DELETE RESTRICT,
    FOREIGN KEY (stylist_id) REFERENCES stylist_profile(id) ON DELETE RESTRICT,
    FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES appointment_status(id)
);

CREATE TABLE review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL UNIQUE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE RESTRICT
);

CREATE TABLE invoice (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NULL UNIQUE, 
    customer_id INT NOT NULL,
    sub_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status_id INT NOT NULL DEFAULT 1, -- PENDING
    payment_method_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customer_profile(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_status_id) REFERENCES payment_status(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_method(id)
);

CREATE TABLE invoice_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    service_id INT NULL,
    product_id INT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,

    FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL
);

CREATE TABLE payment_transaction (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    transaction_no VARCHAR(100) NULL, 
    amount DECIMAL(12, 2) NOT NULL,
    payment_method_id INT NOT NULL,
    payment_status_id INT NOT NULL,
    transaction_time DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_method(id),
    FOREIGN KEY (payment_status_id) REFERENCES payment_status(id)
);