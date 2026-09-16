import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { authApis, endpoints } from "../../configs/api/Apis";
import "../../styles/admin/AdminCommon.css";
import "./ReceptionistDashboard.css";

const APPOINTMENT_STATUS_LABELS = {
    PENDING_PAYMENT: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    IN_SERVICE: "Đang phục vụ",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    NO_SHOW: "Không đến",
    EXPIRED: "Hết hạn",
};

function normalizeArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.content)) return data.data.content;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.result?.content)) return data.result.content;
    return [];
}

function formatMoney(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatTime(value) {
    if (!value) return "--";

    if (typeof value === "string") {
        return value.length >= 5 ? value.substring(0, 5) : value;
    }

    return "--";
}

function getCustomerName(appointment) {
    return appointment.customerName || appointment.customer?.name || appointment.customer?.fullName || "Khách hàng";
}

function getStylistName(appointment) {
    return appointment.stylistName || appointment.stylist?.name || appointment.stylist?.fullName || "Stylist";
}

function getServiceName(appointment) {
    if (appointment.serviceName) return appointment.serviceName;

    if (Array.isArray(appointment.services) && appointment.services.length > 0) {
        return appointment.services.map((service) => service.name).join(", ");
    }

    if (Array.isArray(appointment.appointmentServices) && appointment.appointmentServices.length > 0) {
        return appointment.appointmentServices.map((item) => item.serviceName || item.service?.name).filter(Boolean).join(", ");
    }

    if (appointment.service?.name) return appointment.service.name;

    return "Dịch vụ";
}

function getStatusLabel(status) {
    return APPOINTMENT_STATUS_LABELS[status] || status || "--";
}

function getStatusClass(status) {
    return String(status || "").toLowerCase();
}

function getToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
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

    if (type === "calendar") {
        return (
            <svg {...common}>
                <rect x="3" y="4.5" width="18" height="16" rx="2" />
                <path d="M8 2.5v4M16 2.5v4M3 9h18" />
                <path d="M8 13h3M8 16h5" />
            </svg>
        );
    }

    if (type === "clock") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7v5l3 2" />
            </svg>
        );
    }

    if (type === "check") {
        return (
            <svg {...common}>
                <path d="m5 12 4 4L19 6" />
            </svg>
        );
    }

    if (type === "money") {
        return (
            <svg {...common}>
                <path d="M12 3v18M7 7h7a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h7" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <circle cx="12" cy="8" r="3" />
            <path d="M5 20c.8-3.5 3.1-5.5 7-5.5s6.2 2 7 5.5" />
        </svg>
    );
}

function ReceptionistDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const today = getToday();

            const [appointmentsResponse, invoicesResponse] = await Promise.all([
                authApis().get(endpoints.adminAppointments, {
                    params: {
                        date: today,
                        page: 0,
                        size: 1000,
                    },
                }),
                authApis().get(endpoints.adminInvoices, {
                    params: {
                        paymentStatus: "PAID",
                        from: `${today}T00:00:00`,
                        to: `${today}T23:59:59`,
                        page: 0,
                        size: 1000,
                    },
                }),
            ]);

            setAppointments(normalizeArray(appointmentsResponse.data));

            const invoices = normalizeArray(invoicesResponse.data);

            const totalRevenue = invoices.reduce(
                (total, invoice) => total + Number(invoice.totalAmount || 0),
                0
            );

            setRevenue(totalRevenue);
        } catch (err) {
            console.error("LOAD RECEPTIONIST DASHBOARD ERROR:", err);

            setAppointments([]);
            setRevenue(0);

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

    const stats = useMemo(() => {
        const total = appointments.length;

        const pendingPayment = appointments.filter(
            (appointment) => String(appointment.status || "").toUpperCase() === "PENDING_PAYMENT"
        ).length;

        const inService = appointments.filter(
            (appointment) => String(appointment.status || "").toUpperCase() === "IN_SERVICE"
        ).length;

        const completed = appointments.filter(
            (appointment) => String(appointment.status || "").toUpperCase() === "COMPLETED"
        ).length;

        return {
            total,
            pendingPayment,
            inService,
            completed,
        };
    }, [appointments]);

    const displayAppointments = useMemo(() => {
        return [...appointments].sort((first, second) => {
            const firstTime = first.startTime || first.appointmentTime || "99:99";
            const secondTime = second.startTime || second.appointmentTime || "99:99";

            return String(firstTime).localeCompare(String(secondTime));
        });
    }, [appointments]);

    const stylistStats = useMemo(() => {
        const map = new Map();

        appointments.forEach((appointment) => {
            const stylistName = getStylistName(appointment);

            map.set(
                stylistName,
                (map.get(stylistName) || 0) + 1
            );
        });

        return Array.from(map.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((first, second) => second.count - first.count);
    }, [appointments]);

    const todayLabel = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className="admin-page receptionist-dashboard-page">
            <Header role="RECEPTIONIST" title="Tổng quan" />

            <main className="admin-main receptionist-dashboard-main">
                <div className="admin-shell receptionist-dashboard-shell">

                    <section className="admin-heading receptionist-dashboard-heading">
                        <div>
                            <span className="admin-section-eyebrow">RECEPTION MANAGEMENT</span>
                            <h1>Tổng quan</h1>
                            <p>Theo dõi tình hình lịch hẹn, phục vụ và doanh thu của salon trong ngày.</p>
                        </div>

                        <div className="receptionist-dashboard-date">{todayLabel}</div>
                    </section>

                    <section className="receptionist-dashboard-welcome">
                        <div>
                            <span>STORE OVERVIEW</span>
                            <h2>Tình hình hoạt động hôm nay</h2>
                            <p>Kiểm tra nhanh lịch hẹn và tình trạng phục vụ của toàn bộ salon.</p>
                        </div>

                        <div className="receptionist-dashboard-welcome-actions">
                            <Link to="/receptionist/appointments" className="admin-primary-button">LỊCH HẸN</Link>
                            <Link to="/receptionist/invoices" className="admin-secondary-button">HÓA ĐƠN</Link>
                        </div>
                    </section>

                    {error && (
                        <div className="receptionist-dashboard-error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={loadDashboard}>Thử lại</button>
                        </div>
                    )}

                    <section className="admin-kpi-grid receptionist-dashboard-kpi-grid">

                        <article className="admin-kpi-card">
                            <div className="admin-kpi-top">
                                <div>
                                    <span className="admin-kpi-title">Lịch hẹn hôm nay</span>
                                    <strong className="admin-kpi-value">{loading ? "..." : stats.total}</strong>
                                </div>

                                <div className="admin-kpi-icon admin-kpi-icon-calendar">
                                    <DashboardIcon type="calendar" />
                                </div>
                            </div>
                        </article>

                        <article className="admin-kpi-card">
                            <div className="admin-kpi-top">
                                <div>
                                    <span className="admin-kpi-title">Chờ thanh toán</span>
                                    <strong className="admin-kpi-value">{loading ? "..." : stats.pendingPayment}</strong>
                                </div>

                                <div className="admin-kpi-icon admin-kpi-icon-money">
                                    <DashboardIcon type="money" />
                                </div>
                            </div>
                        </article>

                        <article className="admin-kpi-card">
                            <div className="admin-kpi-top">
                                <div>
                                    <span className="admin-kpi-title">Đang phục vụ</span>
                                    <strong className="admin-kpi-value">{loading ? "..." : stats.inService}</strong>
                                </div>

                                <div className="admin-kpi-icon admin-kpi-icon-calendar">
                                    <DashboardIcon type="clock" />
                                </div>
                            </div>
                        </article>

                        <article className="admin-kpi-card">
                            <div className="admin-kpi-top">
                                <div>
                                    <span className="admin-kpi-title">Hoàn thành</span>
                                    <strong className="admin-kpi-value">{loading ? "..." : stats.completed}</strong>
                                </div>

                                <div className="admin-kpi-icon admin-kpi-icon-money">
                                    <DashboardIcon type="check" />
                                </div>
                            </div>
                        </article>

                    </section>

                    <section className="receptionist-dashboard-revenue-card">
                        <div>
                            <span className="receptionist-dashboard-card-eyebrow">TODAY'S REVENUE</span>
                            <h2>Doanh thu hôm nay</h2>
                            <p>Tổng giá trị các hóa đơn đã thanh toán trong ngày.</p>
                        </div>

                        <div className="receptionist-dashboard-revenue-value">
                            <DashboardIcon type="money" />
                            <strong>{loading ? "..." : formatMoney(revenue)}</strong>
                        </div>
                    </section>

                    <div className="receptionist-dashboard-grid">

                        <section className="admin-section-card receptionist-dashboard-appointments-card">
                            <div className="admin-section-heading">
                                <div>
                                    <span className="admin-section-eyebrow">TODAY'S APPOINTMENTS</span>
                                    <h2>Lịch hẹn hôm nay</h2>
                                </div>

                                <Link to="/receptionist/appointments" className="receptionist-dashboard-section-link">Xem tất cả →</Link>
                            </div>

                            {loading ? (
                                <div className="receptionist-dashboard-empty">Đang tải lịch hẹn...</div>
                            ) : displayAppointments.length === 0 ? (
                                <div className="receptionist-dashboard-empty">
                                    <strong>Hôm nay chưa có lịch hẹn</strong>
                                    <span>Chưa có lịch nào được ghi nhận.</span>
                                </div>
                            ) : (
                                <div className="receptionist-dashboard-appointments">
                                    {displayAppointments.slice(0, 10).map((appointment) => {
                                        const status = String(appointment.status || "").toUpperCase();

                                        return (
                                            <Link key={appointment.id} to={`/receptionist/appointments/${appointment.id}`} className="receptionist-dashboard-appointment">
                                                <div className="receptionist-dashboard-appointment-time">
                                                    <strong>{formatTime(appointment.startTime)}</strong>
                                                    <span>{formatTime(appointment.endTime)}</span>
                                                </div>

                                                <div className="receptionist-dashboard-appointment-main">
                                                    <strong>{getCustomerName(appointment)}</strong>
                                                    <span>{getServiceName(appointment)}</span>
                                                </div>

                                                <div className="receptionist-dashboard-appointment-stylist">
                                                    <span>STYLIST</span>
                                                    <strong>{getStylistName(appointment)}</strong>
                                                </div>

                                                <span className={`receptionist-dashboard-status receptionist-dashboard-status-${getStatusClass(status)}`}>
                                                    {getStatusLabel(status)}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <aside className="receptionist-dashboard-side">

                            <section className="admin-section-card receptionist-dashboard-stylist-card">
                                <div className="admin-section-heading">
                                    <div>
                                        <span className="admin-section-eyebrow">TODAY</span>
                                        <h2>Lịch theo stylist</h2>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="receptionist-dashboard-small-empty">Đang tải...</div>
                                ) : stylistStats.length === 0 ? (
                                    <div className="receptionist-dashboard-small-empty">Chưa có dữ liệu.</div>
                                ) : (
                                    <div className="receptionist-dashboard-stylist-list">
                                        {stylistStats.map((item) => (
                                            <div key={item.name} className="receptionist-dashboard-stylist-row">
                                                <span>{item.name}</span>
                                                <strong>{item.count} lịch</strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="admin-section-card receptionist-dashboard-quick-card">
                                <div className="admin-section-heading">
                                    <div>
                                        <span className="admin-section-eyebrow">QUICK ACCESS</span>
                                        <h2>Truy cập nhanh</h2>
                                    </div>
                                </div>

                                <div className="receptionist-dashboard-quick-links">
                                    <Link to="/receptionist/appointments">
                                        <strong>Lịch hẹn</strong>
                                        <span>Quản lý và xác nhận lịch →</span>
                                    </Link>

                                    <Link to="/receptionist/customers">
                                        <strong>Khách hàng</strong>
                                        <span>Tra cứu thông tin khách →</span>
                                    </Link>

                                    <Link to="/receptionist/invoices">
                                        <strong>Hóa đơn & thanh toán</strong>
                                        <span>Kiểm tra thanh toán →</span>
                                    </Link>

                                    <Link to="/receptionist/schedules">
                                        <strong>Lịch của tôi</strong>
                                        <span>Xem lịch làm việc →</span>
                                    </Link>
                                </div>
                            </section>

                        </aside>
                    </div>

                    <section className="receptionist-dashboard-footer-card">
                        <div>
                            <span className="admin-section-eyebrow">RECEPTION WORKFLOW</span>
                            <h2>Quy trình làm việc</h2>
                            <p>Lễ tân theo dõi lịch hẹn, hỗ trợ xác nhận và thanh toán, đồng thời kiểm tra tình trạng phục vụ của salon trong ngày.</p>
                        </div>

                        <div className="receptionist-dashboard-workflow">
                            <span>BOOKING</span>
                            <b>→</b>
                            <span>CONFIRMED</span>
                            <b>→</b>
                            <span>IN SERVICE</span>
                            <b>→</b>
                            <span>COMPLETED</span>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}

export default ReceptionistDashboard;