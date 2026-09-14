import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import cookies from "react-cookies";
import { clearSession, decodeToken, getRoleFromToken } from "./ProtectedRoute";
import "./Header.css";

const roleNames = {
  ADMIN: "Quản lý salon",
  RECEPTIONIST: "Lễ tân",
  STYLIST: "Stylist",
  CUSTOMER: "Khách hàng",
};

const dashboardMenus = {
  ADMIN: [
    ["Tổng quan", "/admin"],
    ["Người dùng", "/admin/users"],
    ["Lịch hẹn", "/admin/appointments"],
    ["Lịch làm việc", "/admin/schedules"],
    ["Dịch vụ", "/admin/services"],
    ["Sản phẩm & tồn kho", "/admin/products"],
    ["Nhập hàng", "/admin/purchase-orders"],
    ["Hóa đơn", "/admin/invoices"],
    ["Thống kê", "/admin/statistics"],
  ],

  RECEPTIONIST: [
    ["Tổng quan", "/receptionist"],
    ["Lịch hẹn", "/receptionist/appointments"],
    ["Khách hàng", "/receptionist/customers"],
    ["Hóa đơn & thanh toán", "/receptionist/invoices"],
    ["Lịch làm việc", "/receptionist/schedules"],
    ["Doanh thu", "/receptionist/revenue"],
  ],

  STYLIST: [
    ["Tổng quan", "/stylist"],
    ["Lịch hẹn", "/stylist/appointments"],
    ["Lịch của tôi", "/stylist/schedule"],
    ["Chấm công", "/stylist/attendance"],
    ["Khách hàng", "/stylist/customers"],
    ["Doanh thu", "/stylist/revenue"],
  ],
};

function UserIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c.7-3.4 3.2-5.4 7-5.4s6.3 2 7 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M3 4h2l2.1 10.1A2 2 0 0 0 9.1 16H18a2 2 0 0 0 1.9-1.4L22 8H6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="20" r="1" fill="currentColor" />
      <circle cx="18" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function Header({ role: dashboardRole, title }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const token = cookies.load("accessToken");
  const payload = token ? decodeToken(token) : null;
  const tokenRole = getRoleFromToken(payload);
  const role = dashboardRole || tokenRole;
  const email = payload?.email || payload?.sub || "";
  const isCustomer = role === "CUSTOMER";
  const isDashboard = ["ADMIN", "RECEPTIONIST", "STYLIST"].includes(dashboardRole);

  const logout = () => {
    clearSession();
    setOpen(false);
    navigate("/", { replace: true });
  };

  if (isDashboard) {
    const menus = dashboardMenus[role] || [];
    const home = role === "ADMIN" ? "/admin" : role === "RECEPTIONIST" ? "/receptionist" : "/stylist";

    return (
      <>
        <aside className="app-sidebar">
          <Link to={home} className="dashboard-brand">
            <span className="dashboard-brand-mark">HS</span>
            <span>
              <strong>HAIR SALON</strong>
              <small>{roleNames[role] || role}</small>
            </span>
          </Link>

          <nav className="dashboard-nav">
            <div className="dashboard-menu-label">MENU</div>
            {menus.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                end={path === home}
                className={({ isActive }) => `dashboard-nav-link ${isActive ? "active" : ""}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="dashboard-sidebar-bottom">
            <Link className="dashboard-profile-link" to={`/${role.toLowerCase()}/profile`}>
              <span className="dashboard-avatar">{(email || "U").charAt(0).toUpperCase()}</span>
              <span>
                <strong>{title || roleNames[role]}</strong>
                <small>{email}</small>
              </span>
            </Link>
            <button className="dashboard-logout" type="button" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </aside>

        <header className="dashboard-topbar">
          <div>
            <span>HAIR SALON MANAGEMENT</span>
            <strong>{title || roleNames[role]}</strong>
          </div>
          <Link to={`/${role.toLowerCase()}/profile`} className="dashboard-topbar-user">
            <UserIcon size={19} />
            <span>{email || "Tài khoản"}</span>
          </Link>
        </header>
      </>
    );
  }

  const profilePath = role ? `/${role.toLowerCase()}/profile` : "/login";

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo">
          <span className="site-logo-main">HAIR SALON</span>
          <span className="site-logo-sub">BEAUTY &amp; STYLE</span>
        </Link>

        <nav className="site-nav">
          <NavLink to="/" end>TRANG CHỦ</NavLink>
          <NavLink to="/services">DỊCH VỤ</NavLink>
          <NavLink to="/stylists">STYLIST</NavLink>
          <NavLink to="/products">SẢN PHẨM</NavLink>
          <NavLink to="/appointments/book">ĐẶT LỊCH</NavLink>
        </nav>

        <div className="site-actions">
          {isCustomer && (
            <Link to="/customer/cart" className="header-action-icon" title="Giỏ hàng">
              <CartIcon />
            </Link>
          )}

          <div className="header-account">
            <button
              type="button"
              className="header-action-icon"
              onClick={() => {
                if (!token) {
                  navigate("/login");
                  return;
                }
                setOpen((value) => !value);
              }}
              title="Tài khoản"
            >
              <UserIcon />
            </button>

            {token && role && open && (
              <div className="header-dropdown">
                <div className="header-dropdown-user">
                  <div className="header-dropdown-icon"><UserIcon size={21} /></div>
                  <div>
                    <strong>{email || "Tài khoản"}</strong>
                    <span>{roleNames[role] || role}</span>
                  </div>
                </div>
                <Link to={profilePath} onClick={() => setOpen(false)}>Thông tin cá nhân</Link>
                <Link to={isCustomer ? "/customer" : `/${role.toLowerCase()}`} onClick={() => setOpen(false)}>
                  Khu vực của tôi
                </Link>
                {isCustomer && (
                  <Link to="/customer/cart" onClick={() => setOpen(false)}>Giỏ hàng</Link>
                )}
                <button type="button" onClick={logout}>Đăng xuất</button>
              </div>
            )}

            {!token && (
              <Link to="/login" className="header-login-text">ĐĂNG NHẬP</Link>
            )}
          </div>

          <Link to="/appointments/book" className="header-book">ĐẶT LỊCH</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
