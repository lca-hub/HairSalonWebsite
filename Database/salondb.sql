CREATE DATABASE IF NOT EXISTS salondb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE salondb;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

	first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    phone_number VARCHAR(20) UNIQUE,

    avatar VARCHAR(500),

    role VARCHAR(30) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL UNIQUE,

    dob DATE,

    gender VARCHAR(20),

    total_visits INT DEFAULT 0,

    total_spent DECIMAL(12,2) DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE stylist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL UNIQUE,

    specialization VARCHAR(255),

    experience_years INT DEFAULT 0,

    bio TEXT,

    average_rating DECIMAL(3,2) DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE stylist_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    stylist_id BIGINT NOT NULL,

    work_date DATE NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    is_off BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (stylist_id) REFERENCES stylist(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    stylist_id BIGINT NOT NULL,

    schedule_id BIGINT NOT NULL,

    check_in_time DATETIME,

    check_out_time DATETIME,

    total_hours DECIMAL(5,2),

    attendance_status VARCHAR(30),

    FOREIGN KEY (stylist_id) REFERENCES stylist(id),

    FOREIGN KEY (schedule_id) REFERENCES stylist_schedule(id)
);

CREATE TABLE category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    name VARCHAR(255) NOT NULL UNIQUE,
    
    description TEXT,
    
    type VARCHAR(20) NOT NULL
);

CREATE TABLE service (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    service_code VARCHAR(30) UNIQUE,
    
    category_id BIGINT NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    
    description TEXT,
    
    price DECIMAL(12,2) NOT NULL,
    
    duration_minutes INT NOT NULL,
    
    image_url VARCHAR(500),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE supplier (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    email VARCHAR(255),

    address VARCHAR(255)
);

CREATE TABLE product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    product_code VARCHAR(30) UNIQUE,
    
    supplier_id BIGINT,
    
    name VARCHAR(255) NOT NULL,
    
    price DECIMAL(12,2) NOT NULL,
    
    category_id BIGINT,
    
    stock_quantity INT DEFAULT 0,
    
    min_stock_alert INT DEFAULT 5,
    
    image_url VARCHAR(500),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE SET NULL,
    
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
);

CREATE TABLE purchase_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    supplier_id BIGINT NOT NULL,

    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    total_amount DECIMAL(12,2) DEFAULT 0,

    note VARCHAR(500),

    is_received BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

CREATE TABLE purchase_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    purchase_order_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    quantity INT NOT NULL,

    import_price DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id) ON DELETE CASCADE,

    FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE appointment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    appointment_code VARCHAR(30) UNIQUE,

    customer_id BIGINT NOT NULL,

    stylist_id BIGINT NOT NULL,

    service_id BIGINT NOT NULL,

    appointment_date DATE NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    booking_amount DECIMAL(12,2) NOT NULL,

    status VARCHAR(50) NOT NULL,
    
    refund_amount DECIMAL(12,2) DEFAULT 0,

    customer_note TEXT,

    stylist_note TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    payment_deadline DATETIME NULL,

    FOREIGN KEY (customer_id) REFERENCES customer(id),

    FOREIGN KEY (stylist_id) REFERENCES stylist(id),

    FOREIGN KEY (service_id) REFERENCES service(id),

    UNIQUE KEY uq_stylist_slot (stylist_id, appointment_date, start_time)
);

CREATE TABLE review (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    appointment_id BIGINT NOT NULL UNIQUE,

    rating INT NOT NULL,

    comment TEXT,

    FOREIGN KEY (appointment_id) REFERENCES appointment(id),

    CHECK ( rating >= 1 AND rating <= 5)
);

CREATE TABLE invoice (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    invoice_code VARCHAR(30) UNIQUE,

    appointment_id BIGINT NOT NULL UNIQUE,

    customer_id BIGINT NOT NULL,

    sub_total DECIMAL(12,2) NOT NULL,

    discount_amount DECIMAL(12,2) DEFAULT 0,

    total_amount DECIMAL(12,2) NOT NULL,
    
    refund_amount DECIMAL(12,2) DEFAULT 0,
    
    refund_time DATETIME NULL,

    payment_method VARCHAR(30) NOT NULL,

    payment_status VARCHAR(30) NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id) REFERENCES appointment(id),

    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE invoice_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    invoice_id BIGINT NOT NULL,

    service_id BIGINT,

    product_id BIGINT,

    quantity INT DEFAULT 1,

    unit_price DECIMAL(12,2) NOT NULL,

    total_price DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE,

    FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE SET NULL,

    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL
);

CREATE TABLE payment_transaction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    invoice_id BIGINT NOT NULL,

    transaction_no VARCHAR(100),

    amount DECIMAL(12,2) NOT NULL,

    payment_method VARCHAR(30) NOT NULL,

    payment_status VARCHAR(30) NOT NULL,

    transaction_time DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE
);

CREATE TABLE notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    customer_id BIGINT NOT NULL UNIQUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE

);


CREATE TABLE cart_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    cart_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_cart_item_quantity CHECK (quantity > 0),

    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,

    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE RESTRICT,

    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

CREATE TABLE product_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    order_code VARCHAR(50) NOT NULL UNIQUE,

    customer_id BIGINT NOT NULL,

    sub_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    payment_method VARCHAR(30) NOT NULL,

    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    order_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    receiver_name VARCHAR(255) NOT NULL,

    receiver_phone VARCHAR(20) NOT NULL,

    shipping_address VARCHAR(500) NOT NULL,

    note VARCHAR(500) NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_order_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT
);

CREATE TABLE product_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    order_id BIGINT NOT NULL,

    product_id BIGINT NULL,

    quantity INT NOT NULL,

    unit_price DECIMAL(12,2) NOT NULL,

    total_price DECIMAL(12,2) NOT NULL,

    product_name VARCHAR(255) NOT NULL,

    CONSTRAINT chk_order_item_quantity CHECK (quantity > 0),

    CONSTRAINT chk_order_item_price CHECK (unit_price >= 0),

    CONSTRAINT chk_order_item_total_price CHECK (total_price >= 0),

    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES product_order(id) ON DELETE CASCADE,

    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id)REFERENCES product(id) ON DELETE SET NULL
);

CREATE TABLE appointment_slot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    appointment_id BIGINT NOT NULL,
    stylist_id BIGINT NOT NULL,

    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,

    CONSTRAINT fk_appointment_slot_appointment FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE CASCADE,

    CONSTRAINT fk_appointment_slot_stylist FOREIGN KEY (stylist_id) REFERENCES stylist(id) ON DELETE CASCADE,

    CONSTRAINT uq_stylist_slot UNIQUE (stylist_id,slot_date, slot_time)
);