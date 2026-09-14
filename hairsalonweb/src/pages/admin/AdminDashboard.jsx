import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import cookies from "react-cookies";
import { authApis, endpoints } from "../../configs/api/Apis";
import "../../styles/admin/AdminCommon.css";
import "./AdminDashboard.css";

const quickLinks = [
    ["Người dùng", "Tạo và quản lý tài khoản hệ thống.", "/admin/users"],
    ["Stylist", "Quản lý hồ sơ stylist và nhân viên.", "/admin/stylists"],
    ["Dịch vụ", "Quản lý dịch vụ, giá và trạng thái.", "/admin/services"],
    ["Lịch hẹn", "Theo dõi và xử lý lịch hẹn của salon.", "/admin/appointments"],
    ["Sản phẩm", "Quản lý sản phẩm và tồn kho.", "/admin/products"],
    ["Nhập hàng", "Quản lý nhà cung cấp và phiếu nhập.", "/admin/purchase-orders"],
    ["Hóa đơn", "Theo dõi hóa đơn và thanh toán tại salon.", "/admin/invoices"],
    ["Thống kê", "Xem báo cáo, doanh thu và hiệu suất.", "/admin/statistics"],
];

const KPI_CONFIG = [
    {
        key: "customers",
        title: "Khách hàng",
        icon: "users",
        candidates: ["totalCustomers", "customerCount", "customersCount", "totalCustomer", "customerTotal"],
    },
    {
        key: "stylists",
        title: "Stylist",
        icon: "scissors",
        candidates: ["totalStylists", "stylistCount", "stylistsCount", "totalStylist", "stylistTotal"],
    },
    {
        key: "todayAppointments",
        title: "Lịch hẹn hôm nay",
        icon: "calendar",
        candidates: ["todayAppointments", "appointmentsToday", "todayAppointmentCount", "todayAppointmentsCount", "appointmentToday"],
    },
    {
        key: "revenue",
        title: "Doanh thu",
        icon: "money",
        candidates: ["totalRevenue", "revenue", "revenueTotal", "todayRevenue", "monthlyRevenue"],
    },
];

function unwrapResponse(data) {
    if (data && typeof data === "object") {
        if (data.data && typeof data.data === "object") return data.data;
        if (data.result && typeof data.result === "object") return data.result;
        if (data.content && typeof data.content === "object" && !Array.isArray(data.content)) return data.content;
    }

    return data;
}

function findValue(source, candidates) {
    if (!source || typeof source !== "object") return null;

    const normalized = new Map();

    const visit = (value, depth = 0) => {
        if (!value || typeof value !== "object" || depth > 3) return;

        Object.entries(value).forEach(([key, current]) => {
            normalized.set(key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(), current);
            if (current && typeof current === "object") visit(current, depth + 1);
        });
    };

    visit(source);

    for (const candidate of candidates) {
        const value = normalized.get(candidate.replace(/[^a-zA-Z0-9]/g, "").toLowerCase());
        if (value !== undefined && value !== null) return value;
    }

    return null;
}

function toNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
        const parsed = Number(value.replace(/[^0-9.-]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function formatNumber(value) {
    return toNumber(value).toLocaleString("vi-VN");
}

function formatMoney(value) {
    return `${toNumber(value).toLocaleString("vi-VN")}đ`;
}

function getAdminName() {
    return cookies.load("fullname") || cookies.load("email") || "Quản trị viên";
}

function DashboardIcon({ type }) {
    const common = {
        width: 22,
        height: 22,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.7,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };

    if (type === "users") {
        return (
            <svg {...common}>
                <path d="M16 21v-1.7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V21" />
                <circle cx="9.5" cy="7" r="3.3" />
                <path d="M17 11a3 3 0 1 0-1.2-5.8" />
                <path d="M21 21v-1.5a4 4 0 0 0-2.9-3.8" />
            </svg>
        );
    }

    if (type === "scissors") {
        return (
            <svg {...common}>
                <circle cx="6" cy="6" r="2.2" />
                <circle cx="6" cy="18" r="2.2" />
                <path d="m8 7 12 12M8 17 20 5" />
            </svg>
        );
    }

    if (type === "calendar") {
        return (
            <svg {...common}>
                <rect x="3" y="4.5" width="18" height="16" rx="2" />
                <path d="M8 2.5v4M16 2.5v4M3 9h18" />
                <path d="M8 13h3M8 16h5" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <path d="M12 2v20M16.5 6.5h-7a2 2 0 0 0 0 5h5a2 2 0 0 1 0 5h-7" />
        </svg>
    );
}

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(endpoints.adminStatistics);
            console.log("ADMIN DASHBOARD RESPONSE:", response.data);
            setDashboard(unwrapResponse(response.data));
        } catch (err) {
            console.error("LOAD ADMIN DASHBOARD ERROR:", err);
            setDashboard(null);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể tải dữ liệu dashboard."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const kpis = useMemo(
        () =>
            KPI_CONFIG.map((item) => ({
                ...item,
                value: findValue(dashboard, item.candidates),
            })),
        [dashboard]
    );

    const displayName = getAdminName();

    const today = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className="admin-page admin-dashboard-page">
            <Header role="ADMIN" title="Dashboard" />

            <main className="admin-main admin-dashboard-main">
                <div className="admin-shell admin-dashboard-shell">
                    <section className="admin-heading admin-dashboard-heading">
                        <div>
                            <div className="admin-dashboard-eyebrow">HAIR SALON MANAGEMENT</div>
                            <h1>Dashboard</h1>
                            <p>Tổng quan hoạt động salon và các chỉ số quan trọng.</p>
                        </div>
                        <div className="admin-dashboard-date">{today}</div>
                    </section>

                    <section className="admin-welcome-box">
                        <div>
                            <span className="admin-welcome-label">WELCOME BACK</span>
                            <h2>Xin chào, {displayName}</h2>
                            <p>Chúc bạn một ngày làm việc hiệu quả tại Hair Salon.</p>
                        </div>
                        <Link to="/admin/appointments" className="admin-primary-button">Xem lịch hẹn</Link>
                    </section>

                    {error && (
                        <div className="admin-dashboard-error" role="alert">
                            <div>
                                <strong>Không tải được dữ liệu dashboard</strong>
                                <span>{error}</span>
                            </div>
                            <button type="button" onClick={loadDashboard}>Thử lại</button>
                        </div>
                    )}

                    <section className="admin-kpi-grid">
                        {kpis.map((item) => {
                            const numericValue = toNumber(item.value);
                            const isRevenue = item.key === "revenue";

                            return (
                                <article className="admin-kpi-card" key={item.key}>
                                    <div className="admin-kpi-top">
                                        <div>
                                            <span className="admin-kpi-title">{item.title}</span>
                                            <strong className="admin-kpi-value">
                                                {loading ? "..." : isRevenue ? formatMoney(numericValue) : formatNumber(numericValue)}
                                            </strong>
                                        </div>
                                        <div className={`admin-kpi-icon admin-kpi-icon-${item.icon}`}>
                                            <DashboardIcon type={item.icon} />
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <section className="admin-section-card">
                        <div className="admin-section-heading">
                            <div>
                                <span className="admin-section-eyebrow">QUICK ACCESS</span>
                                <h2>Quản lý nhanh</h2>
                            </div>
                            <span>Truy cập nhanh các chức năng quản trị chính.</span>
                        </div>

                        <div className="admin-quick-grid">
                            {quickLinks.map(([title, description, path]) => (
                                <Link className="admin-quick-card" key={path} to={path}>
                                    <strong>{title}</strong>
                                    <p>{description}</p>
                                    <span>Mở chức năng →</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="admin-dashboard-footer-card">
                        <div>
                            <span className="admin-section-eyebrow">NEXT</span>
                            <h2>Thống kê chi tiết</h2>
                            <p>
                                Dashboard tổng quan đã nối với API. Phần biểu đồ doanh thu, trạng thái lịch hẹn,
                                top dịch vụ và hiệu suất stylist sẽ được hiển thị trong trang Thống kê.
                            </p>
                        </div>
                        <Link to="/admin/statistics" className="admin-secondary-button">Mở thống kê</Link>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;