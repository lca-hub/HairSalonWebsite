import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { authApis, endpoints } from "../../configs/api/Apis";
import "../../styles/admin/AdminCommon.css";
import "./StylistAppointments.css";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
    PENDING_PAYMENT: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    IN_SERVICE: "Đang phục vụ",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    NO_SHOW: "Không đến",
    EXPIRED: "Hết hạn",
};

function normalizeContent(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.content)) return data.data.content;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.result?.content)) return data.result.content;
    return [];
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatDateTime(value) {
    if (!value) return "-";

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
    if (!value) return "-";

    const text = String(value);

    return text.length >= 5 ? text.substring(0, 5) : text;
}

function getStatusLabel(status) {
    return STATUS_LABELS[status] || status || "-";
}

function getStatusClass(status) {
    return String(status || "").toLowerCase();
}

function getCustomerName(appointment) {
    return (
        appointment.customerName ||
        appointment.customer?.name ||
        appointment.customer?.fullName ||
        appointment.customer?.full_name ||
        appointment.customer?.user?.name ||
        appointment.customer?.user?.fullName ||
        "-"
    );
}

function getCustomerEmail(appointment) {
    return (
        appointment.customerEmail ||
        appointment.customer?.email ||
        appointment.customer?.user?.email ||
        "-"
    );
}

function getServiceName(appointment) {
    if (appointment.serviceName) return appointment.serviceName;

    if (appointment.service?.name) return appointment.service.name;

    if (appointment.service?.serviceName) return appointment.service.serviceName;

    if (Array.isArray(appointment.services) && appointment.services.length > 0) {
        return appointment.services
            .map((service) => service.name || service.serviceName || service.service?.name)
            .filter(Boolean)
            .join(", ");
    }

    if (Array.isArray(appointment.appointmentServices) && appointment.appointmentServices.length > 0) {
        return appointment.appointmentServices
            .map((item) => item.serviceName || item.name || item.service?.name)
            .filter(Boolean)
            .join(", ");
    }

    return "-";
}

function StylistAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(0);

    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [actionLoading, setActionLoading] = useState(false);

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(
                endpoints.stylistAppointments,
                {
                    params: {
                        page: 0,
                        size: 1000,
                    },
                }
            );

            setAppointments(normalizeContent(response.data));
        } catch (err) {
            console.error("LOAD STYLIST APPOINTMENTS ERROR:", err);

            setAppointments([]);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể tải danh sách lịch hẹn."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const filteredAppointments = useMemo(() => {
        const searchText = keyword.trim().toLowerCase();

        return appointments.filter((appointment) => {
            const appointmentCode = String(
                appointment.appointmentCode || appointment.code || appointment.id || ""
            ).toLowerCase();

            const customerName = String(
                getCustomerName(appointment)
            ).toLowerCase();

            const customerEmail = String(
                getCustomerEmail(appointment)
            ).toLowerCase();

            const serviceName = String(
                getServiceName(appointment)
            ).toLowerCase();

            const appointmentDate = String(
                appointment.appointmentDate || ""
            );

            const status = String(
                appointment.status || ""
            ).toUpperCase();

            const matchesKeyword =
                !searchText ||
                appointmentCode.includes(searchText) ||
                customerName.includes(searchText) ||
                customerEmail.includes(searchText) ||
                serviceName.includes(searchText);

            const matchesStatus =
                !statusFilter ||
                status === statusFilter;

            const matchesDate =
                !dateFilter ||
                appointmentDate === dateFilter;

            return matchesKeyword && matchesStatus && matchesDate;
        });
    }, [appointments, keyword, statusFilter, dateFilter]);

    const totalPages = Math.max(
        Math.ceil(filteredAppointments.length / PAGE_SIZE),
        1
    );

    const displayAppointments = useMemo(() => {
        const startIndex = page * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;

        return filteredAppointments.slice(startIndex, endIndex);
    }, [filteredAppointments, page]);

    useEffect(() => {
        if (page >= totalPages) {
            setPage(Math.max(totalPages - 1, 0));
        }
    }, [page, totalPages]);

    const openDetail = async (appointment) => {
        try {
            setDetailLoading(true);
            setSelectedAppointment(appointment);

            const response = await authApis().get(
                endpoints.stylistAppointmentDetail(appointment.id)
            );

            setSelectedAppointment(response.data);
        } catch (err) {
            console.error("LOAD STYLIST APPOINTMENT DETAIL ERROR:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể tải chi tiết lịch hẹn."
            );

            setSelectedAppointment(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        if (detailLoading || actionLoading) return;

        setSelectedAppointment(null);
    };

    const handleStart = async () => {
        if (!selectedAppointment?.id) return;

        const confirmed = window.confirm(
            "Bạn có chắc muốn bắt đầu phục vụ khách hàng này?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);

            const response = await authApis().post(
                endpoints.stylistStartAppointment(selectedAppointment.id)
            );

            setSelectedAppointment(response.data);
            await loadAppointments();
        } catch (err) {
            console.error("START APPOINTMENT ERROR:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể bắt đầu lịch hẹn."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!selectedAppointment?.id) return;

        const confirmed = window.confirm(
            "Bạn có chắc lịch hẹn này đã hoàn thành?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);

            const response = await authApis().post(
                endpoints.stylistCompleteAppointment(selectedAppointment.id)
            );

            setSelectedAppointment(response.data);
            await loadAppointments();
        } catch (err) {
            console.error("COMPLETE APPOINTMENT ERROR:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể hoàn thành lịch hẹn."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedAppointment?.id) return;

        try {
            setActionLoading(true);

            const response = await authApis().put(
                endpoints.stylistAppointmentNote(selectedAppointment.id),
                {
                    stylistNote: selectedAppointment.stylistNote || "",
                }
            );

            setSelectedAppointment(response.data);
            await loadAppointments();

            alert("Đã lưu ghi chú.");
        } catch (err) {
            console.error("SAVE STYLIST NOTE ERROR:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể lưu ghi chú."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const resetFilters = () => {
        setKeyword("");
        setStatusFilter("");
        setDateFilter("");
        setPage(0);
    };

    const handlePageChange = (nextPage) => {
        if (nextPage < 0 || nextPage >= totalPages) return;

        setPage(nextPage);
    };

    return (
        <div className="admin-page stylist-appointments-page">
            <Header role="STYLIST" title="Lịch hẹn" />

            <main className="admin-main stylist-appointments-main">
                <div className="admin-shell">

                    <section className="admin-heading">
                        <div>
                            <span className="admin-section-eyebrow">APPOINTMENT MANAGEMENT</span>
                            <h1>Lịch hẹn</h1>
                            <p>Quản lý tất cả lịch hẹn được phân công cho bạn.</p>
                        </div>
                    </section>

                    <section className="admin-filter-card">
                        <div className="stylist-appointments-filter-grid">

                            <div className="admin-form-group stylist-appointments-keyword">
                                <label htmlFor="stylist-appointment-keyword">Tìm kiếm</label>
                                <input id="stylist-appointment-keyword" type="text" className="admin-form-input" value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0); }} placeholder="Mã lịch, tên khách hàng, email, dịch vụ..." />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="stylist-appointment-status">Trạng thái</label>
                                <select id="stylist-appointment-status" className="admin-form-select" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(0); }}>
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                                    <option value="CONFIRMED">Đã xác nhận</option>
                                    <option value="IN_SERVICE">Đang phục vụ</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                    <option value="NO_SHOW">Không đến</option>
                                    <option value="EXPIRED">Hết hạn</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="stylist-appointment-date">Ngày hẹn</label>
                                <input id="stylist-appointment-date" type="date" className="admin-form-input" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setPage(0); }} />
                            </div>

                            <div className="stylist-appointments-filter-actions">
                                <button type="button" className="admin-secondary-button" onClick={resetFilters}>Xóa lọc</button>
                                <button type="button" className="admin-primary-button" onClick={loadAppointments} disabled={loading}>Làm mới</button>
                            </div>

                        </div>

                        <div className="stylist-appointments-filter-result">
                            Hiển thị <strong>{filteredAppointments.length}</strong> lịch hẹn
                        </div>
                    </section>

                    {error && (
                        <div className="stylist-appointments-error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={loadAppointments}>Thử lại</button>
                        </div>
                    )}

                    <section className="admin-section-card stylist-appointments-card">

                        <div className="admin-section-heading">
                            <div>
                                <span className="admin-section-eyebrow">ALL APPOINTMENTS</span>
                                <h2>Tất cả lịch hẹn</h2>
                            </div>

                            <span>{loading ? "Đang tải..." : `Trang ${page + 1} / ${totalPages}`}</span>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table stylist-appointments-table">
                                <thead>
                                    <tr>
                                        <th>Mã lịch</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày hẹn</th>
                                        <th>Thời gian</th>
                                        <th>Dịch vụ</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="admin-table-empty">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : displayAppointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="admin-table-empty">Không có lịch hẹn phù hợp.</td>
                                        </tr>
                                    ) : (
                                        displayAppointments.map((appointment) => {
                                            const status = String(appointment.status || "").toUpperCase();

                                            return (
                                                <tr key={appointment.id}>
                                                    <td data-label="Mã lịch">
                                                        <strong>{appointment.appointmentCode || `#${appointment.id}`}</strong>
                                                    </td>

                                                    <td data-label="Khách hàng">
                                                        <div className="stylist-appointment-customer">
                                                            <strong>{getCustomerName(appointment)}</strong>
                                                            <span>{getCustomerEmail(appointment)}</span>
                                                        </div>
                                                    </td>

                                                    <td data-label="Ngày hẹn">
                                                        {formatDate(appointment.appointmentDate)}
                                                    </td>

                                                    <td data-label="Thời gian">
                                                        <strong>{formatTime(appointment.startTime)}</strong>
                                                        <span className="stylist-appointment-end-time">{formatTime(appointment.endTime)}</span>
                                                    </td>

                                                    <td data-label="Dịch vụ">
                                                        {getServiceName(appointment)}
                                                    </td>

                                                    <td data-label="Trạng thái">
                                                        <span className={`stylist-appointment-status stylist-appointment-status-${getStatusClass(status)}`}>
                                                            {getStatusLabel(status)}
                                                        </span>
                                                    </td>

                                                    <td data-label="Thao tác">
                                                        <button type="button" className="stylist-appointment-detail-button" onClick={() => openDetail(appointment)}>Xem</button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-pagination">
                            <button type="button" className="admin-page-button" disabled={page === 0 || loading} onClick={() => handlePageChange(0)}>⏮</button>

                            <button type="button" className="admin-page-button" disabled={page === 0 || loading} onClick={() => handlePageChange(page - 1)}>←</button>

                            {Array.from({ length: totalPages }, (_, index) => index).map((pageNumber) => (
                                <button key={pageNumber} type="button" className={`admin-page-button ${pageNumber === page ? "active" : ""}`} disabled={loading} onClick={() => handlePageChange(pageNumber)}>
                                    {pageNumber + 1}
                                </button>
                            ))}

                            <button type="button" className="admin-page-button" disabled={page >= totalPages - 1 || loading} onClick={() => handlePageChange(page + 1)}>→</button>

                            <button type="button" className="admin-page-button" disabled={page >= totalPages - 1 || loading} onClick={() => handlePageChange(totalPages - 1)}>⏭</button>
                        </div>

                    </section>

                </div>
            </main>

            {selectedAppointment && (
                <div className="admin-modal-overlay" onMouseDown={closeDetail}>
                    <div className="admin-modal stylist-appointment-detail-modal" onMouseDown={(event) => event.stopPropagation()}>

                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-section-eyebrow">APPOINTMENT DETAIL</span>
                                <h2>{selectedAppointment.appointmentCode || `Lịch hẹn #${selectedAppointment.id}`}</h2>
                            </div>

                            <button type="button" className="admin-modal-close" onClick={closeDetail} disabled={detailLoading || actionLoading}>×</button>
                        </div>

                        {detailLoading ? (
                            <div className="stylist-appointment-detail-loading">Đang tải chi tiết lịch hẹn...</div>
                        ) : (
                            <>
                                <div className="stylist-appointment-detail-summary">

                                    <div>
                                        <span>Khách hàng</span>
                                        <strong>{getCustomerName(selectedAppointment)}</strong>
                                    </div>

                                    <div>
                                        <span>Email</span>
                                        <strong>{getCustomerEmail(selectedAppointment)}</strong>
                                    </div>

                                    <div>
                                        <span>Mã khách hàng</span>
                                        <strong>{selectedAppointment.customerId || selectedAppointment.customer?.id || "-"}</strong>
                                    </div>

                                    <div>
                                        <span>Ngày hẹn</span>
                                        <strong>{formatDate(selectedAppointment.appointmentDate)}</strong>
                                    </div>

                                    <div>
                                        <span>Thời gian</span>
                                        <strong>{formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}</strong>
                                    </div>

                                    <div>
                                        <span>Dịch vụ</span>
                                        <strong>{getServiceName(selectedAppointment)}</strong>
                                    </div>

                                    <div>
                                        <span>Trạng thái</span>
                                        <strong>{getStatusLabel(String(selectedAppointment.status || "").toUpperCase())}</strong>
                                    </div>

                                </div>

                                <div className="stylist-appointment-action-section">

                                    <div className="stylist-appointment-action-header">
                                        <span className="admin-section-eyebrow">SERVICE WORKFLOW</span>
                                        <h3>Cập nhật lịch hẹn</h3>
                                    </div>

                                    <div className="stylist-appointment-actions">

                                        {String(selectedAppointment.status || "").toUpperCase() === "CONFIRMED" && (
                                            <button type="button" className="admin-primary-button" onClick={handleStart} disabled={actionLoading}>
                                                {actionLoading ? "ĐANG XỬ LÝ..." : "BẮT ĐẦU PHỤC VỤ"}
                                            </button>
                                        )}

                                        {String(selectedAppointment.status || "").toUpperCase() === "IN_SERVICE" && (
                                            <button type="button" className="admin-primary-button" onClick={handleComplete} disabled={actionLoading}>
                                                {actionLoading ? "ĐANG XỬ LÝ..." : "HOÀN THÀNH"}
                                            </button>
                                        )}

                                        {!["CONFIRMED", "IN_SERVICE"].includes(String(selectedAppointment.status || "").toUpperCase()) && (
                                            <span className="stylist-appointment-action-note">Không có thao tác cập nhật trạng thái cho lịch hẹn này.</span>
                                        )}

                                    </div>

                                </div>

                                <div className="stylist-appointment-note-section">

                                    <div className="stylist-appointment-action-header">
                                        <span className="admin-section-eyebrow">STYLIST NOTE</span>
                                        <h3>Ghi chú khách hàng</h3>
                                    </div>

                                    <textarea className="stylist-appointment-note-input" value={selectedAppointment.stylistNote || ""} onChange={(event) => setSelectedAppointment((current) => ({ ...current, stylistNote: event.target.value }))} placeholder="Nhập ghi chú cho lịch hẹn..." rows="5" disabled={actionLoading}></textarea>

                                    <button type="button" className="admin-secondary-button stylist-appointment-note-button" onClick={handleSaveNote} disabled={actionLoading}>
                                        {actionLoading ? "ĐANG LƯU..." : "LƯU GHI CHÚ"}
                                    </button>

                                </div>

                                {selectedAppointment.createdAt && (
                                    <div className="stylist-appointment-created">
                                        Tạo lúc: {formatDateTime(selectedAppointment.createdAt)}
                                    </div>
                                )}

                                <div className="admin-modal-actions">
                                    <button type="button" className="admin-secondary-button" onClick={closeDetail} disabled={actionLoading}>Đóng</button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}

export default StylistAppointments;