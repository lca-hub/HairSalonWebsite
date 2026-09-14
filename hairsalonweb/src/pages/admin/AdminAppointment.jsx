import { useEffect, useState } from "react";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "../../styles/admin/AdminCommon.css";
import "./AdminAppointment.css";

const statuses = [
    "PENDING_PAYMENT",
    "CONFIRMED",
    "IN_SERVICE",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
];

const PAGE_SIZE = 10;
const today = new Date().toISOString().slice(0, 10);

function AdminAppointment() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState({ stylistId: "", status: "", date: "" });
    const [lookup, setLookup] = useState({ customers: [], stylists: [], services: [] });
    const [form, setForm] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const getTotalPages = () => Math.max(Math.ceil(total / PAGE_SIZE), 1);

    const load = async () => {
        try {
            setLoading(true);

            const response = await authApis().get(endpoints.adminAppointments, {
                params: {
                    page,
                    size: PAGE_SIZE,
                    stylistId: filters.stylistId || undefined,
                    status: filters.status || undefined,
                    date: filters.date || undefined,
                },
            });

            setItems(response.data.content || []);
            setTotal(response.data.totalElements || 0);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Không thể tải lịch hẹn.",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadLookup = async () => {
        const [customers, stylists, services] = await Promise.allSettled([
            authApis().get(endpoints.adminCustomers, { params: { page: 0, size: 100 } }),
            authApis().get(endpoints.adminStylists, { params: { page: 0, size: 100, isActive: true } }),
            authApis().get(endpoints.adminServices, { params: { page: 0, size: 100 } }),
        ]);

        setLookup({
            customers: customers.status === "fulfilled" ? customers.value.data.content || [] : [],
            stylists: stylists.status === "fulfilled" ? stylists.value.data.content || [] : [],
            services: services.status === "fulfilled" ? services.value.data.content || [] : [],
        });
    };

    useEffect(() => {
        loadLookup();
    }, []);

    useEffect(() => {
        load();
    }, [page, filters.stylistId, filters.status, filters.date]);

    const openCreate = () => {
        setSlots([]);
        setForm({
            customerId: "",
            stylistId: "",
            serviceId: "",
            appointmentDate: today,
            startTime: "",
            customerNote: "",
        });
    };

    const openReschedule = (appointment) => {
        setSlots([]);
        setForm({
            id: appointment.id,
            customerId: appointment.customerId || "",
            stylistId: appointment.stylistId || "",
            serviceId: appointment.serviceId || "",
            appointmentDate: appointment.appointmentDate || today,
            startTime: String(appointment.startTime || "").slice(0, 5),
            customerNote: appointment.customerNote || "",
        });
    };

    const getSlots = async (stylistId, date, serviceId) => {
        if (!stylistId || !date || !serviceId) {
            setSlots([]);
            return;
        }

        try {
            const response = await authApis().get(endpoints.availableSlots(stylistId), {
                params: { workDate: date, serviceId },
            });
            setSlots(response.data || []);
        } catch (error) {
            setSlots([]);
        }
    };

    useEffect(() => {
        if (form) getSlots(form.stylistId, form.appointmentDate, form.serviceId);
    }, [form?.stylistId, form?.appointmentDate, form?.serviceId]);

    const save = async (event) => {
        event.preventDefault();

        try {
            const payload = {
                customerId: Number(form.customerId),
                stylistId: Number(form.stylistId),
                serviceId: Number(form.serviceId),
                appointmentDate: form.appointmentDate,
                startTime: form.startTime,
                customerNote: form.customerNote || null,
            };

            if (form.id) {
                await authApis().post(endpoints.adminAppointmentReschedule(form.id), payload);
            } else {
                await authApis().post(endpoints.adminAppointments, payload);
            }

            setForm(null);
            setMessage({
                type: "success",
                text: form.id ? "Đổi lịch thành công." : "Tạo lịch hẹn thành công.",
            });
            load();
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Không thể lưu lịch hẹn.",
            });
        }
    };

    const action = async (fn, text) => {
        try {
            await fn();
            setMessage({ type: "success", text });
            load();
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Thao tác thất bại.",
            });
        }
    };

    return (
        <div className="admin-page">
            <Header role="ADMIN" title="Lịch hẹn" />
            <main className="admin-main">
                <div className="admin-shell">
                    <section className="admin-heading">
                        <div>
                            <span className="admin-eyebrow">APPOINTMENT MANAGEMENT</span>
                            <h1>Lịch hẹn</h1>
                            <p>Tạo, đổi lịch và xử lý trạng thái cuộc hẹn.</p>
                        </div>
                        <button className="admin-primary-button" type="button" onClick={openCreate}>TẠO LỊCH</button>
                    </section>

                    {message.text && (
                        <div className={`admin-alert ${message.type}`}>
                            <span>{message.text}</span>
                            <button type="button" onClick={() => setMessage({ type: "", text: "" })}>×</button>
                        </div>
                    )}

                    <section className="admin-filter-card admin-appointment-filters">
                        <label>
                            <span>Stylist</span>
                            <select value={filters.stylistId} onChange={(event) => {
                                setPage(0);
                                setFilters({ ...filters, stylistId: event.target.value });
                            }}>
                                <option value="">Tất cả</option>
                                {lookup.stylists.map((stylist) => (
                                    <option key={stylist.id} value={stylist.id}>{stylist.firstName} {stylist.lastName}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Ngày</span>
                            <input type="date" value={filters.date} onChange={(event) => {
                                setPage(0);
                                setFilters({ ...filters, date: event.target.value });
                            }} />
                        </label>

                        <label>
                            <span>Trạng thái</span>
                            <select value={filters.status} onChange={(event) => {
                                setPage(0);
                                setFilters({ ...filters, status: event.target.value });
                            }}>
                                <option value="">Tất cả</option>
                                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </label>

                        <button className="admin-filter-reset" type="button" onClick={() => {
                            setFilters({ stylistId: "", status: "", date: "" });
                            setPage(0);
                        }}>ĐẶT LẠI</button>
                    </section>

                    <section className="admin-table-card">
                        <div className="admin-table-top">
                            <div>
                                <h2>Danh sách lịch hẹn</h2>
                                <span>{total} lịch hẹn</span>
                            </div>
                            <button className="admin-refresh-btn" type="button" onClick={load} disabled={loading}>LÀM MỚI</button>
                        </div>

                        {loading ? (
                            <div className="admin-empty">Đang tải...</div>
                        ) : items.length === 0 ? (
                            <div className="admin-empty"><strong>Không có lịch hẹn</strong></div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Mã</th>
                                            <th>Khách hàng</th>
                                            <th>Stylist</th>
                                            <th>Dịch vụ</th>
                                            <th>Ngày / giờ</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((appointment) => (
                                            <tr key={appointment.id}>
                                                <td data-label="Mã">{appointment.appointmentCode}</td>
                                                <td data-label="Khách hàng">{appointment.customerName}</td>
                                                <td data-label="Stylist">{appointment.stylistName}</td>
                                                <td data-label="Dịch vụ">{appointment.serviceName}</td>
                                                <td data-label="Ngày / giờ">
                                                    {appointment.appointmentDate}<br />
                                                    {String(appointment.startTime || "").slice(0, 5)} - {String(appointment.endTime || "").slice(0, 5)}
                                                </td>
                                                <td data-label="Trạng thái">{appointment.status}</td>
                                                <td data-label="Thao tác" className="admin-user-actions">
                                                    {["CANCELLED", "COMPLETED", "NO_SHOW"].indexOf(appointment.status) < 0 && (
                                                        <>
                                                            <button type="button" onClick={() => openReschedule(appointment)}>Đổi lịch</button>
                                                            {appointment.status === "PENDING_PAYMENT" && (
                                                                <button type="button" onClick={() => action(
                                                                    () => authApis().post(endpoints.adminAppointmentConfirm(appointment.id)),
                                                                    "Đã xác nhận lịch."
                                                                )}>Xác nhận</button>
                                                            )}
                                                            <button type="button" onClick={() => action(
                                                                () => authApis().post(endpoints.adminAppointmentCancel(appointment.id)),
                                                                "Đã hủy lịch."
                                                            )}>Hủy</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="admin-pagination">
                            <button type="button" className="admin-page-button" onClick={() => setPage(0)} disabled={page === 0 || loading}>⏮</button>
                            <button type="button" className="admin-page-button" onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={page === 0 || loading}>←</button>
                            {Array.from({ length: getTotalPages() }, (_, index) => index).map((pageNumber) => (
                                <button key={pageNumber} type="button" className={`admin-page-button ${pageNumber === page ? "active" : ""}`} onClick={() => setPage(pageNumber)} disabled={loading}>
                                    {pageNumber + 1}
                                </button>
                            ))}
                            <button type="button" className="admin-page-button" onClick={() => setPage((current) => Math.min(current + 1, getTotalPages() - 1))} disabled={page >= getTotalPages() - 1 || loading}>→</button>
                            <button type="button" className="admin-page-button" onClick={() => setPage(getTotalPages() - 1)} disabled={getTotalPages() <= 1 || page >= getTotalPages() - 1 || loading}>⏭</button>
                        </div>
                    </section>
                </div>
            </main>

            {form && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-eyebrow">{form.id ? "RESCHEDULE" : "CREATE"}</span>
                                <h2>{form.id ? "Đổi lịch hẹn" : "Tạo lịch hẹn"}</h2>
                            </div>
                            <button type="button" className="admin-modal-close" onClick={() => setForm(null)}>×</button>
                        </div>

                        <form onSubmit={save}>
                            <div className="admin-modal-body">
                                <div className="admin-form-grid two-col">
                                    <label>
                                        <span>Khách hàng</span>
                                        <select required value={form.customerId} disabled={!!form.id} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
                                            <option value="">-- Chọn --</option>
                                            {lookup.customers.map((customer) => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.fullname || customer.fullName || `${customer.lastName || ""} ${customer.firstName || ""}`} — {customer.phoneNumber || customer.email || ""}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Stylist</span>
                                        <select required value={form.stylistId} onChange={(event) => setForm({ ...form, stylistId: event.target.value, startTime: "" })}>
                                            <option value="">-- Chọn --</option>
                                            {lookup.stylists.map((stylist) => (
                                                <option key={stylist.id} value={stylist.id}>{stylist.firstName} {stylist.lastName}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Dịch vụ</span>
                                        <select required value={form.serviceId} onChange={(event) => setForm({ ...form, serviceId: event.target.value, startTime: "" })}>
                                            <option value="">-- Chọn --</option>
                                            {lookup.services.filter((service) => service.isActive !== false).map((service) => (
                                                <option key={service.id} value={service.id}>{service.name} — {Number(service.price || 0).toLocaleString("vi-VN")}đ</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Ngày</span>
                                        <input required type="date" min={today} value={form.appointmentDate} onChange={(event) => setForm({ ...form, appointmentDate: event.target.value, startTime: "" })} />
                                    </label>

                                    <label className="full-width">
                                        <span>Khung giờ</span>
                                        <select required value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })}>
                                            <option value="">-- Chọn khung giờ --</option>
                                            {slots.map((slot) => (
                                                <option key={slot} value={slot}>{String(slot).slice(0, 5)}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="full-width">
                                        <span>Ghi chú</span>
                                        <textarea value={form.customerNote} onChange={(event) => setForm({ ...form, customerNote: event.target.value })} />
                                    </label>
                                </div>

                                <div className="admin-form-note">
                                    Khung giờ được lấy từ lịch làm việc của stylist và tự loại các giờ đã có lịch hẹn.
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button type="button" className="admin-secondary-button" onClick={() => setForm(null)}>HỦY</button>
                                <button type="submit" className="admin-primary-button">LƯU LỊCH</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAppointment;