SET NAMES utf8mb4;

USE salondb;

INSERT INTO users
(id, first_name, last_name, email, password, phone_number, avatar, role, is_active, created_at)
VALUES
(1, 'Admin', 'Salon', 'admin@test.com', '$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.', '0900000001', NULL, 'ADMIN', TRUE, '2026-09-01 08:00:00'),
(2, 'Nguyễn', 'An', 'customer1@test.com', '$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.', '0900000002', NULL, 'CUSTOMER', TRUE, '2026-09-01 08:10:00'),
(3, 'Trần', 'Bình', 'customer2@test.com', '$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.', '0900000003', NULL, 'CUSTOMER', TRUE, '2026-09-01 08:20:00'),
(4, 'Lê', 'Minh', 'stylist1@test.com', '$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.', '0900000004', NULL, 'STYLIST', TRUE, '2026-09-01 08:30:00'),
(5, 'Phạm', 'Linh', 'stylist2@test.com', '$2a$10$9kH1ALY/Y0NF.YxiMqxOCu83VtkqlzYs2IxZ8UmuUg2NFRBpG/I/.', '0900000005', NULL, 'STYLIST', TRUE, '2026-09-01 08:40:00');

INSERT INTO customer
(id, user_id, dob, gender, total_visits, total_spent)
VALUES
(1, 2, '2003-05-15', 'FEMALE', 5, 1850000.00),
(2, 3, '2002-11-20', 'MALE', 3, 980000.00);

INSERT INTO stylist
(id, user_id, specialization, experience_years, bio, average_rating)
VALUES
(1, 4, 'Cắt tóc nam & tạo kiểu', 5, 'Chuyên cắt tóc nam, tạo kiểu và grooming.', 4.80),
(2, 5, 'Nhuộm, highlight & phục hồi tóc', 7, 'Chuyên nhuộm, highlight, phục hồi và chăm sóc tóc.', 4.90);

INSERT INTO stylist_schedule
(id, stylist_id, work_date, start_time, end_time, is_off)
VALUES
(1, 1, '2026-09-03', '09:00:00', '17:00:00', FALSE),
(2, 1, '2026-09-04', '09:00:00', '17:00:00', FALSE),
(3, 2, '2026-09-03', '10:00:00', '18:00:00', FALSE),
(4, 2, '2026-09-04', '10:00:00', '18:00:00', FALSE),
(5, 1, '2026-09-05', '09:00:00', '17:00:00', FALSE),
(6, 2, '2026-09-05', '10:00:00', '18:00:00', FALSE),
(7, 1, '2026-09-06', '09:00:00', '17:00:00', TRUE),
(8, 2, '2026-09-06', '10:00:00', '18:00:00', FALSE),
(9, 1, '2026-09-07', '09:00:00', '17:00:00', FALSE),
(10, 2, '2026-09-07', '10:00:00', '18:00:00', FALSE);

INSERT INTO attendance
(id, stylist_id, schedule_id, check_in_time, check_out_time, total_hours, attendance_status)
VALUES
(1, 1, 1, '2026-09-03 08:55:00', '2026-09-03 17:05:00', 8.17, 'COMPLETED'),
(2, 2, 3, '2026-09-03 09:58:00', NULL, NULL, 'PRESENT'),
(3, 1, 2, '2026-09-04 09:04:00', '2026-09-04 17:01:00', 7.95, 'COMPLETED'),
(4, 2, 4, '2026-09-04 10:12:00', '2026-09-04 18:03:00', 7.85, 'COMPLETED'),
(5, 1, 5, NULL, NULL, NULL, 'ABSENT'),
(6, 2, 6, '2026-09-05 10:01:00', NULL, NULL, 'PRESENT');

INSERT INTO category
(id, name, description, type)
VALUES
(1, 'Cắt & Tạo kiểu', 'Các dịch vụ cắt tóc, gội đầu và tạo kiểu.', 'SERVICE'),

(2, 'Nhuộm tóc','Các dịch vụ nhuộm, phủ bạc, highlight, balayage và ombre.','SERVICE'),

