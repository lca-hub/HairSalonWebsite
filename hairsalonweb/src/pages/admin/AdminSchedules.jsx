import { useEffect, useMemo, useState } from "react";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "../../styles/admin/AdminCommon.css";
import "./AdminSchedules.css";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "18:00";
const PAGE_SIZE = 10;

const WEEK_DAYS = [
    { key: 1, label: "Thứ 2" },
    { key: 2, label: "Thứ 3" },
    { key: 3, label: "Thứ 4" },
    { key: 4, label: "Thứ 5" },
    { key: 5, label: "Thứ 6" },
    { key: 6, label: "Thứ 7" },
    { key: 0, label: "Chủ nhật" },
];

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getMonday(date = new Date()) {
    const current = new Date(date);
    const day = current.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + diff);
    current.setHours(0, 0, 0, 0);
    return current;
}

function getWeekDates(monday) {
    return WEEK_DAYS.map((item) => {
        const date = new Date(monday);
        const offset = item.key === 0 ? 6 : item.key - 1;
        date.setDate(monday.getDate() + offset);
        return {
            ...item,
            date: toDateInputValue(date),
        };
    });
}

function AdminSchedules() {
    const [items, setItems] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [form, setForm] = useState(null);
    const [filter, setFilter] = useState({ stylistId: "", date: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [weekStart, setWeekStart] = useState(() => getMonday());
    const [page, setPage] = useState(0);

    const load = async () => {
        try {
            setLoading(true);
            const [s, st] = await Promise.all([
                authApis().get(endpoints.adminSchedules),
                authApis().get(endpoints.adminStylists, {
                    params: { page: 0, size: 100, isActive: true },
                }),
            ]);
            setItems(Array.isArray(s.data) ? s.data : []);
            setStylists(Array.isArray(st.data?.content) ? st.data.content : []);
        } catch (e) {
            setMessage({
                type: "error",
                text: e.response?.data?.message || "Không thể tải lịch làm việc.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(
        () =>
            items.filter(
                (x) =>
                    (!filter.stylistId || String(x.stylistId) === String(filter.stylistId)) &&
                    (!filter.date || x.workDate === filter.date),
            ),
        [items, filter],
    );

    const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);

    const pagedItems = useMemo(
        () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
        [filtered, page],
    );

    useEffect(() => {
        setPage(0);
    }, [filter.stylistId, filter.date]);

    useEffect(() => {
        if (page >= totalPages) {
            setPage(totalPages - 1);
        }
    }, [page, totalPages]);

    const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

    const getStylistName = (id) => {
        const stylist = stylists.find((item) => String(item.id) === String(id));
        return stylist ? `${stylist.firstName || ""} ${stylist.lastName || ""}`.trim() : "";
    };

    const save = async (event) => {
        event.preventDefault();
        if (!form) return;

        try {
            setSaving(true);

            if (!form.isOff && form.startTime >= form.endTime) {
                throw new Error("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
            }

            if (form.id) {
                const payload = {
                    ...form,
                    stylistId: Number(form.stylistId),
                    isOff: !!form.isOff,
                };
                delete payload.workDates;

                await authApis().put(endpoints.adminScheduleDetail(form.id), payload);
                setForm(null);
                setMessage({ type: "success", text: "Cập nhật lịch làm việc thành công." });
                await load();
                return;
            }

            const selectedDates = Array.isArray(form.workDates)
                ? form.workDates.filter(Boolean)
                : [];

            if (selectedDates.length === 0) {
                throw new Error("Vui lòng chọn ít nhất một ngày làm việc.");
            }

            const basePayload = {
                stylistId: Number(form.stylistId),
                startTime: form.startTime,
                endTime: form.endTime,
                isOff: !!form.isOff,
            };

            await Promise.all(
                selectedDates.map((workDate) =>
                    authApis().post(endpoints.adminSchedules, {
                        ...basePayload,
                        workDate,
                    }),
                ),
            );

            setForm(null);
            setMessage({
                type: "success",
                text: `Đã tạo ${selectedDates.length} lịch làm việc thành công.`,
            });
            await load();
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || error.message || "Lưu thất bại.",
            });
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Xóa lịch làm việc này?")) return;

        try {
            await authApis().delete(endpoints.adminScheduleDetail(id));
            setMessage({ type: "success", text: "Đã xóa lịch." });
            await load();
        } catch (e) {
            setMessage({
                type: "error",
                text: e.response?.data?.message || "Không thể xóa lịch.",
            });
        }
    };

    const openCreate = () => {
        setMessage({ type: "", text: "" });
        setForm({
            stylistId: stylists[0]?.id || "",
            workDates: [],
            startTime: DEFAULT_START_TIME,
            endTime: DEFAULT_END_TIME,
            isOff: false,
        });
    };

    const openEdit = (item) => {
        setMessage({ type: "", text: "" });
        setForm({
            ...item,
            workDates: [item.workDate],
            startTime: String(item.startTime || DEFAULT_START_TIME).slice(0, 5),
            endTime: String(item.endTime || DEFAULT_END_TIME).slice(0, 5),
            isOff: !!item.isOff,
        });
    };

    const toggleDate = (date) => {
        setForm((current) => {
            if (!current || current.id) return current;
            const exists = current.workDates.includes(date);
            return {
                ...current,
                workDates: exists ? current.workDates.filter((item) => item !== date) : [...current.workDates, date].sort(),
            };
        });
    };

    const selectWeekdays = () => {
        setForm((current) => {
            if (!current || current.id) return current;
            return {
                ...current,
                workDates: weekDates.map((item) => item.date),
            };
        });
    };

    const selectMondayToFriday = () => {
        setForm((current) => {
            if (!current || current.id) return current;
            return {
                ...current,
                workDates: weekDates.slice(0, 5).map((item) => item.date),
            };
        });
    };

    const clearSelectedDates = () => {
        setForm((current) => (current ? { ...current, workDates: [] } : current));
    };

    const moveWeek = (amount) => {
        setWeekStart((current) => {
            const next = new Date(current);
            next.setDate(next.getDate() + amount * 7);
            return next;
        });
    };

    const updateForm = (name, value) => {
        setForm((current) => (current ? { ...current, [name]: value } : current));
    };

    return (
        <div className="admin-page">
            <Header role="ADMIN" title="Lịch làm việc" />
            <main className="admin-main">
                <div className="admin-shell">
                    <div className="admin-heading">
                        <div>
                            <span className="admin-eyebrow">SCHEDULE MANAGEMENT</span>
                            <h1>Lịch làm việc</h1>
                            <p>Quản lý lịch làm việc và ngày nghỉ của stylist.</p>
                        </div>
                        <button className="admin-primary-button" type="button" onClick={openCreate}>TẠO LỊCH</button>
                    </div>

                    {message.text && (
                        <div className={`admin-alert ${message.type}`}>
                            <span>{message.text}</span>
                            <button type="button" onClick={() => setMessage({ type: "", text: "" })} aria-label="Đóng">×</button>
                        </div>
                    )}

                    <div className="admin-summary-grid">
                        <article>
                            <span>Stylist</span>
                            <strong>{new Set(items.map((x) => x.stylistId)).size}</strong>
                        </article>
                    </div>

                    <div className="admin-filter-card admin-schedule-filters">
                        <label>
                            <span>Stylist</span>
                            <select value={filter.stylistId} onChange={(e) => setFilter({ ...filter, stylistId: e.target.value })}>
                                <option value="">Tất cả stylist</option>
                                {stylists.map((s) => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Ngày</span>
                            <input type="date" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
                        </label>

                        <button type="button" className="admin-filter-reset" onClick={() => setFilter({ stylistId: "", date: "" })}>ĐẶT LẠI</button>
                    </div>

                    <div className="admin-table-card">
                        <div className="admin-table-top">
                            <div>
                                <h2>Danh sách lịch</h2>
                                <span>{filtered.length} lịch · Trang {filtered.length > 0 ? page + 1 : 0} / {filtered.length > 0 ? totalPages : 0}</span>
                            </div>
                            <button type="button" className="admin-refresh-btn" onClick={load} disabled={loading}>{loading ? "ĐANG TẢI..." : "LÀM MỚI"}</button>
                        </div>

                        {loading ? (
                            <div className="admin-empty">Đang tải...</div>
                        ) : filtered.length === 0 ? (
                            <div className="admin-empty">
                                <strong>Chưa có lịch</strong>
                                <span>Hãy tạo lịch làm việc cho stylist.</span>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Stylist</th>
                                            <th>Ngày</th>
                                            <th>Bắt đầu</th>
                                            <th>Kết thúc</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedItems.map((item) => (
                                            <tr key={item.id}>
                                                <td data-label="Stylist">{item.stylistName || getStylistName(item.stylistId) || "—"}</td>
                                                <td data-label="Ngày">{item.workDate}</td>
                                                <td data-label="Bắt đầu">{String(item.startTime || "").slice(0, 5) || "—"}</td>
                                                <td data-label="Kết thúc">{String(item.endTime || "").slice(0, 5) || "—"}</td>
                                                <td data-label="Trạng thái">
                                                    <span className={`admin-schedule-status ${item.isOff ? "off" : ""}`}>{item.isOff ? "Ngày nghỉ" : "Đang làm"}</span>
                                                </td>
                                                <td data-label="Thao tác" className="admin-user-actions">
                                                    <button type="button" className="admin-action-btn" onClick={() => openEdit(item)}>Sửa</button>
                                                    <button type="button" className="admin-action-btn delete" onClick={() => remove(item.id)}>Xóa</button>
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
                            {Array.from({ length: totalPages }, (_, index) => index).map((pageNumber) => (
                                <button key={pageNumber} type="button" className={`admin-page-button ${pageNumber === page ? "active" : ""}`} onClick={() => setPage(pageNumber)} disabled={loading}>
                                    {pageNumber + 1}
                                </button>
                            ))}
                            <button type="button" className="admin-page-button" onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))} disabled={page >= totalPages - 1 || loading || filtered.length === 0}>→</button>
                            <button type="button" className="admin-page-button" onClick={() => setPage(totalPages - 1)} disabled={totalPages <= 1 || page >= totalPages - 1 || loading}>⏭</button>
                        </div>
                    </div>
                </div>
            </main>

            {form && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <div>
                                <p className="admin-eyebrow">{form.id ? "UPDATE" : "CREATE"}</p>
                                <h2>{form.id ? "Sửa lịch" : "Tạo lịch làm việc"}</h2>
                            </div>
                            <button type="button" className="admin-modal-close" onClick={() => setForm(null)} disabled={saving}>×</button>
                        </div>

                        <form onSubmit={save}>
                            <div className="admin-modal-body">
                                <div className="admin-form-grid two-col">
                                    <label>
                                        <span>Stylist</span>
                                        <select required value={form.stylistId} onChange={(e) => updateForm("stylistId", e.target.value)}>
                                            {stylists.map((s) => (
                                                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                            ))}
                                        </select>
                                    </label>

                                    {!form.id ? (
                                        <div className="admin-schedule-week-summary">
                                            <span>Đã chọn</span>
                                            <strong>{form.workDates?.length || 0} ngày</strong>
                                        </div>
                                    ) : (
                                        <label>
                                            <span>Ngày làm việc</span>
                                            <input value={form.workDate || ""} disabled />
                                        </label>
                                    )}

                                    {!form.id && (
                                        <div className="admin-week-picker full-width">
                                            <div className="admin-week-picker-head">
                                                <div>
                                                    <span>Chọn ngày làm việc</span>
                                                    <small>Chọn nhiều ngày và chỉ cần nhập giờ một lần.</small>
                                                </div>
                                                <div className="admin-week-picker-actions">
                                                    <button type="button" onClick={() => moveWeek(-1)}>←</button>
                                                    <strong>{weekDates[0].date.split("-").reverse().join("/")} – {weekDates[6].date.split("-").reverse().join("/")}</strong>
                                                    <button type="button" onClick={() => moveWeek(1)}>→</button>
                                                </div>
                                            </div>

                                            <div className="admin-week-shortcuts">
                                                <button type="button" onClick={selectMondayToFriday}>Thứ 2 – Thứ 6</button>
                                                <button type="button" onClick={selectWeekdays}>Cả tuần</button>
                                                <button type="button" onClick={clearSelectedDates}>Bỏ chọn</button>
                                            </div>

                                            <div className="admin-week-grid">
                                                {weekDates.map((day) => {
                                                    const selected = form.workDates?.includes(day.date);
                                                    return (
                                                        <button type="button" key={day.date} className={`admin-week-day ${selected ? "selected" : ""}`} onClick={() => toggleDate(day.date)}>
                                                            <span>{day.label}</span>
                                                            <strong>{day.date.slice(-2)}</strong>
                                                            <small>{day.date.slice(0, 7)}</small>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <label>
                                        <span>Bắt đầu</span>
                                        <input type="time" value={form.startTime || DEFAULT_START_TIME} disabled={form.isOff} onChange={(e) => updateForm("startTime", e.target.value)} />
                                    </label>

                                    <label>
                                        <span>Kết thúc</span>
                                        <input type="time" value={form.endTime || DEFAULT_END_TIME} disabled={form.isOff} onChange={(e) => updateForm("endTime", e.target.value)} />
                                    </label>

                                    <label className="admin-form-checkbox full-width">
                                        <input type="checkbox" checked={!!form.isOff} onChange={(e) => updateForm("isOff", e.target.checked)} />
                                        <span>Đánh dấu ngày nghỉ</span>
                                    </label>
                                </div>

                                {!form.id && form.workDates?.length > 0 && (
                                    <div className="admin-form-note">
                                        {form.workDates.length === 1
                                            ? "1 lịch sẽ được tạo."
                                            : `${form.workDates.length} lịch sẽ được tạo cùng lúc cho stylist đã chọn.`}
                                    </div>
                                )}
                            </div>

                            <div className="admin-modal-footer">
                                <button type="button" className="admin-secondary-button" onClick={() => setForm(null)} disabled={saving}>HỦY</button>
                                <button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "ĐANG LƯU..." : form.id ? "LƯU" : `TẠO ${form.workDates?.length || 0} LỊCH`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSchedules;