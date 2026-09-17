# HairSalonWebsite

Hệ thống đặt lịch hẹn làm tóc trực tuyến giúp khách hàng tìm hiểu các dịch vụ của salon, xem thông tin stylist, lựa chọn lịch làm tóc, đặt lịch hẹn, thanh toán trực tuyến và quản lý lịch sử sử dụng dịch vụ. Hệ thống đồng thời hỗ trợ lễ tân và quản trị viên quản lý hoạt động của salon.
Đây là website của đồ án: [https://hairsalon-0io0.onrender.com/](https://hairsalon-0io0.onrender.com/)

## Chức năng

- Xem danh sách dịch vụ làm tóc của salon.
- Xem thông tin stylist, dịch vụ và lịch làm việc của stylist.
- Đăng ký và đăng nhập tài khoản khách hàng.
- Đặt lịch hẹn bằng cách chọn stylist, dịch vụ, ngày và khung giờ.
- Thanh toán lịch hẹn thông qua VNPay.
- Xem lịch sử đặt lịch và lịch sử sử dụng dịch vụ.
- Quản lý thông tin cá nhân và mật khẩu.
- Xem và mua các sản phẩm của salon.
- Quản lý giỏ hàng và đơn hàng sản phẩm.
- Nhận thông báo về lịch hẹn, thanh toán và đơn hàng.
- Chức năng lễ tân: quản lý khách hàng, bán sản phẩm, quản lý hóa đơn và lịch hẹn.
- Chức năng quản trị viên: quản lý người dùng, dịch vụ, stylist, lịch làm việc, sản phẩm, nhà cung cấp, chấm công, đơn hàng, hóa đơn và thống kê.
- Tích hợp Cloudinary để lưu trữ hình ảnh dịch vụ, stylist, sản phẩm và ảnh đại diện.
- Thông báo thời gian thực bằng WebSocket và STOMP.

## Công nghệ sử dụng

### Backend

- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate ORM
- JWT Authentication
- Refresh Token
- WebSocket
- STOMP
- MySQL
- Cloudinary
- JavaMail
- VNPay

### Frontend

- React
- React Router
- Axios
- Redux Toolkit
- Bootstrap
- React Hook Form
- Zod

## Cấu trúc dự án

```text
HairSalonWebsite/
├─ Database/              # Cơ sở dữ liệu và các script SQL
├─ HairSalonApp/          # Backend Spring Boot
└─ hairsalonweb/          # Frontend React
```

## Yêu cầu

- Java 21 trở lên
- Node.js và npm
- MySQL 8.0 trở lên
- Git
- Cài đặt
- Clone repository.
- Tạo cơ sở dữ liệu salondb bằng file SQL trong thư mục Database.
- Cấu hình các biến môi trường cho backend bao gồm cơ sở dữ liệu, email, Cloudinary và VNPay.
- Chạy backend Spring Boot.
- Di chuyển vào thư mục hairsalonweb và cài đặt các package bằng npm install.
- Cấu hình file .env cho frontend theo file .env.example.
- Chạy frontend bằng lệnh npm run dev.

## Triển khai

- Frontend: Render Static Site
- Backend: Render Web Service
- Database: Aiven MySQL
- Lưu trữ hình ảnh: Cloudinary