(3, 'Chăm sóc tóc','Các dịch vụ hấp dầu, dưỡng tóc và chăm sóc da đầu.','SERVICE'),

(4, 'Phục hồi tóc', 'Các dịch vụ phục hồi tóc khô xơ, tóc tẩy và tóc hư tổn.', 'SERVICE'),

(5, 'Sản phẩm chăm sóc tóc', 'Dầu gội, dầu xả, mặt nạ tóc, dầu dưỡng và sản phẩm tạo kiểu.', 'PRODUCT');

INSERT INTO service
(id, service_code, category_id, name, description, price, duration_minutes, image_url, is_active)
VALUES
(1, 'DV001', 1, 'Cắt tóc nữ cơ bản', 'Tư vấn kiểu tóc, cắt và sấy tạo kiểu.', 180000.00, 45, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362326/cat-toc-nu-co-ban_s6ggeb.jpg', TRUE),
(2, 'DV002', 1, 'Cắt tóc nam cơ bản', 'Cắt tóc nam, gội đầu và sấy tạo kiểu.', 150000.00, 40, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362325/C%E1%BA%AFt_t%C3%B3c_nam_c%C6%A1_b%E1%BA%A3n_onpyfl.jpg', TRUE),
(3, 'DV003', 1, 'Cắt tóc layer nữ', 'Cắt layer tạo độ phồng và chuyển tầng tự nhiên.', 220000.00, 60, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362325/C%E1%BA%AFt_t%C3%B3c_layer_n%E1%BB%AF_ujlnav.jpg', TRUE),
(4, 'DV004', 1, 'Cắt tóc bob', 'Tạo kiểu bob gọn gàng, phù hợp nhiều khuôn mặt.', 220000.00, 60, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362325/C%E1%BA%AFt_t%C3%B3c_bob_cdzy0l.jpg', TRUE),
(5, 'DV005', 1, 'Cắt tóc mullet', 'Tạo kiểu mullet cá tính, phù hợp tóc nam và nữ.', 250000.00, 65, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362619/C%E1%BA%AFt_t%C3%B3c_mullet_haijb7.jpg', TRUE),
(6, 'DV006', 1, 'Gội đầu & sấy tạo kiểu', 'Gội đầu làm sạch và sấy tạo kiểu theo yêu cầu.', 120000.00, 30, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362594/images_yuynog.jpg', TRUE),
(7, 'DV007', 1, 'Gội đầu dưỡng sinh', 'Gội đầu kết hợp massage da đầu và thư giãn.', 180000.00, 45, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362697/gz6aydxp7tpty469k0ta.jpg', TRUE),
(8, 'DV008', 1, 'Sấy tạo kiểu', 'Sấy phồng, sấy cụp hoặc tạo kiểu theo yêu cầu.', 100000.00, 25, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362735/gllc0ccgkwm9ka6lfewv.jpg', TRUE),
(9, 'DV009', 1, 'Uốn lạnh', 'Uốn lạnh tạo độ xoăn và sóng tự nhiên.', 650000.00, 120, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362779/images_hwkfd3.jpg', TRUE),
(10, 'DV010', 1, 'Uốn nóng', 'Uốn nhiệt giúp tạo kiểu xoăn bền và giữ nếp tốt.', 850000.00, 150, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362817/yoktfnkpcrx3xmvmn4vh.jpg', TRUE),
(11, 'DV011', 1, 'Uốn setting', 'Uốn setting tạo sóng lớn và độ bồng tự nhiên.', 900000.00, 160, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362885/images_cb0rte.jpg', TRUE),
(12, 'DV012', 2, 'Nhuộm tóc thời trang', 'Nhuộm tóc theo màu khách hàng lựa chọn.', 700000.00, 120, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362779/images_hwkfd3.jpg', TRUE),
(13, 'DV013', 2, 'Nhuộm phủ bạc', 'Phủ bạc đều màu, tự nhiên và bền màu.', 600000.00, 100, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788362972/images_awy6ed.jpg', TRUE),
(14, 'DV014', 2, 'Nhuộm balayage', 'Nhuộm balayage chuyển màu tự nhiên.', 1200000.00, 180, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363002/images_ukzohr.jpg', TRUE),
(15, 'DV015', 2, 'Nhuộm highlight', 'Highlight tạo điểm nhấn và chiều sâu cho mái tóc.', 950000.00, 150, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363095/images_kp28fc.jpg', TRUE),
(16, 'DV016', 2, 'Nhuộm ombre', 'Nhuộm ombre chuyển màu từ đậm sang sáng.', 1100000.00, 170, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363154/images_bdkdle.jpg', TRUE),
(17, 'DV017', 3, 'Hấp dầu phục hồi', 'Hấp dầu bổ sung độ ẩm cho tóc khô xơ.', 350000.00, 60, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg', TRUE),
(18, 'DV018', 3, 'Chăm sóc da đầu', 'Làm sạch da đầu kết hợp massage thư giãn.', 300000.00, 50, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg', TRUE),
(19, 'DV019', 3, 'Detox da đầu', 'Làm sạch sâu da đầu và hỗ trợ giảm bã nhờn.', 400000.00, 60, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg', TRUE),
(20, 'DV020', 4, 'Phục hồi Keratin', 'Phục hồi độ mềm mượt cho tóc khô và hư tổn.', 800000.00, 120, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg', TRUE),
(21, 'DV021', 4, 'Phục hồi tóc tẩy', 'Phục hồi chuyên sâu cho tóc đã tẩy hoặc xử lý hóa chất.', 950000.00, 120, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg', TRUE),
(22, 'DV022', 4, 'Phục hồi protein', 'Bổ sung protein giúp tóc chắc khỏe và giảm xơ rối.', 750000.00, 90, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363217/images_vdwxcl.jpg', TRUE);

INSERT INTO supplier
(id, name, phone, email, address)
VALUES
(1, 'L''Oreal Professionnel Vietnam', '02830000001', 'supplier1@example.com', 'TP. Hồ Chí Minh'),
(2, 'Wella Vietnam', '02830000002', 'supplier2@example.com', 'TP. Hồ Chí Minh');

INSERT INTO product
(id, product_code, supplier_id, name, price, category_id, stock_quantity, min_stock_alert, image_url, is_active)
VALUES
(1, 'SP001', 1, 'L''Oreal Professionnel Serie Expert Absolut Repair Shampoo', 420000.00, 5, 30, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp', TRUE),
(2, 'SP002', 1, 'L''Oreal Professionnel Serie Expert Absolut Repair Conditioner', 450000.00, 5, 25, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp', TRUE),
(3, 'SP003', 1, 'L''Oreal Professionnel Serie Expert Metal Detox Shampoo', 520000.00, 5, 18, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp', TRUE),
(4, 'SP004', 1, 'L''Oreal Professionnel Serie Expert Metal Detox Mask', 620000.00, 5, 12, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp', TRUE),
(5, 'SP005', 1, 'L''Oreal Professionnel Serie Expert Vitamino Color Shampoo', 450000.00, 5, 22, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp', TRUE),
(6, 'SP006', 1, 'L''Oreal Professionnel Serie Expert Absolut Repair 10-in-1 Oil', 480000.00, 5, 15, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp', TRUE),
(7, 'SP007', 1, 'L''Oreal Professionnel Tecni.Art Fix Max Gel', 330000.00, 5, 20, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp', TRUE),
(8, 'SP008', 1, 'L''Oreal Professionnel Tecni.Art Savage Panache', 350000.00, 5, 14, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363295/shopping_janxzr.webp', TRUE),
(9, 'SP009', 2, 'Wella Professionals Invigo Nutri-Enrich Shampoo', 390000.00, 5, 28, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp', TRUE),
(10, 'SP010', 2, 'Wella Professionals Invigo Nutri-Enrich Conditioner', 410000.00, 5, 24, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp', TRUE),
(11, 'SP011', 2, 'Wella Professionals Fusion Shampoo', 430000.00, 5, 20, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp', TRUE),
(12, 'SP012', 2, 'Wella Professionals Fusion Intense Repair Mask', 560000.00, 5, 16, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp', TRUE),
(13, 'SP013', 2, 'Wella Professionals Oil Reflections Luminous Oil', 500000.00, 5, 18, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp', TRUE),
(14, 'SP014', 2, 'Wella Professionals EIMI Thermal Image', 420000.00, 5, 13, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp', TRUE),
(15, 'SP015', 2, 'Wella Professionals EIMI Extra Volume Mousse', 350000.00, 5, 17, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp', TRUE),
(16, 'SP016', 2, 'Wella Professionals EIMI Mistify Me Strong', 330000.00, 5, 19, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363470/shopping_jr7t2s.webp', TRUE),
(17, 'SP017', 1, 'Kérastase Nutritive Bain Satin Riche', 850000.00, 5, 10, 3, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363536/images_tq12my.jpg', TRUE),
(18, 'SP018', 1, 'Kérastase Nutritive Lait Vital Conditioner', 920000.00, 5, 8, 3, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363536/images_tq12my.jpg', TRUE),
(19, 'SP019', 1, 'Moroccanoil Treatment Original', 780000.00, 5, 11, 3, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363573/images_m5hv43.jpg', TRUE),
(20, 'SP020', 1, 'Olaplex No.3 Hair Perfector', 720000.00, 5, 9, 3, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363617/rpwgx0q5jxxdbqpfjlah.webp', TRUE),
(21, 'SP021', 1, 'Olaplex No.4 Bond Maintenance Shampoo', 690000.00, 5, 8, 3, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363617/rpwgx0q5jxxdbqpfjlah.webp', TRUE),
(22, 'SP022', 1, 'Olaplex No.5 Bond Maintenance Conditioner', 690000.00, 5, 7, 3, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363617/rpwgx0q5jxxdbqpfjlah.webp', TRUE),
(23, 'SP023', 2, 'Schwarzkopf Professional BC Bonacure Repair Rescue Shampoo', 450000.00, 5, 14, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363661/images_nqxi2r.jpg', TRUE),
(24, 'SP024', 2, 'Schwarzkopf Professional BC Bonacure Repair Rescue Treatment', 520000.00, 5, 12, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363661/images_nqxi2r.jpg', TRUE),
(25, 'SP025', 2, 'GATSBY Moving Rubber Spiky Edge', 160000.00, 5, 25, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363690/ixtxhuchwglspmdcf3af.jpg', TRUE),
(26, 'SP026', 2, 'GATSBY Moving Rubber Air Rise', 160000.00, 5, 23, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363690/ixtxhuchwglspmdcf3af.jpg', TRUE),
(27, 'SP027', 1, 'TRESemmé Keratin Smooth Shampoo', 220000.00, 5, 30, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363825/zvmmecrvkirxp7gpxad4.jpg', TRUE),
(28, 'SP028', 1, 'TRESemmé Keratin Smooth Conditioner', 230000.00, 5, 26, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363825/zvmmecrvkirxp7gpxad4.jpg', TRUE),
(29, 'SP029', 1, 'Sebastian Professional Potion 9', 650000.00, 5, 10, 3, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363867/images_gb8rt5.jpg', TRUE),
(30, 'SP030', 2, 'Schwarzkopf Professional Osis+ Dust It', 320000.00, 5, 16, 5, 'https://res.cloudinary.com/dlskx91gk/image/upload/v1788363894/images_me4m8v.jpg', TRUE);

INSERT INTO purchase_order
(id, supplier_id, order_date, total_amount, note, is_received)
VALUES
(1, 1, '2026-08-28 09:00:00', 8020000.00, 'Nhập dầu gội, dầu xả và sản phẩm chăm sóc tóc.', TRUE),
(2, 2, '2026-08-30 10:30:00', 5480000.00, 'Nhập sản phẩm phục hồi và tạo kiểu.', FALSE),
(3, 1, '2026-09-01 08:30:00', 5380000.00, 'Nhập thêm sản phẩm bán chạy.', TRUE);

INSERT INTO purchase_order_item
(id, purchase_order_id, product_id, quantity, import_price)
VALUES
(1, 1, 1, 10, 320000.00),
(2, 1, 2, 8, 340000.00),
(3, 1, 5, 6, 350000.00),
(4, 2, 9, 8, 300000.00),
(5, 2, 11, 6, 330000.00),
(6, 2, 12, 8, 340000.00),
(7, 2, 15, 8, 220000.00),
(8, 3, 19, 5, 550000.00),
(9, 3, 20, 4, 500000.00),
(10, 3, 21, 3, 580000.00);

INSERT INTO appointment
(id, appointment_code, customer_id, stylist_id, service_id, appointment_date, start_time, end_time, booking_amount, status, refund_amount, customer_note, stylist_note, created_at, payment_deadline)
VALUES
(1, 'APT001', 1, 1, 1, '2026-09-03', '10:00:00', '10:45:00', 180000.00, 'CONFIRMED', 0.00, 'Cắt ngắn hơn một chút.', NULL, '2026-09-01 09:00:00', '2026-09-03 09:00:00'),
(2, 'APT002', 2, 2, 20, '2026-09-04', '14:00:00', '16:00:00', 800000.00, 'COMPLETED', 0.00, 'Tóc hơi khô sau khi nhuộm.', 'Đã phục hồi theo liệu trình Keratin.', '2026-08-29 13:30:00', '2026-09-04 13:00:00'),
(3, 'APT003', 1, 2, 15, '2026-09-05', '10:00:00', '12:30:00', 950000.00, 'CONFIRMED', 0.00, 'Muốn highlight màu sáng tự nhiên.', NULL, '2026-09-01 11:30:00', '2026-09-05 09:00:00'),
(4, 'APT004', 2, 1, 9, '2026-09-05', '14:00:00', '16:00:00', 650000.00, 'CANCELLED', 650000.00, 'Không thể đến lịch đã đặt.', NULL, '2026-09-01 14:00:00', '2026-09-05 13:00:00'),
(5, 'APT005', 1, 1, 3, '2026-09-06', '09:30:00', '10:30:00', 220000.00, 'PENDING_PAYMENT', 0.00, 'Muốn layer nhẹ.', NULL, '2026-09-02 08:00:00', '2026-09-06 08:30:00'),
(6, 'APT006', 2, 2, 14, '2026-09-06', '13:00:00', '16:00:00', 1200000.00, 'CONFIRMED', 0.00, 'Màu balayage tự nhiên.', NULL, '2026-09-02 09:00:00', '2026-09-06 11:00:00'),
(7, 'APT007', 1, 1, 6, '2026-09-07', '15:00:00', '15:30:00', 120000.00, 'COMPLETED', 0.00, 'Gội và sấy nhẹ.', 'Khách hài lòng với kiểu sấy.', '2026-09-01 16:00:00', '2026-09-07 14:00:00');

INSERT INTO review
(id, appointment_id, rating, comment)
VALUES
(1, 2, 5, 'Nhân viên tư vấn tốt, tóc mềm mượt và phục hồi rõ rệt.'),
(2, 7, 4, 'Gội đầu sạch và nhân viên thân thiện.');

INSERT INTO invoice
(id, invoice_code, appointment_id, customer_id, sub_total, discount_amount, total_amount, refund_amount, refund_time, payment_method, payment_status, created_at)
VALUES
(1, 'INV001', 2, 2, 800000.00, 50000.00, 750000.00, 0.00, NULL, 'CASH', 'PAID', '2026-08-29 15:35:00'),
(2, 'INV002', 7, 1, 120000.00, 0.00, 120000.00, 0.00, NULL, 'CASH', 'PAID', '2026-09-07 15:35:00');

INSERT INTO invoice_item
(id, invoice_id, service_id, product_id, quantity, unit_price, total_price)
VALUES
(1, 1, 20, NULL, 1, 800000.00, 800000.00),
(2, 2, 6, NULL, 1, 120000.00, 120000.00);

INSERT INTO payment_transaction
(id, invoice_id, transaction_no, amount, payment_method, payment_status, transaction_time)
VALUES
(1, 1, 'TXN001', 750000.00, 'CASH', 'PAID', '2026-08-29 15:35:30'),
(2, 2, 'TXN002', 120000.00, 'CASH', 'PAID', '2026-09-07 15:35:30');

INSERT INTO notification
(id, user_id, title, message, is_read, created_at)
VALUES
(1, 2, 'Đặt lịch thành công', 'Lịch hẹn APT001 của bạn đã được xác nhận.', FALSE, '2026-09-01 09:05:00'),
(2, 3, 'Cảm ơn bạn', 'Cảm ơn bạn đã sử dụng dịch vụ tại salon.', TRUE, '2026-08-29 16:00:00'),
(3, 2, 'Ưu đãi tháng 9', 'Salon đang có ưu đãi cho dịch vụ chăm sóc và phục hồi tóc.', FALSE, '2026-09-01 17:00:00'),
(4, 3, 'Lịch hẹn sắp tới', 'Bạn có lịch hẹn vào ngày 06/09/2026.', FALSE, '2026-09-02 08:00:00');

INSERT INTO cart
(id, customer_id, created_at, updated_at)
VALUES
(1, 1, '2026-09-01 10:00:00', '2026-09-01 10:00:00'),
(2, 2, '2026-09-01 10:05:00', '2026-09-01 10:05:00');

INSERT INTO cart_item
(id, cart_id, product_id, quantity, added_at)
VALUES
(1, 1, 1, 2, '2026-09-01 10:01:00'),
(2, 1, 19, 1, '2026-09-01 10:02:00'),
(3, 1, 27, 2, '2026-09-01 10:03:00'),
(4, 2, 12, 1, '2026-09-01 10:06:00'),
(5, 2, 25, 2, '2026-09-01 10:07:00');

INSERT INTO product_order
(id, order_code, customer_id, sub_total, discount_amount, shipping_fee, total_amount, payment_method, payment_status, order_status, receiver_name, receiver_phone, shipping_address, note, created_at, updated_at)
VALUES
(1, 'ORD001', 1, 1420000.00, 50000.00, 30000.00, 1400000.00, 'CASH', 'PENDING', 'PENDING', 'Nguyễn An', '0900000002', 'Quận 6, TP. Hồ Chí Minh', 'Giao giờ hành chính.', '2026-09-01 11:00:00', '2026-09-01 11:00:00'),
(2, 'ORD002', 2, 1280000.00, 80000.00, 0.00, 1200000.00, 'CASH', 'PAID', 'CONFIRMED', 'Trần Bình', '0900000003', 'Quận 3, TP. Hồ Chí Minh', 'Gọi trước khi giao.', '2026-09-02 10:00:00', '2026-09-02 10:20:00');

INSERT INTO product_order_item
(id, order_id, product_id, quantity, unit_price, total_price, product_name)
VALUES
(1, 1, 1, 1, 420000.00, 420000.00, 'L''Oreal Professionnel Serie Expert Absolut Repair Shampoo'),
(2, 1, 19, 1, 780000.00, 780000.00, 'Moroccanoil Treatment Original'),
(3, 1, 27, 1, 220000.00, 220000.00, 'TRESemmé Keratin Smooth Shampoo'),
(4, 2, 12, 1, 560000.00, 560000.00, 'Wella Professionals Fusion Intense Repair Mask'),
(5, 2, 20, 1, 720000.00, 720000.00, 'Olaplex No.3 Hair Perfector');

INSERT INTO appointment_slot
(id, appointment_id, stylist_id, slot_date, slot_time)
VALUES
(1, 1, 1, '2026-09-03', '10:00:00'),
(2, 2, 2, '2026-09-04', '14:00:00'),
(3, 3, 2, '2026-09-05', '10:00:00'),
(4, 4, 1, '2026-09-05', '14:00:00'),
(5, 5, 1, '2026-09-06', '09:30:00'),
(6, 6, 2, '2026-09-06', '13:00:00'),
(7, 7, 1, '2026-09-07', '15:00:00');

