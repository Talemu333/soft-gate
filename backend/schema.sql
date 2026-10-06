CREATE DATABASE IF NOT EXISTS softgate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE softgate;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(14,2) NOT NULL,
  old_price DECIMAL(14,2) NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  reviews INT UNSIGNED NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  badge VARCHAR(60) NULL,
  image TEXT NULL,
  description TEXT NULL,
  specs JSON NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_products_category (category),
  INDEX idx_products_active (active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(190) NOT NULL,
  customer_phone VARCHAR(40) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  subtotal DECIMAL(14,2) NOT NULL,
  delivery DECIMAL(14,2) NOT NULL DEFAULT 0,
  total DECIMAL(14,2) NOT NULL,
  payment_method ENUM('transfer','card') NOT NULL DEFAULT 'transfer',
  payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  status ENUM('Processing','Confirmed','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Processing',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_email (customer_email),
  INDEX idx_orders_status (status),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(180) NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  image TEXT NULL,
  PRIMARY KEY (id),
  INDEX idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;
