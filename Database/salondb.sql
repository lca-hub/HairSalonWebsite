-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: salondb
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_code` varchar(30) DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  `stylist_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `booking_amount` decimal(12,2) NOT NULL,
  `status` varchar(50) NOT NULL,
  `refund_amount` decimal(12,2) DEFAULT '0.00',
  `customer_note` text,
  `stylist_note` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `payment_deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_code` (`appointment_code`),
  KEY `customer_id` (`customer_id`),
  KEY `service_id` (`service_id`),
  KEY `idx_appointment_stylist_date_time` (`stylist_id`,`appointment_date`,`start_time`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`),
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`stylist_id`) REFERENCES `stylist` (`id`),
  CONSTRAINT `appointment_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,'APT001',1,1,1,'2026-09-03','10:00:00','10:45:00',180000.00,'CONFIRMED',0.00,'Cắt ngắn hơn một chút.',NULL,'2026-09-01 09:00:00','2026-09-03 09:00:00'),(2,'APT002',2,2,20,'2026-09-04','14:00:00','16:00:00',800000.00,'COMPLETED',0.00,'Tóc hơi khô sau khi nhuộm.','Đã phục hồi theo liệu trình Keratin.','2026-08-29 13:30:00','2026-09-04 13:00:00'),(3,'APT003',1,2,15,'2026-09-05','10:00:00','12:30:00',950000.00,'CONFIRMED',0.00,'Muốn highlight màu sáng tự nhiên.',NULL,'2026-09-01 11:30:00','2026-09-05 09:00:00'),(4,'APT004',2,1,9,'2026-09-05','14:00:00','16:00:00',650000.00,'CANCELLED',650000.00,'Không thể đến lịch đã đặt.',NULL,'2026-09-01 14:00:00','2026-09-05 13:00:00'),(5,'APT005',1,1,3,'2026-09-06','09:30:00','10:30:00',220000.00,'CANCELLED',0.00,'Muốn layer nhẹ.',NULL,'2026-09-02 08:00:00','2026-09-06 08:30:00'),(6,'APT006',2,2,14,'2026-09-06','13:00:00','16:00:00',1200000.00,'CONFIRMED',0.00,'Màu balayage tự nhiên.',NULL,'2026-09-02 09:00:00','2026-09-06 11:00:00'),(7,'APT007',1,1,6,'2026-09-07','15:00:00','15:30:00',120000.00,'COMPLETED',0.00,'Gội và sấy nhẹ.','Khách hài lòng với kiểu sấy.','2026-09-01 16:00:00','2026-09-07 14:00:00'),(8,'APM-432883C0',1,3,20,'2026-09-16','09:00:00','11:00:00',800000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 00:35:08','2026-09-15 07:45:09'),(9,'APM-6D7965D8',1,3,11,'2026-09-17','09:00:00','11:40:00',900000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 00:38:00','2026-09-15 07:48:01'),(10,'APM-9B98DF29',1,2,9,'2026-09-16','09:00:00','11:00:00',650000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 00:44:34','2026-09-15 07:54:34'),(11,'APM-7C74E335',1,3,7,'2026-09-16','11:00:00','11:45:00',180000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 00:55:23','2026-09-15 08:05:23'),(12,'APM-230986D7',1,3,7,'2026-09-16','12:00:00','12:45:00',180000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 01:01:51','2026-09-15 08:11:51'),(21,'APM-FE047199',1,2,16,'2026-09-16','11:00:00','13:50:00',1100000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 01:03:40','2026-09-15 08:13:40'),(24,'APM-8859417D',1,3,8,'2026-09-16','12:30:00','12:55:00',100000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 01:09:31','2026-09-15 08:19:31'),(26,'APM-6F9EC0D7',1,3,6,'2026-09-17','10:00:00','10:30:00',120000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 15:14:38','2026-09-15 22:24:38'),(27,'APM-DD3029BC',1,2,8,'2026-09-17','09:00:00','09:25:00',100000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 15:16:45','2026-09-15 22:26:45'),(28,'APM-47604900',1,3,17,'2026-09-20','09:00:00','10:00:00',350000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 15:21:45','2026-09-15 22:31:45'),(29,'APM-C61F9261',1,3,18,'2026-09-19','09:00:00','09:50:00',300000.00,'CONFIRMED',0.00,NULL,NULL,'2026-09-15 15:25:31',NULL),(30,'APM-2B9DA6B6',1,3,12,'2026-09-20','10:00:00','12:00:00',700000.00,'CONFIRMED',0.00,NULL,NULL,'2026-09-15 15:35:11',NULL),(31,'APM-C20D9A39',1,3,7,'2026-09-20','12:00:00','12:45:00',180000.00,'CONFIRMED',0.00,NULL,NULL,'2026-09-15 15:45:19',NULL),(32,'APM-6FB967DC',1,3,8,'2026-09-20','13:00:00','13:25:00',100000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-15 16:11:16','2026-09-15 23:21:17'),(34,'APM-F05D6667',1,3,12,'2026-09-16','13:00:00','15:00:00',700000.00,'CONFIRMED',0.00,NULL,NULL,'2026-09-16 01:04:11',NULL),(36,'APM-0E3FD755',1,3,23,'2026-09-16','10:30:00','12:00:00',1000000.00,'CONFIRMED',0.00,NULL,NULL,'2026-09-16 03:07:24',NULL),(38,'APM-28E69374',1,3,22,'2026-09-16','15:00:00','16:30:00',750000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-16 03:14:38','2026-09-16 03:24:38'),(39,'APM-1506DF91',1,3,12,'2026-09-17','10:30:00','12:30:00',700000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-16 03:15:28','2026-09-16 03:25:28'),(41,'APM-A67B18E6',1,3,23,'2026-09-16','16:30:00','18:00:00',1000000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-16 04:17:39','2026-09-16 04:27:39'),(42,'APM-7F50B701',1,3,23,'2026-09-16','16:30:00','18:00:00',1000000.00,'CANCELLED',0.00,NULL,NULL,'2026-09-16 04:19:41','2026-09-16 04:29:41');
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_slot`
--

DROP TABLE IF EXISTS `appointment_slot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_slot` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint NOT NULL,
  `stylist_id` bigint NOT NULL,
  `slot_date` date NOT NULL,
  `slot_time` time NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stylist_slot` (`stylist_id`,`slot_date`,`slot_time`),
  KEY `fk_appointment_slot_appointment` (`appointment_id`),
  CONSTRAINT `fk_appointment_slot_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_slot_stylist` FOREIGN KEY (`stylist_id`) REFERENCES `stylist` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_slot`
--

LOCK TABLES `appointment_slot` WRITE;
/*!40000 ALTER TABLE `appointment_slot` DISABLE KEYS */;
INSERT INTO `appointment_slot` VALUES (1,1,1,'2026-09-03','10:00:00'),(2,2,2,'2026-09-04','14:00:00'),(3,3,2,'2026-09-05','10:00:00'),(4,4,1,'2026-09-05','14:00:00'),(6,6,2,'2026-09-06','13:00:00'),(7,7,1,'2026-09-07','15:00:00'),(37,29,3,'2026-09-19','09:00:00'),(38,29,3,'2026-09-19','09:30:00'),(39,30,3,'2026-09-20','10:00:00'),(40,30,3,'2026-09-20','10:30:00'),(41,30,3,'2026-09-20','11:00:00'),(42,30,3,'2026-09-20','11:30:00'),(43,31,3,'2026-09-20','12:00:00'),(44,31,3,'2026-09-20','12:30:00'),(46,34,3,'2026-09-16','13:00:00'),(47,34,3,'2026-09-16','13:30:00'),(48,34,3,'2026-09-16','14:00:00'),(49,34,3,'2026-09-16','14:30:00'),(50,36,3,'2026-09-16','10:30:00'),(51,36,3,'2026-09-16','11:00:00'),(52,36,3,'2026-09-16','11:30:00');
/*!40000 ALTER TABLE `appointment_slot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `stylist_id` bigint NOT NULL,
  `schedule_id` bigint NOT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `total_hours` decimal(5,2) DEFAULT NULL,
  `attendance_status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stylist_id` (`stylist_id`),
  KEY `schedule_id` (`schedule_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`stylist_id`) REFERENCES `stylist` (`id`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `stylist_schedule` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,1,'2026-09-03 08:55:00','2026-09-03 17:05:00',8.17,'COMPLETED'),(2,2,3,'2026-09-03 09:58:00',NULL,NULL,'PRESENT'),(3,1,2,'2026-09-04 09:04:00','2026-09-04 17:01:00',7.95,'COMPLETED'),(4,2,4,'2026-09-04 10:12:00','2026-09-04 18:03:00',7.85,'COMPLETED'),(5,1,5,NULL,NULL,NULL,'ABSENT'),(6,2,6,'2026-09-05 10:01:00',NULL,NULL,'PRESENT');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_id` (`customer_id`),
  CONSTRAINT `fk_cart_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,1,'2026-09-01 10:00:00','2026-09-01 10:00:00'),(2,2,'2026-09-01 10:05:00','2026-09-01 10:05:00');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `added_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_product` (`cart_id`,`product_id`),
  KEY `fk_cart_item_product` (`product_id`),
  CONSTRAINT `fk_cart_item_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_cart_item_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (1,1,1,2,'2026-09-01 10:01:00'),(2,1,19,1,'2026-09-01 10:02:00'),(3,1,27,2,'2026-09-01 10:03:00'),(4,2,12,1,'2026-09-01 10:06:00'),(5,2,25,2,'2026-09-01 10:07:00');
/*!40000 ALTER TABLE `cart_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Cắt & Tạo kiểu','Các dịch vụ cắt tóc, gội đầu và tạo kiểu.','SERVICE'),(2,'Nhuộm tóc','Các dịch vụ nhuộm, phủ bạc, highlight, balayage và ombre.','SERVICE'),(3,'Chăm sóc tóc','Các dịch vụ hấp dầu, dưỡng tóc và chăm sóc da đầu.','SERVICE'),(4,'Phục hồi tóc','Các dịch vụ phục hồi tóc khô xơ, tóc tẩy và tóc hư tổn.','SERVICE'),(5,'Sản phẩm chăm sóc tóc','Dầu gội, dầu xả, mặt nạ tóc, dầu dưỡng và sản phẩm tạo kiểu.','PRODUCT'),(6,'Duỗi tóc',NULL,'SERVICE'),(7,'Dầu dưỡng tóc','Làm bóng tóc, mượt tóc','PRODUCT');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `total_visits` int DEFAULT '0',
  `total_spent` decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,2,'2003-05-15','FEMALE',5,1850000.00),(2,3,'2002-11-20','MALE',3,980000.00),(3,6,NULL,NULL,0,0.00),(4,7,NULL,NULL,0,0.00);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_code` varchar(30) DEFAULT NULL,
  `appointment_id` bigint DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  `sub_total` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL,
  `refund_amount` decimal(12,2) DEFAULT '0.00',
  `refund_time` datetime DEFAULT NULL,
  `payment_method` varchar(30) NOT NULL,
  `payment_status` varchar(30) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `product_order_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_id` (`appointment_id`),
  UNIQUE KEY `invoice_code` (`invoice_code`),
  KEY `customer_id` (`customer_id`),
  KEY `fk_invoice_product_order` (`product_order_id`),
  CONSTRAINT `fk_invoice_product_order` FOREIGN KEY (`product_order_id`) REFERENCES `product_order` (`id`),
  CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`),
  CONSTRAINT `invoice_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES (1,'INV001',2,2,800000.00,50000.00,750000.00,0.00,NULL,'CASH','PAID','2026-08-29 15:35:00',NULL),(2,'INV002',7,1,120000.00,0.00,120000.00,0.00,NULL,'CASH','PAID','2026-09-07 15:35:00',NULL),(3,'INV-36912879',8,1,800000.00,0.00,800000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 00:35:09',NULL),(4,'INV-C8D80EDD',9,1,900000.00,0.00,900000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 00:38:01',NULL),(5,'INV-91F14421',10,1,650000.00,0.00,650000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 00:44:34',NULL),(6,'INV-ABB9FFDE',11,1,180000.00,0.00,180000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 00:55:23',NULL),(7,'INV-2124731B',12,1,180000.00,0.00,180000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 01:01:51',NULL),(8,'INV-35BFE8A6',21,1,1100000.00,0.00,1100000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 01:03:40',NULL),(9,'INV-A57E6764',24,1,100000.00,0.00,100000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 01:09:31',NULL),(10,'INV-67279D37',26,1,120000.00,0.00,120000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 15:14:38',NULL),(11,'INV-00C0F0E9',27,1,100000.00,0.00,100000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 15:16:45',NULL),(12,'INV-C5098321',28,1,350000.00,0.00,350000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 15:21:45',NULL),(13,'INV-5719EC73',29,1,300000.00,0.00,300000.00,0.00,NULL,'VNPAY','PAID','2026-09-15 15:25:31',NULL),(14,'INV-2C1A03D6',30,1,700000.00,0.00,700000.00,0.00,NULL,'VNPAY','PAID','2026-09-15 15:35:11',NULL),(15,'INV-D8F5D6E9',31,1,180000.00,0.00,180000.00,0.00,NULL,'VNPAY','PAID','2026-09-15 15:45:19',NULL),(16,'INV-855A86E8',32,1,100000.00,0.00,100000.00,0.00,NULL,'VNPAY','PENDING','2026-09-15 16:11:17',NULL),(17,'INV-7956BA64',34,1,700000.00,0.00,700000.00,0.00,NULL,'VNPAY','PAID','2026-09-16 01:04:11',NULL),(18,'INV-8F815FC2',36,1,1000000.00,0.00,1000000.00,0.00,NULL,'VNPAY','PAID','2026-09-16 03:07:24',NULL),(19,'INV-E61F642F',38,1,750000.00,0.00,750000.00,0.00,NULL,'VNPAY','FAILED','2026-09-16 03:14:38',NULL),(20,'INV-D36D948E',39,1,700000.00,0.00,700000.00,0.00,NULL,'VNPAY','FAILED','2026-09-16 03:15:28',NULL),(21,'INV-2B550FA7',41,1,1000000.00,0.00,1000000.00,0.00,NULL,'VNPAY','FAILED','2026-09-16 04:17:39',NULL),(22,'INV-7624E845',42,1,1000000.00,0.00,1000000.00,0.00,NULL,'VNPAY','FAILED','2026-09-16 04:19:41',NULL);
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_item`
--

DROP TABLE IF EXISTS `invoice_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint NOT NULL,
  `service_id` bigint DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `service_id` (`service_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `invoice_item_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_item_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_item_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_item`
--

LOCK TABLES `invoice_item` WRITE;
/*!40000 ALTER TABLE `invoice_item` DISABLE KEYS */;
INSERT INTO `invoice_item` VALUES (1,1,20,NULL,1,800000.00,800000.00),(2,2,6,NULL,1,120000.00,120000.00),(3,3,20,NULL,1,800000.00,800000.00),(4,4,11,NULL,1,900000.00,900000.00),(5,5,9,NULL,1,650000.00,650000.00),(6,6,7,NULL,1,180000.00,180000.00),(7,7,7,NULL,1,180000.00,180000.00),(8,8,16,NULL,1,1100000.00,1100000.00),(9,9,8,NULL,1,100000.00,100000.00),(10,10,6,NULL,1,120000.00,120000.00),(11,11,8,NULL,1,100000.00,100000.00),(12,12,17,NULL,1,350000.00,350000.00),(13,13,18,NULL,1,300000.00,300000.00),(14,14,12,NULL,1,700000.00,700000.00),(15,15,7,NULL,1,180000.00,180000.00),(16,16,8,NULL,1,100000.00,100000.00),(17,17,12,NULL,1,700000.00,700000.00),(18,18,23,NULL,1,1000000.00,1000000.00),(19,19,22,NULL,1,750000.00,750000.00),(20,20,12,NULL,1,700000.00,700000.00),(21,21,23,NULL,1,1000000.00,1000000.00),(22,22,23,NULL,1,1000000.00,1000000.00);
/*!40000 ALTER TABLE `invoice_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,2,'Đặt lịch thành công','Lịch hẹn APT001 của bạn đã được xác nhận.',0,'2026-09-01 09:05:00'),(2,3,'Cảm ơn bạn','Cảm ơn bạn đã sử dụng dịch vụ tại salon.',1,'2026-08-29 16:00:00'),(3,2,'Ưu đãi tháng 9','Salon đang có ưu đãi cho dịch vụ chăm sóc và phục hồi tóc.',0,'2026-09-01 17:00:00'),(4,3,'Lịch hẹn sắp tới','Bạn có lịch hẹn vào ngày 06/09/2026.',0,'2026-09-02 08:00:00'),(5,2,'Hủy lịch hẹn','Lịch hẹn APT005 đã được hủy.',0,'2026-09-13 19:24:55'),(6,2,'Đặt lịch thành công','Lịch hẹn APM-432883C0 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 00:35:08'),(7,2,'Đặt lịch thành công','Lịch hẹn APM-6D7965D8 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 00:38:00'),(8,2,'Đặt lịch thành công','Lịch hẹn APM-9B98DF29 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 00:44:34'),(9,2,'Đặt lịch thành công','Lịch hẹn APM-7C74E335 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 00:55:23'),(10,2,'Đặt lịch thành công','Lịch hẹn APM-230986D7 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 01:01:51'),(11,2,'Hủy lịch hẹn','Lịch hẹn APM-432883C0 đã được hủy.',0,'2026-09-15 01:02:11'),(12,2,'Hủy lịch hẹn','Lịch hẹn APM-230986D7 đã được hủy.',0,'2026-09-15 01:02:22'),(13,2,'Hủy lịch hẹn','Lịch hẹn APM-7C74E335 đã được hủy.',0,'2026-09-15 01:02:28'),(14,2,'Hủy lịch hẹn','Lịch hẹn APM-9B98DF29 đã được hủy.',0,'2026-09-15 01:02:34'),(15,2,'Hủy lịch hẹn','Lịch hẹn APM-6D7965D8 đã được hủy.',0,'2026-09-15 01:02:47'),(16,2,'Đặt lịch thành công','Lịch hẹn APM-FE047199 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 01:03:40'),(17,2,'Hủy lịch hẹn','Lịch hẹn APM-FE047199 đã được hủy.',0,'2026-09-15 01:07:55'),(18,2,'Đặt lịch thành công','Lịch hẹn APM-8859417D đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 01:09:31'),(19,2,'Đặt lịch thành công','Lịch hẹn APM-6F9EC0D7 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 15:14:38'),(20,2,'Đặt lịch thành công','Lịch hẹn APM-DD3029BC đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 15:16:45'),(21,2,'Đặt lịch thành công','Lịch hẹn APM-47604900 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 15:21:45'),(22,2,'Đặt lịch thành công','Lịch hẹn APM-C61F9261 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 15:25:31'),(23,2,'Thanh toán thành công','Lịch hẹn APM-C61F9261 đã được thanh toán và xác nhận.',0,'2026-09-15 15:27:26'),(24,2,'Đặt lịch thành công','Lịch hẹn APM-2B9DA6B6 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 15:35:11'),(25,2,'Thanh toán thành công','Lịch hẹn APM-2B9DA6B6 đã được thanh toán và xác nhận.',0,'2026-09-15 15:35:42'),(26,2,'Đặt lịch thành công','Lịch hẹn APM-C20D9A39 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 15:45:19'),(27,2,'Thanh toán thành công','Lịch hẹn APM-C20D9A39 đã được thanh toán và xác nhận.',0,'2026-09-15 15:45:47'),(28,2,'Đặt lịch thành công','Lịch hẹn APM-6FB967DC đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 16:11:16'),(29,2,'Đặt lịch thành công','Lịch hẹn APM-F05D6667 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 18:04:11'),(30,2,'Thanh toán thành công','Lịch hẹn APM-F05D6667 đã được thanh toán và xác nhận.',0,'2026-09-15 18:07:49'),(31,2,'Đặt lịch thành công','Lịch hẹn APM-0E3FD755 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 20:07:24'),(32,2,'Thanh toán thành công','Lịch hẹn APM-0E3FD755 đã được thanh toán và xác nhận.',0,'2026-09-15 20:08:50'),(33,2,'Đặt lịch thành công','Lịch hẹn APM-28E69374 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 20:14:38'),(34,2,'Đặt lịch thành công','Lịch hẹn APM-1506DF91 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 20:15:28'),(35,2,'Hủy lịch hẹn','Lịch hẹn APM-1506DF91 đã được hủy.',0,'2026-09-15 20:15:46'),(36,2,'Hủy lịch hẹn','Lịch hẹn APM-6FB967DC đã được hủy.',0,'2026-09-15 20:22:53'),(37,2,'Lịch hẹn đã bị hủy','Lịch hẹn APM-8859417D đã tự động hủy vì quá thời gian thanh toán.',0,'2026-09-15 20:59:33'),(38,2,'Lịch hẹn đã bị hủy','Lịch hẹn APM-6F9EC0D7 đã tự động hủy vì quá thời gian thanh toán.',0,'2026-09-15 20:59:33'),(39,2,'Lịch hẹn đã bị hủy','Lịch hẹn APM-DD3029BC đã tự động hủy vì quá thời gian thanh toán.',0,'2026-09-15 20:59:33'),(40,2,'Lịch hẹn đã bị hủy','Lịch hẹn APM-47604900 đã tự động hủy vì quá thời gian thanh toán.',0,'2026-09-15 20:59:33'),(41,2,'Lịch hẹn đã bị hủy','Lịch hẹn APM-28E69374 đã tự động hủy vì quá thời gian thanh toán.',0,'2026-09-15 20:59:33'),(42,2,'Đặt lịch thành công','Lịch hẹn APM-A67B18E6 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 21:17:39'),(43,2,'Hủy lịch hẹn','Lịch hẹn APM-A67B18E6 đã được hủy.',0,'2026-09-15 21:19:31'),(44,2,'Đặt lịch thành công','Lịch hẹn APM-7F50B701 đã được tạo và đang chờ thanh toán tại salon.',0,'2026-09-15 21:19:41'),(45,2,'Lịch hẹn đã bị hủy','Lịch hẹn APM-7F50B701 đã tự động hủy vì quá thời gian thanh toán.',0,'2026-09-15 21:30:32');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transaction`
--

DROP TABLE IF EXISTS `payment_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint NOT NULL,
  `transaction_no` varchar(100) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(30) NOT NULL,
  `payment_status` varchar(30) NOT NULL,
  `transaction_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `payment_transaction_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transaction`
--

LOCK TABLES `payment_transaction` WRITE;
/*!40000 ALTER TABLE `payment_transaction` DISABLE KEYS */;
INSERT INTO `payment_transaction` VALUES (1,1,'TXN001',750000.00,'CASH','PAID','2026-08-29 15:35:30'),(2,2,'TXN002',120000.00,'CASH','PAID','2026-09-07 15:35:30'),(3,3,'TXN-B7361A97',800000.00,'VNPAY','PENDING','2026-09-15 00:35:09'),(4,4,'TXN-19930545',900000.00,'VNPAY','PENDING','2026-09-15 00:38:01'),(5,5,'TXN-4BEEA664',650000.00,'VNPAY','PENDING','2026-09-15 00:44:34'),(6,6,'TXN-E413C297',180000.00,'VNPAY','PENDING','2026-09-15 00:55:23'),(7,7,'TXN-79430C6C',180000.00,'VNPAY','PENDING','2026-09-15 01:01:51'),(8,8,'TXN-244969C0',1100000.00,'VNPAY','PENDING','2026-09-15 01:03:40'),(9,9,'TXN-6B228990',100000.00,'VNPAY','PENDING','2026-09-15 01:09:31'),(10,10,'TXN-946A70A7',120000.00,'VNPAY','PENDING','2026-09-15 15:14:38'),(11,11,'TXN-7AAD0CCC',100000.00,'VNPAY','PENDING','2026-09-15 15:16:45'),(12,12,'TXN-355A7017',350000.00,'VNPAY','PENDING','2026-09-15 15:21:45'),(13,13,'TXN-573231B9',300000.00,'VNPAY','PAID','2026-09-15 15:27:26'),(14,14,'TXN-4FBAF47E',700000.00,'VNPAY','PAID','2026-09-15 15:35:42'),(15,15,'TXN-03C89A86',180000.00,'VNPAY','PAID','2026-09-15 15:45:47'),(16,16,'TXN-6A325F4A',100000.00,'VNPAY','FAILED','2026-09-15 16:11:27'),(17,16,'TXN-E0E39E4F',100000.00,'VNPAY','PENDING','2026-09-15 16:12:23'),(18,17,'TXN-41294473',700000.00,'VNPAY','FAILED','2026-09-16 01:06:45'),(19,17,'TXN-A92B1D96',700000.00,'VNPAY','PAID','2026-09-16 01:07:49'),(20,18,'TXN-274E42EB',1000000.00,'VNPAY','FAILED','2026-09-16 03:08:12'),(21,18,'TXN-32139B7D',1000000.00,'VNPAY','PAID','2026-09-16 03:08:50'),(22,19,'TXN-D48D3B17',750000.00,'VNPAY','FAILED','2026-09-16 03:14:44'),(23,20,'TXN-5660FFE6',700000.00,'VNPAY','FAILED','2026-09-16 03:15:32'),(24,21,'TXN-833F400C',1000000.00,'VNPAY','FAILED','2026-09-16 04:17:47'),(25,21,'TXN-17ACF2B8',1000000.00,'VNPAY','FAILED','2026-09-16 04:19:16'),(26,22,'TXN-5F4945BB',1000000.00,'VNPAY','FAILED','2026-09-16 04:29:58');
/*!40000 ALTER TABLE `payment_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_code` varchar(30) DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `min_stock_alert` int DEFAULT '5',
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_code` (`product_code`),
  KEY `supplier_id` (`supplier_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`) ON DELETE SET NULL,
  CONSTRAINT `product_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'SP001',1,'L\'Oreal Professionnel Serie Expert Absolut Repair Shampoo',420000.00,5,30,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp',1),(2,'SP002',1,'L\'Oreal Professionnel Serie Expert Absolut Repair Conditioner',450000.00,5,25,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp',1),(3,'SP003',1,'L\'Oreal Professionnel Serie Expert Metal Detox Shampoo',520000.00,5,18,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp',1),(4,'SP004',1,'L\'Oreal Professionnel Serie Expert Metal Detox Mask',620000.00,5,12,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp',1),(5,'SP005',1,'L\'Oreal Professionnel Serie Expert Vitamino Color Shampoo',450000.00,5,22,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp',1),(6,'SP006',1,'L\'Oreal Professionnel Serie Expert Absolut Repair 10-in-1 Oil',480000.00,5,15,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp',1),(7,'SP007',1,'L\'Oreal Professionnel Tecni.Art Fix Max Gel',330000.00,5,20,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp',1),(8,'SP008',1,'L\'Oreal Professionnel Tecni.Art Savage Panache',350000.00,5,14,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp',1),(9,'SP009',2,'Wella Professionals Invigo Nutri-Enrich Shampoo',390000.00,5,36,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp',1),(10,'SP010',2,'Wella Professionals Invigo Nutri-Enrich Conditioner',410000.00,5,24,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp',1),(11,'SP011',2,'Wella Professionals Fusion Shampoo',430000.00,5,26,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp',1),(12,'SP012',2,'Wella Professionals Fusion Intense Repair Mask',560000.00,5,24,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp',1),(13,'SP013',2,'Wella Professionals Oil Reflections Luminous Oil',500000.00,5,18,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp',1),(14,'SP014',2,'Wella Professionals EIMI Thermal Image',420000.00,5,13,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp',1),(15,'SP015',2,'Wella Professionals EIMI Extra Volume Mousse',350000.00,5,25,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp',1),(16,'SP016',2,'Wella Professionals EIMI Mistify Me Strong',330000.00,5,19,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp',1),(17,'SP017',1,'Kérastase Nutritive Bain Satin Riche',850000.00,5,10,3,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363536/images_tq12my.jpg',1),(18,'SP018',1,'Kérastase Nutritive Lait Vital Conditioner',920000.00,5,8,3,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363536/images_tq12my.jpg',1),(19,'SP019',1,'Moroccanoil Treatment Original',780000.00,5,11,3,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363573/images_m5hv43.jpg',1),(20,'SP020',1,'Olaplex No.3 Hair Perfector',720000.00,5,9,3,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363617/rpwgx0q5jxxdbqpfjlah.webp',1),(21,'SP021',1,'Olaplex No.4 Bond Maintenance Shampoo',690000.00,5,8,3,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363617/rpwgx0q5jxxdbqpfjlah.webp',1),(22,'SP022',1,'Olaplex No.5 Bond Maintenance Conditioner',690000.00,5,7,3,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363617/rpwgx0q5jxxdbqpfjlah.webp',1),(23,'SP023',2,'Schwarzkopf Professional BC Bonacure Repair Rescue Shampoo',450000.00,5,14,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363661/images_nqxi2r.jpg',1),(24,'SP024',2,'Schwarzkopf Professional BC Bonacure Repair Rescue Treatment',520000.00,5,12,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363661/images_nqxi2r.jpg',1),(25,'SP025',2,'GATSBY Moving Rubber Spiky Edge',160000.00,5,25,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363690/ixtxhuchwglspmdcf3af.jpg',1),(26,'SP026',2,'GATSBY Moving Rubber Air Rise',160000.00,5,23,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363690/ixtxhuchwglspmdcf3af.jpg',1),(27,'SP027',1,'TRESemmé Keratin Smooth Shampoo',220000.00,5,30,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363825/zvmmecrvkirxp7gpxad4.jpg',1),(28,'SP028',1,'TRESemmé Keratin Smooth Conditioner',230000.00,5,26,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363825/zvmmecrvkirxp7gpxad4.jpg',1),(29,'SP029',1,'Sebastian Professional Potion 9',650000.00,5,10,3,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363867/images_gb8rt5.jpg',1),(30,'SP030',2,'Schwarzkopf Professional Osis+ Dust It',320000.00,5,16,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363894/images_me4m8v.jpg',1),(31,'SP031',3,'Dầu Dưỡng Tóc Mise En Scene Perfect Serum 80Ml',100000.00,7,9,5,'https://res.cloudinary.com/dlskx91gk/image/upload/v1789315283/hair-salon/products/t2vjl3z2cmbtono1yfmq.jpg',1);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_order`
--

DROP TABLE IF EXISTS `product_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_code` varchar(50) NOT NULL,
  `customer_id` bigint NOT NULL,
  `sub_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(30) NOT NULL,
  `payment_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `order_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `receiver_name` varchar(255) NOT NULL,
  `receiver_phone` varchar(20) NOT NULL,
  `shipping_address` varchar(500) NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `fk_product_order_customer` (`customer_id`),
  CONSTRAINT `fk_product_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_order`
--

LOCK TABLES `product_order` WRITE;
/*!40000 ALTER TABLE `product_order` DISABLE KEYS */;
INSERT INTO `product_order` VALUES (1,'ORD001',1,1420000.00,50000.00,30000.00,1400000.00,'CASH','PENDING','PENDING','Nguyễn An','0900000002','Quận 6, TP. Hồ Chí Minh','Giao giờ hành chính.','2026-09-01 11:00:00','2026-09-01 11:00:00'),(2,'ORD002',2,1280000.00,80000.00,0.00,1200000.00,'CASH','PAID','CONFIRMED','Trần Bình','0900000003','Quận 3, TP. Hồ Chí Minh','Gọi trước khi giao.','2026-09-02 10:00:00','2026-09-02 10:20:00');
/*!40000 ALTER TABLE `product_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_order_item`
--

DROP TABLE IF EXISTS `product_order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_item_order` (`order_id`),
  KEY `fk_order_item_product` (`product_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `product_order` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_order_item_price` CHECK ((`unit_price` >= 0)),
  CONSTRAINT `chk_order_item_quantity` CHECK ((`quantity` > 0)),
  CONSTRAINT `chk_order_item_total_price` CHECK ((`total_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_order_item`
--

LOCK TABLES `product_order_item` WRITE;
/*!40000 ALTER TABLE `product_order_item` DISABLE KEYS */;
INSERT INTO `product_order_item` VALUES (1,1,1,1,420000.00,420000.00,'L\'Oreal Professionnel Serie Expert Absolut Repair Shampoo'),(2,1,19,1,780000.00,780000.00,'Moroccanoil Treatment Original'),(3,1,27,1,220000.00,220000.00,'TRESemmé Keratin Smooth Shampoo'),(4,2,12,1,560000.00,560000.00,'Wella Professionals Fusion Intense Repair Mask'),(5,2,20,1,720000.00,720000.00,'Olaplex No.3 Hair Perfector');
/*!40000 ALTER TABLE `product_order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order`
--

DROP TABLE IF EXISTS `purchase_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `note` varchar(500) DEFAULT NULL,
  `is_received` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `purchase_order_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order`
--

LOCK TABLES `purchase_order` WRITE;
/*!40000 ALTER TABLE `purchase_order` DISABLE KEYS */;
INSERT INTO `purchase_order` VALUES (1,1,'2026-08-28 09:00:00',8020000.00,'Nhập dầu gội, dầu xả và sản phẩm chăm sóc tóc.',1),(2,2,'2026-08-30 10:30:00',5480000.00,'Nhập sản phẩm phục hồi và tạo kiểu.',1),(3,1,'2026-09-01 08:30:00',5380000.00,'Nhập thêm sản phẩm bán chạy.',1),(4,3,'2026-09-14 20:37:55',200000.00,'',1);
/*!40000 ALTER TABLE `purchase_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_item`
--

DROP TABLE IF EXISTS `purchase_order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `purchase_order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `import_price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `purchase_order_item_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_order` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_order_item_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_item`
--

LOCK TABLES `purchase_order_item` WRITE;
/*!40000 ALTER TABLE `purchase_order_item` DISABLE KEYS */;
INSERT INTO `purchase_order_item` VALUES (1,1,1,10,320000.00),(2,1,2,8,340000.00),(3,1,5,6,350000.00),(4,2,9,8,300000.00),(5,2,11,6,330000.00),(6,2,12,8,340000.00),(7,2,15,8,220000.00),(8,3,19,5,550000.00),(9,3,20,4,500000.00),(10,3,21,3,580000.00),(11,4,31,5,40000.00);
/*!40000 ALTER TABLE `purchase_order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`),
  CONSTRAINT `review_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
INSERT INTO `review` VALUES (1,2,5,'Nhân viên tư vấn tốt, tóc mềm mượt và phục hồi rõ rệt.'),(2,7,4,'Gội đầu sạch và nhân viên thân thiện.');
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `service_code` varchar(30) DEFAULT NULL,
  `category_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(12,2) NOT NULL,
  `duration_minutes` int NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_code` (`service_code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `service_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
INSERT INTO `service` VALUES (1,'DV001',1,'Cắt tóc nữ cơ bản','Tư vấn kiểu tóc, cắt và sấy tạo kiểu.',180000.00,45,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362326/cat-toc-nu-co-ban_s6ggeb.jpg',1),(2,'DV002',1,'Cắt tóc nam cơ bản','Cắt tóc nam, gội đầu và sấy tạo kiểu.',150000.00,40,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362325/C%E1%BA%AFt_t%C3%B3c_nam_c%C6%A1_b%E1%BA%A3n_onpyfl.jpg',1),(3,'DV003',1,'Cắt tóc layer nữ','Cắt layer tạo độ phồng và chuyển tầng tự nhiên.',220000.00,60,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362325/C%E1%BA%AFt_t%C3%B3c_layer_n%E1%BB%AF_ujlnav.jpg',1),(4,'DV004',1,'Cắt tóc bob','Tạo kiểu bob gọn gàng, phù hợp nhiều khuôn mặt.',220000.00,60,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362325/C%E1%BA%AFt_t%C3%B3c_bob_cdzy0l.jpg',1),(5,'DV005',1,'Cắt tóc mullet','Tạo kiểu mullet cá tính, phù hợp tóc nam và nữ.',250000.00,65,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362619/C%E1%BA%AFt_t%C3%B3c_mullet_haijb7.jpg',1),(6,'DV006',1,'Gội đầu & sấy tạo kiểu','Gội đầu làm sạch và sấy tạo kiểu theo yêu cầu.',120000.00,30,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362594/images_yuynog.jpg',1),(7,'DV007',1,'Gội đầu dưỡng sinh','Gội đầu kết hợp massage da đầu và thư giãn.',180000.00,45,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362697/gz6aydxp7tpty469k0ta.jpg',1),(8,'DV008',1,'Sấy tạo kiểu','Sấy phồng, sấy cụp hoặc tạo kiểu theo yêu cầu.',100000.00,25,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362735/gllc0ccgkwm9ka6lfewv.jpg',1),(9,'DV009',1,'Uốn lạnh','Uốn lạnh tạo độ xoăn và sóng tự nhiên.',650000.00,120,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362779/images_hwkfd3.jpg',1),(10,'DV010',1,'Uốn nóng','Uốn nhiệt giúp tạo kiểu xoăn bền và giữ nếp tốt.',850000.00,150,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362817/yoktfnkpcrx3xmvmn4vh.jpg',1),(11,'DV011',1,'Uốn setting','Uốn setting tạo sóng lớn và độ bồng tự nhiên.',900000.00,160,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362885/images_cb0rte.jpg',1),(12,'DV012',2,'Nhuộm tóc thời trang','Nhuộm tóc theo màu khách hàng lựa chọn.',700000.00,120,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362779/images_hwkfd3.jpg',1),(13,'DV013',2,'Nhuộm phủ bạc','Phủ bạc đều màu, tự nhiên và bền màu.',600000.00,100,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362972/images_awy6ed.jpg',1),(14,'DV014',2,'Nhuộm balayage','Nhuộm balayage chuyển màu tự nhiên.',1200000.00,180,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363002/images_ukzohr.jpg',1),(15,'DV015',2,'Nhuộm highlight','Highlight tạo điểm nhấn và chiều sâu cho mái tóc.',950000.00,150,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363095/images_kp28fc.jpg',1),(16,'DV016',2,'Nhuộm ombre','Nhuộm ombre chuyển màu từ đậm sang sáng.',1100000.00,170,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363154/images_bdkdle.jpg',1),(17,'DV017',3,'Hấp dầu phục hồi','Hấp dầu bổ sung độ ẩm cho tóc khô xơ.',350000.00,60,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg',1),(18,'DV018',3,'Chăm sóc da đầu','Làm sạch da đầu kết hợp massage thư giãn.',300000.00,50,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg',1),(19,'DV019',3,'Detox da đầu','Làm sạch sâu da đầu và hỗ trợ giảm bã nhờn.',400000.00,60,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg',1),(20,'DV020',4,'Phục hồi Keratin','Phục hồi độ mềm mượt cho tóc khô và hư tổn.',800000.00,120,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg',1),(21,'DV021',4,'Phục hồi tóc tẩy','Phục hồi chuyên sâu cho tóc đã tẩy hoặc xử lý hóa chất.',950000.00,120,'https://res.cloudinary.com/dlskx91gk/image/upload/v1789471498/images_atiq89.jpg',1),(22,'DV022',4,'Phục hồi protein','Bổ sung protein giúp tóc chắc khỏe và giảm xơ rối.',750000.00,90,'https://res.cloudinary.com/dlskx91gk/image/upload/v1789471369/images_loketm.jpg',1),(23,'DV023',6,'Duỗi cao cấp',NULL,1000000.00,90,'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg',1);
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stylist`
--

DROP TABLE IF EXISTS `stylist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stylist` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `experience_years` int DEFAULT '0',
  `bio` text,
  `average_rating` decimal(3,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `stylist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stylist`
--

LOCK TABLES `stylist` WRITE;
/*!40000 ALTER TABLE `stylist` DISABLE KEYS */;
INSERT INTO `stylist` VALUES (1,4,'Cắt tóc nam & tạo kiểu',5,'Chuyên cắt tóc nam, tạo kiểu và grooming.',4.80),(2,5,'Nhuộm, highlight & phục hồi tóc',7,'Chuyên nhuộm, highlight, phục hồi và chăm sóc tóc.',4.90),(3,7,NULL,0,NULL,0.00);
/*!40000 ALTER TABLE `stylist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stylist_schedule`
--

DROP TABLE IF EXISTS `stylist_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stylist_schedule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `stylist_id` bigint NOT NULL,
  `work_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_off` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `stylist_id` (`stylist_id`),
  CONSTRAINT `stylist_schedule_ibfk_1` FOREIGN KEY (`stylist_id`) REFERENCES `stylist` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stylist_schedule`
--

LOCK TABLES `stylist_schedule` WRITE;
/*!40000 ALTER TABLE `stylist_schedule` DISABLE KEYS */;
INSERT INTO `stylist_schedule` VALUES (1,1,'2026-09-03','09:00:00','17:00:00',0),(2,1,'2026-09-04','09:00:00','17:00:00',0),(3,2,'2026-09-03','10:00:00','18:00:00',0),(4,2,'2026-09-04','10:00:00','18:00:00',0),(5,1,'2026-09-05','09:00:00','17:00:00',0),(6,2,'2026-09-05','10:00:00','18:00:00',0),(7,1,'2026-09-06','09:00:00','17:00:00',1),(8,2,'2026-09-06','10:00:00','18:00:00',0),(9,1,'2026-09-07','09:00:00','17:00:00',0),(10,2,'2026-09-07','10:00:00','18:00:00',0),(11,3,'2026-09-20','09:00:00','18:00:00',0),(12,3,'2026-09-15','09:00:00','18:00:00',0),(13,3,'2026-09-14','09:00:00','18:00:00',0),(14,3,'2026-09-19','09:00:00','18:00:00',0),(15,3,'2026-09-16','09:00:00','18:00:00',0),(16,3,'2026-09-17','09:00:00','18:00:00',0),(17,3,'2026-09-18','09:00:00','18:00:00',0),(18,2,'2026-09-15','09:00:00','18:00:00',0),(19,2,'2026-09-14','09:00:00','18:00:00',0),(20,2,'2026-09-18','09:00:00','18:00:00',0),(21,2,'2026-09-16','09:00:00','18:00:00',0),(22,2,'2026-09-17','09:00:00','18:00:00',0),(23,2,'2026-09-19','09:00:00','18:00:00',0),(24,2,'2026-09-20','09:00:00','18:00:00',0),(25,3,'2026-09-24','09:00:00','18:00:00',0),(26,3,'2026-09-22','09:00:00','18:00:00',0),(27,3,'2026-09-21','09:00:00','18:00:00',0),(28,3,'2026-09-27','09:00:00','18:00:00',0),(29,3,'2026-09-23','09:00:00','18:00:00',0),(30,3,'2026-09-26','09:00:00','18:00:00',0),(31,3,'2026-09-25','09:00:00','18:00:00',0),(32,3,'2026-09-28','09:00:00','18:00:00',0),(33,3,'2026-10-02','09:00:00','18:00:00',0),(34,3,'2026-10-01','09:00:00','18:00:00',0),(35,3,'2026-09-30','09:00:00','18:00:00',0),(36,3,'2026-09-29','09:00:00','18:00:00',0),(37,3,'2026-10-03','09:00:00','18:00:00',0),(38,3,'2026-10-04','09:00:00','18:00:00',0),(39,2,'2026-09-27','09:00:00','18:00:00',0),(40,2,'2026-09-23','09:00:00','18:00:00',0),(41,2,'2026-09-21','09:00:00','18:00:00',0),(42,2,'2026-09-22','09:00:00','18:00:00',0),(43,2,'2026-09-24','09:00:00','18:00:00',0),(44,2,'2026-09-25','09:00:00','18:00:00',0),(45,2,'2026-09-26','09:00:00','18:00:00',0),(46,2,'2026-10-01','09:00:00','18:00:00',0),(47,2,'2026-10-03','09:00:00','18:00:00',0),(48,2,'2026-09-30','09:00:00','18:00:00',0),(49,2,'2026-10-02','09:00:00','18:00:00',0),(50,2,'2026-09-29','09:00:00','18:00:00',0),(51,2,'2026-09-28','09:00:00','18:00:00',0),(52,2,'2026-10-04','09:00:00','18:00:00',0),(53,1,'2026-09-23','09:00:00','18:00:00',0),(54,1,'2026-09-22','09:00:00','18:00:00',0),(55,1,'2026-09-24','09:00:00','18:00:00',0),(56,1,'2026-09-25','09:00:00','18:00:00',0),(57,1,'2026-09-26','09:00:00','18:00:00',0),(58,1,'2026-09-21','09:00:00','18:00:00',0),(59,1,'2026-09-27','09:00:00','18:00:00',0),(60,1,'2026-10-03','09:00:00','18:00:00',0),(61,1,'2026-09-30','09:00:00','18:00:00',0),(62,1,'2026-10-02','09:00:00','18:00:00',0),(63,1,'2026-10-01','09:00:00','18:00:00',0),(64,1,'2026-09-28','09:00:00','18:00:00',0),(65,1,'2026-09-29','09:00:00','18:00:00',0),(66,1,'2026-10-04','09:00:00','18:00:00',0),(67,3,'2026-10-10','09:00:00','18:00:00',0),(68,3,'2026-10-06','09:00:00','18:00:00',0),(69,3,'2026-10-05','09:00:00','18:00:00',0),(70,3,'2026-10-08','09:00:00','18:00:00',0),(71,3,'2026-10-09','09:00:00','18:00:00',0),(72,3,'2026-10-07','09:00:00','18:00:00',0),(73,3,'2026-10-11','09:00:00','18:00:00',0);
/*!40000 ALTER TABLE `stylist_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES (1,'L\'Oreal Professionnel Vietnam','02830000001','supplier1@example.com','TP. Hồ Chí Minh'),(2,'Wella Vietnam','02830000002','supplier2@example.com','TP. Hồ Chí Minh'),(3,'MISE EN SCENE',NULL,NULL,NULL),(4,'Butterfly Shadow',NULL,NULL,NULL);
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `role` varchar(30) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','Salon','admin@test.com','$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.','0900000001','https://res.cloudinary.com/dlskx91gk/image/upload/v1780498256/nclxmhpnodmo5ylko2yu.png','ADMIN',1,'2026-09-01 08:00:00'),(2,'Nguyễn','An','customer1@test.com','$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.','0900000002','https://res.cloudinary.com/dlskx91gk/image/upload/v1780498256/nclxmhpnodmo5ylko2yu.png','CUSTOMER',1,'2026-09-01 08:10:00'),(3,'Trần','Bình','customer2@test.com','$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.','0900000003','https://res.cloudinary.com/dlskx91gk/image/upload/v1780498256/nclxmhpnodmo5ylko2yu.png','CUSTOMER',1,'2026-09-01 08:20:00'),(4,'Lê','Minh','stylist1@test.com','$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.','0900000004','https://res.cloudinary.com/dlskx91gk/image/upload/v1789476909/Screenshot_2026-09-15_195449_hflbbj.png','STYLIST',1,'2026-09-01 08:30:00'),(5,'Phạm','Linh','stylist2@test.com','$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.','0900000005','https://res.cloudinary.com/dlskx91gk/image/upload/v1789476800/copy_of_images_wd6asw.jpg','STYLIST',1,'2026-09-01 08:40:00'),(6,'Nguyễn','Nghi','customer9@test.com','$2a$10$zcz3cprq347Qphy36UMEpe4uNZVU40WlDthYDeAl/rMW8VpEWPMTi','0900000006','https://res.cloudinary.com/dlskx91gk/image/upload/v1780456543/kbcccbxtsrvrkz62wjjx.png','CUSTOMER',1,'2026-09-13 21:20:06'),(7,'Võ','Như','stylist3@gmail.com','$2a$10$lHOcNbTGAv04mjhgx/x.qe/B2q/pzyl7laIBgQ8/BkdOzCmpIqyp.','0900000007','https://res.cloudinary.com/dlskx91gk/image/upload/v1789476641/copy_of_images_ogsxjt.jpg','STYLIST',1,'2026-09-15 00:33:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-15 21:47:30
