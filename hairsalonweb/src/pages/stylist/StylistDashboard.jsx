import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { authApis, endpoints } from "../../configs/api/Apis";
import "../../styles/admin/AdminCommon.css";
import "./StylistDashboard.css";

const APPOINTMENT_STATUS_LABELS = {
    PENDING_PAYMENT: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    IN_SERVICE: "Đang phục vụ",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    NO_SHOW: "Không đến",
    EXPIRED: "Hết hạn",
};

const ATTENDANCE_STATUS_LABELS = {
    PRESENT: "Có mặt",
    LATE: "Đi trễ",
    ABSENT: "Vắng",
    LEAVE: "Nghỉ phép",
};

const REVENUE_TYPE_LABELS = {
    MONTH: "THEO THÁNG",
    QUARTER: "THEO QUÝ",
    YEAR: "THEO NĂM",
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

function unwrapData(data) {
    if (data?.data && typeof data.data === "object" && !Array.isArray(data.data)) {
        return data.data;
    }

    if (data?.result && typeof data.result === "object" && !Array.isArray(data.result)) {
        return data.result;
    }

    return data;
}

function formatDateTime(value) {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatTime(value) {
    if (!value) return "--";

    if (typeof value === "string") {
        return value.length >= 5 ? value.substring(0, 5) : value;
    }

    return "--";
}

function formatMoney(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
}

function getCustomerName(appointment) {
    return appointment.customerName || appointment.customer?.name || appointment.customer?.fullName || "Khách hàng";
}

function getServiceName(appointment) {
    if (appointment.serviceName) return appointment.serviceName;

    if (Array.isArray(appointment.services) && appointment.services.length > 0) {
        return appointment.services.map((service) => service.name).join(", ");
    }

    if (Array.isArray(appointment.appointmentServices) && appointment.appointmentServices.length > 0) {
        return appointment.appointmentServices.map((item) => item.serviceName || item.service?.name).filter(Boolean).join(", ");
    }

    return "Dịch vụ";
}

function getStatusLabel(status) {
    return APPOINTMENT_STATUS_LABELS[status] || status || "--";
}

function getStatusClass(status) {
    return String(status || "").toLowerCase();
}

function getAttendanceLabel(status) {
    return ATTENDANCE_STATUS_LABELS[status] || status || "Chưa chấm công";
}

function getStylistName() {
    return localStorage.getItem("stylistName") || "Stylist";
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

    if (type === "service") {
        return (
            <svg {...common}>
                <circle cx="6" cy="6" r="2.2" />
                <circle cx="6" cy="18" r="2.2" />
                <path d="m8 7 12 12M8 17 20 5" />
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
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

function StylistDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [attendance, setAttendance] = useState(null);

    const [revenueType, setRevenueType] = useState("MONTH");
    const [revenueData, setRevenueData] = useState(null);
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [revenueError, setRevenueError] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);

    const loadRevenue = useCallback(async (type) => {
        try {
            setRevenueLoading(true);
            setRevenueError("");

            const currentYear = new Date().getFullYear();

            const response = await authApis().get(endpoints.stylistRevenue, {
                params: {
                    statsType: type,
                    year: currentYear,
                },
            });

            setRevenueData(unwrapData(response.data));
        } catch (err) {
            console.error("LOAD STYLIST REVENUE ERROR:", err);

            setRevenueData(null);
            setRevenueError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể tải doanh thu."
            );
        } finally {
            setRevenueLoading(false);
        }
    }, []);

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [appointmentsResponse, attendanceResponse] = await Promise.all([
                authApis().get(endpoints.stylistAppointments, {
                    params: {
                        page: 0,
                        size: 1000,
                    },
                }),
                authApis().get(endpoints.stylistTodayAttendance),
            ]);

            const allAppointmentsData = appointmentsResponse.data;
            const allAppointments = normalizeArray(allAppointmentsData);

            const vietnamToday = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(new Date());

            const todayAppointments = allAppointments.filter((appointment) => {
                const appointmentDate = appointment.appointmentDate || appointment.date || appointment.workDate;
                return String(appointmentDate || "").substring(0, 10) === vietnamToday;
            });

            setAppointments(todayAppointments);
            setTotalAppointments(Number(allAppointmentsData?.totalElements || allAppointments.length || 0));
            setAttendance(unwrapData(attendanceResponse.data));
        } catch (err) {
            console.error("LOAD STYLIST DASHBOARD ERROR:", err);

            setAppointments([]);
            setTotalAppointments(0);
            setAttendance(null);

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

    useEffect(() => {
        loadRevenue("MONTH");
    }, [loadRevenue]);

    const handleRevenueTypeChange = (type) => {
        setRevenueType(type);
        loadRevenue(type);
    };

    const stats = useMemo(() => {
        const todayAppointments = appointments.length;

        const inService = appointments.filter(
            (appointment) => String(appointment.status || "").toUpperCase() === "IN_SERVICE"
        ).length;

        const completed = appointments.filter(
            (appointment) => String(appointment.status || "").toUpperCase() === "COMPLETED"
        ).length;

        return {
            totalAppointments,
            todayAppointments,
            inService,
            completed,
        };
    }, [appointments, totalAppointments]);

    const revenuePeriods = useMemo(() => {
        return Array.isArray(revenueData?.periodData) ? revenueData.periodData : [];
    }, [revenueData]);

    const maxRevenue = useMemo(() => {
        if (revenuePeriods.length === 0) return 0;

        return Math.max(
            ...revenuePeriods.map((item) => Number(item.revenue || 0)),
            0
        );
    }, [revenuePeriods]);

    const revenueTotal = useMemo(() => {
        if (revenueType === "YEAR") {
            return Number(revenueData?.totalRevenue || 0);
        }

        return revenuePeriods.reduce(
            (total, item) => total + Number(item.revenue || 0),
            0
        );
    }, [revenueData, revenuePeriods, revenueType]);

    const attendanceStatus = String(
        attendance?.attendanceStatus ||
        attendance?.status ||
        ""
    ).toUpperCase();

    const hasCheckedIn = Boolean(
        attendance?.checkInTime ||
        attendance?.checkInAt
    );

    const hasCheckedOut = Boolean(
        attendance?.checkOutTime ||
        attendance?.checkOutAt
    );

    const handleCheckIn = async () => {
        try {
            setCheckingIn(true);
            setError("");

            const response = await authApis().post(endpoints.stylistCheckIn);

            setAttendance(unwrapData(response.data));
        } catch (err) {
            console.error("STYLIST CHECK IN ERROR:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể chấm công vào."
            );
        } finally {
            setCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setCheckingOut(true);
            setError("");

            const response = await authApis().post(endpoints.stylistCheckOut);

            setAttendance(unwrapData(response.data));
        } catch (err) {
            console.error("STYLIST CHECK OUT ERROR:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể chấm công ra."
            );
        } finally {
            setCheckingOut(false);
        }
    };

    const today = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const displayAppointments = [...appointments].sort((first, second) => {
        const firstTime = first.startTime || first.appointmentTime || "99:99";
        const secondTime = second.startTime || second.appointmentTime || "99:99";

        return String(firstTime).localeCompare(String(secondTime));
    });

    return (
        <div className="admin-page stylist-dashboard-page">
            <Header role="STYLIST" title="Dashboard" />

            <main className="admin-main stylist-dashboard-main">
                <div className="admin-shell stylist-dashboard-shell">

                    <section className="admin-heading stylist-dashboard-heading">
                        <div>
                            <span className="admin-section-eyebrow">STYLIST MANAGEMENT</span>
                            <h1>Dashboard</h1>
                            <p>Xin chào, {getStylistName()}. Theo dõi lịch làm việc và trạng thái phục vụ của bạn.</p>
                        </div>

                        <div className="stylist-dashboard-date">{today}</div>
                    </section>

                    <section className="stylist-dashboard-welcome">
                        <div>
                            <span>MY WORKDAY</span>
                            <h2>Lịch làm việc hôm nay</h2>
                            <p>Kiểm tra lịch hẹn, tình trạng phục vụ và chấm công trong ngày.</p>
                        </div>

                        <div className="stylist-dashboard-welcome-actions">
                            <Link to="/stylist/appointments" className="admin-primary-button">XEM LỊCH HẸN</Link>
                            <Link to="/stylist/schedule" className="admin-secondary-button">LỊCH CỦA TÔI</Link>
                        </div>
                    </section>

                    {error && (
                        <div className="stylist-dashboard-error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={loadDashboard}>Thử lại</button>
                        </div>
                    )}

                    <section className="admin-kpi-grid stylist-dashboard-kpi-grid">

                        <article className="admin-kpi-card">
                            <div className="admin-kpi-top">
                                <div>
                                    <span className="admin-kpi-title">Tổng lịch hẹn</span>
                                    <strong className="admin-kpi-value">{loading ? "..." : stats.totalAppointments}</strong>
                                </div>

                                <div className="admin-kpi-icon admin-kpi-icon-calendar">
                                    <DashboardIcon type="calendar" />
                                </div>
                            </div>
                        </article>

                        <article className="admin-kpi-card">
                            <div className="admin-kpi-top">
                                <div>
                                    <span className="admin-kpi-title">Lịch hẹn hôm nay</span>
                                    <strong className="admin-kpi-value">{loading ? "..." : stats.todayAppointments}</strong>
                                </div>

                                <div className="admin-kpi-icon admin-kpi-icon-scissors">
                                    <DashboardIcon type="service" />
                                </div>
                            </div>
                        </article>

                        <article className="admin-kpi-card">
                            <div className="admin-kpi-top">
                                <div>
                                    <span className="admin-kpi-title">Đang phục vụ hôm nay</span>
                                    <strong className="admin-kpi-value">{loading ? "..." : stats.inService}</strong>
                                </div>

                                <div className="admin-kpi-icon admin-kpi-icon-calendar">
                                    <DashboardIcon type="calendar" />
                                </div>
                            </div>
                        </article>

                        <article className="admin-kpi-card">
                            <div className="admin-kpi-top">
                                <div>
                                    <span className="admin-kpi-title">Hoàn thành hôm nay</span>
                                    <strong className="admin-kpi-value">{loading ? "..." : stats.completed}</strong>
                                </div>

                                <div className="admin-kpi-icon admin-kpi-icon-money">
                                    <DashboardIcon type="check" />
                                </div>
                            </div>
                        </article>

                    </section>

                    <section className="stylist-dashboard-revenue-card">
                        <div className="stylist-dashboard-revenue-header">
                            <div>
                                <span className="stylist-dashboard-card-eyebrow">MY REVENUE</span>
                                <h2>Doanh thu của tôi</h2>
                                <p>Doanh thu từ các lịch hẹn của chính bạn trong năm đang xem.</p>
                            </div>

                            <div className="stylist-dashboard-revenue-tabs">
                                {Object.entries(REVENUE_TYPE_LABELS).map(([type, label]) => (
                                    <button key={type} type="button" className={revenueType === type ? "active" : ""} onClick={() => handleRevenueTypeChange(type)}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {revenueError ? (
                            <div className="stylist-dashboard-revenue-error">{revenueError}</div>
                        ) : (
                            <>
                                <div className="stylist-dashboard-revenue-summary">
                                    <div>
                                        <span>{revenueType === "YEAR" ? "DOANH THU NĂM" : `TỔNG ${revenueType === "MONTH" ? "12 THÁNG" : "4 QUÝ"}`}</span>
                                        <strong>{revenueLoading ? "..." : formatMoney(revenueTotal)}</strong>
                                    </div>

                                    <div className="stylist-dashboard-revenue-summary-icon">
                                        <DashboardIcon type="money" />
                                    </div>
                                </div>

                                <div className={`stylist-dashboard-revenue-chart stylist-dashboard-revenue-chart-${revenueType.toLowerCase()}`}>
                                    {revenueLoading ? (
                                        <div className="stylist-dashboard-revenue-empty">Đang tải doanh thu...</div>
                                    ) : revenuePeriods.length === 0 ? (
                                        <div className="stylist-dashboard-revenue-empty">Chưa có dữ liệu doanh thu.</div>
                                    ) : (
                                        revenuePeriods.map((period) => {
                                            const revenue = Number(period.revenue || 0);
                                            const height = maxRevenue > 0 ? Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 5 : 0) : 0;

                                            return (
                                                <div key={`${period.label}-${period.from}`} className="stylist-dashboard-revenue-item">
                                                    <div className="stylist-dashboard-revenue-bar-wrap">
                                                        <div className="stylist-dashboard-revenue-value">{formatMoney(revenue)}</div>
                                                        <div className="stylist-dashboard-revenue-bar-track">
                                                            <div className="stylist-dashboard-revenue-bar" style={{ height: `${height}%` }}></div>
                                                        </div>
                                                    </div>

                                                    <span className="stylist-dashboard-revenue-label">{period.label}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        )}
                    </section>

                    <div className="stylist-dashboard-grid">

                        <section className="admin-section-card stylist-dashboard-appointments-card">
                            <div className="admin-section-heading">
                                <div>
                                    <span className="admin-section-eyebrow">TODAY'S APPOINTMENTS</span>
                                    <h2>Lịch hẹn hôm nay</h2>
                                </div>

                                <Link to="/stylist/appointments" className="stylist-dashboard-section-link">Xem tất cả →</Link>
                            </div>

                            {loading ? (
                                <div className="stylist-dashboard-empty">Đang tải lịch hẹn...</div>
                            ) : displayAppointments.length === 0 ? (
                                <div className="stylist-dashboard-empty">
                                    <strong>Hôm nay chưa có lịch hẹn</strong>
                                    <span>Bạn đang có một ngày khá nhẹ nhàng đó 😌</span>
                                </div>
                            ) : (
                                <div className="stylist-dashboard-appointments">
                                    {displayAppointments.map((appointment) => {
                                        const status = String(appointment.status || "").toUpperCase();

                                        return (
                                            <Link key={appointment.id} to={`/stylist/appointments/${appointment.id}`} className="stylist-dashboard-appointment">
                                                <div className="stylist-dashboard-appointment-time">
                                                    <strong>{formatTime(appointment.startTime)}</strong>
                                                    <span>{formatTime(appointment.endTime)}</span>
                                                </div>

                                                <div className="stylist-dashboard-appointment-main">
                                                    <strong>{getCustomerName(appointment)}</strong>
                                                    <span>{getServiceName(appointment)}</span>
                                                </div>

                                                <span className={`stylist-dashboard-status stylist-dashboard-status-${getStatusClass(status)}`}>
                                                    {getStatusLabel(status)}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <aside className="stylist-dashboard-side">

                            <section className="stylist-dashboard-attendance-card">
                                <div className="stylist-dashboard-card-eyebrow">ATTENDANCE</div>
                                <h2>Chấm công hôm nay</h2>

                                <div className={`stylist-dashboard-attendance-status ${attendanceStatus.toLowerCase()}`}>
                                    <span className="stylist-dashboard-attendance-dot"></span>
                                    {getAttendanceLabel(attendanceStatus)}
                                </div>

                                <div className="stylist-dashboard-attendance-times">
                                    <div>
                                        <span>Check-in</span>
                                        <strong>{formatDateTime(attendance?.checkInTime || attendance?.checkInAt)}</strong>
                                    </div>

                                    <div>
                                        <span>Check-out</span>
                                        <strong>{formatDateTime(attendance?.checkOutTime || attendance?.checkOutAt)}</strong>
                                    </div>
                                </div>

                                <div className="stylist-dashboard-attendance-actions">
                                    <button type="button" className="admin-primary-button" onClick={handleCheckIn} disabled={checkingIn || hasCheckedIn}>
                                        {checkingIn ? "ĐANG CHECK-IN..." : hasCheckedIn ? "ĐÃ CHECK-IN" : "CHECK-IN"}
                                    </button>

                                    <button type="button" className="admin-secondary-button" onClick={handleCheckOut} disabled={checkingOut || !hasCheckedIn || hasCheckedOut}>
                                        {checkingOut ? "ĐANG CHECK-OUT..." : hasCheckedOut ? "ĐÃ CHECK-OUT" : "CHECK-OUT"}
                                    </button>
                                </div>
                            </section>

                            <section className="admin-section-card stylist-dashboard-quick-card">
                                <div className="admin-section-heading">
                                    <div>
                                        <span className="admin-section-eyebrow">QUICK ACCESS</span>
                                        <h2>Truy cập nhanh</h2>
                                    </div>
                                </div>

                                <div className="stylist-dashboard-quick-links">
                                    <Link to="/stylist/appointments">
                                        <strong>Lịch hẹn</strong>
                                        <span>Quản lý lịch hẹn với khách →</span>
                                    </Link>

                                    <Link to="/stylist/schedule">
                                        <strong>Lịch của tôi</strong>
                                        <span>Xem lịch làm việc →</span>
                                    </Link>
                                </div>
                            </section>

                        </aside>
                    </div>

                    <section className="stylist-dashboard-footer-card">
                        <div>
                            <span className="admin-section-eyebrow">WORKFLOW</span>
                            <h2>Quy trình phục vụ</h2>
                            <p>Stylist kiểm tra lịch hẹn, bắt đầu phục vụ khi khách đã được xác nhận và hoàn thành lịch sau khi kết thúc dịch vụ.</p>
                        </div>

                        <div className="stylist-dashboard-workflow">
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

export default StylistDashboard;