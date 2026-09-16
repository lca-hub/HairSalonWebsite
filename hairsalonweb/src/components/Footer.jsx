import { NavLink } from "react-router-dom";
import "./Footer.css";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M6.5 3.5l3 2.5-1.8 3.2c1 2 2.6 3.6 4.6 4.6l3.2-1.8 2.5 3c.5.6.4 1.5-.2 2l-1.4 1.1c-.7.6-1.7.8-2.6.5-5.7-1.8-10.1-6.2-11.9-11.9-.3-.9-.1-1.9.5-2.6l1.1-1.4c.5-.6 1.4-.7 2-.2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="salon-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>HAIR</span>
            <small>SALON</small>
          </div>

          <p className="footer-description">
            Nơi phong cách của bạn được chăm sóc bằng sự tận tâm và chuyên
            nghiệp.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <FacebookIcon />
            </a>

            <a href="#" aria-label="Instagram">
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>KHÁM PHÁ</h3>

          <NavLink to="/">Trang chủ</NavLink>

          <NavLink to="/services">Dịch vụ</NavLink>

          <NavLink to="/stylists">Stylist</NavLink>

          <NavLink to="/products">Sản phẩm</NavLink>
        </div>

        <div className="footer-column">
          <h3>DỊCH VỤ KHÁCH HÀNG</h3>

          <NavLink to="/appointments/book">Đặt lịch hẹn</NavLink>

          <NavLink to="/customer/appointments">Lịch hẹn của tôi</NavLink>

          <NavLink to="/customer/profile">Hồ sơ cá nhân</NavLink>

          <NavLink to="/customer/notifications">Thông báo</NavLink>
        </div>

        <div className="footer-column footer-contact">
          <h3>LIÊN HỆ</h3>

          <div className="contact-item">
            <LocationIcon />

            <span>
              123 Nguyễn Trãi,
              <br />
              Quận 1, TP. Hồ Chí Minh
            </span>
          </div>

          <div className="contact-item">
            <PhoneIcon />

            <span>0909 123 456</span>
          </div>

          <div className="contact-item">
            <span className="contact-symbol">@</span>

            <span>info@hairsalon.vn</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <span>
            © {new Date().getFullYear()} HAIR SALON. All rights reserved.
          </span>

          <div className="footer-policy">
            <a href="#">Chính sách bảo mật</a>

            <a href="#">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
