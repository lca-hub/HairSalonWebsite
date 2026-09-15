import { useEffect, useMemo, useState } from "react";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "./AdminStatistics.css";

const MONTHS = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
];

const STATS_TYPES = [
    { value: "DAY", label: "Theo ngày" },
    { value: "MONTH", label: "Theo tháng" },
    { value: "QUARTER", label: "Theo quý" },
    { value: "YEAR", label: "Theo năm" },
];

function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function formatNumber(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function getStatusLabel(status) {
    const labels = {
        PENDING_PAYMENT: "Chờ thanh toán",
        CONFIRMED: "Đã thanh toán",
        IN_SERVICE: "Đang phục vụ",
        COMPLETED: "Hoàn thành",
        CANCELLED: "Đã hủy",
        NO_SHOW: "Không đến",
    };

    return labels[status] || status;
}

function getPeriodLabel(item) {
    if (!item) return "";

    return item.label || item.from || "";
}

function getMaxAppointment(periodData) {
    if (!periodData?.length) return 1;

    return Math.max(
        ...periodData.map((item) => Number(item.appointmentCount || 0)),
        1
    );
}

function getMaxRevenue(periodData) {
    if (!periodData?.length) return 1;

    return Math.max(
        ...periodData.map((item) => Number(item.revenue || 0)),
        1
    );
}

export default function AdminStatistics() {
    const currentYear = new Date().getFullYear();

    const [dashboard, setDashboard] = useState(null);
    const [stats, setStats] = useState(null);

    const [statsType, setStatsType] = useState("MONTH");
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [loadingStats, setLoadingStats] = useState(false);
    const [error, setError] = useState("");

    const activeStats = stats || dashboard;

    const years = useMemo(() => {
        return Array.from({ length: 6 }, (_, index) => currentYear - index);
    }, [currentYear]);

    const loadDashboard = async () => {
        try {
            setLoadingDashboard(true);
            setError("");

            const response = await authApis().get(endpoints.adminStatistics);
            setDashboard(response.data);
        } catch (error) {
            console.error("Load dashboard statistics error:", error);
            setError("Không thể tải dữ liệu thống kê.");
        } finally {
            setLoadingDashboard(false);
        }
    };

    const loadStats = async () => {
        try {
            setLoadingStats(true);
            setError("");

            const params = {
                statsType,
                year,
            };

            if (statsType === "DAY") {
                params.month = month;
            }

            const response = await authApis().get(endpoints.adminStatisticsStats, {
                params,
            });

            setStats(response.data);
        } catch (error) {
            console.error("Load statistics error:", error);
            setError("Không thể tải dữ liệu thống kê theo bộ lọc.");
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        loadStats();
    }, [statsType, year, month]);

    const periodData = activeStats?.periodData || [];
    const appointmentsByStatus = activeStats?.appointmentsByStatus || {};
    const topServices = activeStats?.topServices || [];
    const stylistPerformance = activeStats?.stylistPerformance || [];

    const maxAppointment = getMaxAppointment(periodData);
    const maxRevenue = getMaxRevenue(periodData);

    return (
        <div className="admin-page admin-statistics-page">
            <Header role="ADMIN" title="Thống kê" />
            <main className="admin-main">
                <div className="admin-shell">
                    <div className="admin-page-header">
                        <div>
                            <h1>Thống kê</h1>
                            <p>Theo dõi tình hình hoạt động và doanh thu của salon.</p>
                        </div>
                    </div>

                    <section className="admin-statistics-filter">
                        <div className="admin-filter-group">
                            <label htmlFor="statistics-type">Kiểu thống kê</label>
                            <select id="statistics-type" value={statsType} onChange={(event) => setStatsType(event.target.value)}>
                                {STATS_TYPES.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-filter-group">
                            <label htmlFor="statistics-year">Năm</label>
                            <select id="statistics-year" value={year} onChange={(event) => setYear(Number(event.target.value))}>
                                {years.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {statsType === "DAY" && (
                            <div className="admin-filter-group">
                                <label htmlFor="statistics-month">Tháng</label>
                                <select id="statistics-month" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                                    {MONTHS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button type="button" className="admin-statistics-refresh" onClick={() => { loadDashboard(); loadStats(); }} disabled={loadingDashboard || loadingStats}>
                            {loadingStats ? "Đang tải..." : "Làm mới"}
                        </button>
                    </section>

                    {error && <div className="admin-alert admin-alert-error">{error}</div>}

                    {(loadingDashboard || loadingStats) && !activeStats ? (
                        <div className="admin-statistics-loading">
                            Đang tải dữ liệu thống kê...
                        </div>
                    ) : (
                        <>
                            <section className="admin-statistics-kpis">
                                <div className="admin-statistics-card">
                                    <span className="admin-statistics-card-label">Tổng lịch hẹn</span>
                                    <strong>{formatNumber(activeStats?.totalAppointments)}</strong>
                                </div>

                                <div className="admin-statistics-card">
                                    <span className="admin-statistics-card-label">Đã thanh toán</span>
                                    <strong>{formatNumber(activeStats?.confirmedAppointments)}</strong>
                                </div>

                                <div className="admin-statistics-card">
                                    <span className="admin-statistics-card-label">Hoàn thành</span>
                                    <strong>{formatNumber(activeStats?.completedAppointments)}</strong>
                                </div>

                                <div className="admin-statistics-card">
                                    <span className="admin-statistics-card-label">Đã hủy</span>
                                    <strong>{formatNumber(activeStats?.cancelledAppointments)}</strong>
                                </div>

                                <div className="admin-statistics-card admin-statistics-card-revenue">
                                    <span className="admin-statistics-card-label">Doanh thu</span>
                                    <strong>{formatMoney(activeStats?.totalRevenue)}</strong>
                                </div>
                            </section>

                            <section className="admin-statistics-system">
                                <div className="admin-statistics-system-card">
                                    <span>Khách hàng</span>
                                    <strong>{formatNumber(activeStats?.totalCustomers)}</strong>
                                </div>

                                <div className="admin-statistics-system-card">
                                    <span>Stylist</span>
                                    <strong>{formatNumber(activeStats?.totalStylists)}</strong>
                                </div>

                                <div className="admin-statistics-system-card">
                                    <span>Dịch vụ</span>
                                    <strong>{formatNumber(activeStats?.totalServices)}</strong>
                                </div>

                                <div className="admin-statistics-system-card">
                                    <span>Sản phẩm</span>
                                    <strong>{formatNumber(activeStats?.totalProducts)}</strong>
                                </div>
                            </section>

                            <section className="admin-statistics-grid">
                                <div className="admin-statistics-panel">
                                    <div className="admin-statistics-panel-header">
                                        <div>
                                            <h2>Lịch hẹn theo kỳ</h2>
                                            <p>Số lượng lịch hẹn trong khoảng thời gian đã chọn.</p>
                                        </div>
                                    </div>

                                    <div className="admin-statistics-chart">
                                        {periodData.map((item, index) => {
                                            const appointmentCount = Number(item.appointmentCount || 0);
                                            const height = Math.max((appointmentCount / maxAppointment) * 100, appointmentCount > 0 ? 6 : 2);

                                            return (
                                                <div className="admin-statistics-bar-item" key={`${item.from}-${index}`}>
                                                    <div className="admin-statistics-bar-value">
                                                        {appointmentCount}
                                                    </div>

                                                    <div className="admin-statistics-bar-area">
                                                        <div className="admin-statistics-bar" style={{ height: `${height}%` }}></div>
                                                    </div>

                                                    <span className="admin-statistics-bar-label">
                                                        {getPeriodLabel(item)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="admin-statistics-panel">
                                    <div className="admin-statistics-panel-header">
                                        <div>
                                            <h2>Doanh thu theo kỳ</h2>
                                            <p>Doanh thu từ các hóa đơn đã thanh toán.</p>
                                        </div>
                                    </div>

                                    <div className="admin-statistics-revenue-chart">
                                        {periodData.map((item, index) => {
                                            const revenue = Number(item.revenue || 0);
                                            const width = Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 4 : 0);

                                            return (
                                                <div className="admin-statistics-revenue-item" key={`${item.to}-${index}`}>
                                                    <div className="admin-statistics-revenue-top">
                                                        <span>{getPeriodLabel(item)}</span>
                                                        <strong>{formatMoney(revenue)}</strong>
                                                    </div>

                                                    <div className="admin-statistics-revenue-track">
                                                        <div className="admin-statistics-revenue-fill" style={{ width: `${width}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>

                            <section className="admin-statistics-grid">
                                <div className="admin-statistics-panel">
                                    <div className="admin-statistics-panel-header">
                                        <div>
                                            <h2>Trạng thái lịch hẹn</h2>
                                            <p>Phân bổ lịch hẹn theo trạng thái.</p>
                                        </div>
                                    </div>

                                    <div className="admin-statistics-status-list">
                                        {Object.entries(appointmentsByStatus).map(([status, count]) => (
                                            <div className="admin-statistics-status-row" key={status}>
                                                <span>{getStatusLabel(status)}</span>
                                                <strong>{formatNumber(count)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="admin-statistics-panel">
                                    <div className="admin-statistics-panel-header">
                                        <div>
                                            <h2>Top dịch vụ</h2>
                                            <p>Top 5 dịch vụ có số lượt hoàn thành cao nhất.</p>
                                        </div>
                                    </div>

                                    {topServices.length === 0 ? (
                                        <div className="admin-statistics-empty">
                                            Chưa có dữ liệu dịch vụ.
                                        </div>
                                    ) : (
                                        <div className="admin-statistics-ranking">
                                            {topServices.map((item, index) => (
                                                <div className="admin-statistics-ranking-row" key={item.serviceId}>
                                                    <div className="admin-statistics-ranking-index">
                                                        {index + 1}
                                                    </div>

                                                    <div className="admin-statistics-ranking-info">
                                                        <strong>{item.serviceName}</strong>
                                                        <span>Đã hoàn thành {formatNumber(item.completedAppointments)} lượt</span>
                                                    </div>

                                                    <div className="admin-statistics-ranking-value">
                                                        {formatNumber(item.completedAppointments)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="admin-statistics-panel admin-statistics-table-panel">
                                <div className="admin-statistics-panel-header">
                                    <div>
                                        <h2>Hiệu suất stylist</h2>
                                        <p>Thống kê số lịch hẹn hoàn thành và doanh thu theo stylist.</p>
                                    </div>
                                </div>

                                {stylistPerformance.length === 0 ? (
                                    <div className="admin-statistics-empty">
                                        Chưa có dữ liệu stylist.
                                    </div>
                                ) : (
                                    <div className="admin-statistics-table-wrap">
                                        <table className="admin-statistics-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Stylist</th>
                                                    <th>Lịch hoàn thành</th>
                                                    <th>Doanh thu</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {stylistPerformance.map((item, index) => (
                                                    <tr key={item.stylistId}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.stylistName}</td>
                                                        <td>{formatNumber(item.completedAppointments)}</td>
                                                        <td>{formatMoney(item.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>

                            {dashboard && (
                                <section className="admin-statistics-panel admin-statistics-last-seven">
                                    <div className="admin-statistics-panel-header">
                                        <div>
                                            <h2>Tổng quan 7 ngày gần nhất</h2>
                                            <p>Dữ liệu hoạt động trong 7 ngày gần nhất của salon.</p>
                                        </div>
                                    </div>

                                    <div className="admin-statistics-seven-grid">
                                        {(dashboard.periodData || []).map((item, index) => (
                                            <div className="admin-statistics-seven-card" key={`${item.from}-${index}`}>
                                                <span>{getPeriodLabel(item)}</span>
                                                <strong>{formatNumber(item.appointmentCount)}</strong>
                                                <small>Lịch hẹn</small>
                                                <em>{formatMoney(item.revenue)}</em>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}