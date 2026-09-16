import { useCallback, useEffect, useState } from "react";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "../../styles/admin/AdminCommon.css";
import "./ReceptionistCustomers.css";

const PAGE_SIZE = 10;

const GENDER_OPTIONS = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
    { value: "OTHER", label: "Khác" },
];

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    avatar: "",
    dob: "",
    gender: "MALE",
};

function getErrorMessage(error, fallback = "Có lỗi xảy ra.") {
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

function getInitials(customer) {
    const parts = (customer?.fullname || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return parts[0]?.charAt(0)?.toUpperCase() || customer?.email?.charAt(0)?.toUpperCase() || "C";
}

function getFormInitials(form) {
    const first = form?.firstName?.trim()?.charAt(0) || "";
    const last = form?.lastName?.trim()?.charAt(0) || "";
    return (first + last || form?.email?.charAt(0) || "C").toUpperCase();
}

function genderLabel(gender) {
    const found = GENDER_OPTIONS.find((item) => item.value === gender);
    return found?.label || gender || "—";
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatCurrency(value) {
    const amount = Number(value || 0);

    return amount.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    });
}

function splitFullname(fullname) {
    const parts = (fullname || "").trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return { firstName: "", lastName: "" };
    }

    if (parts.length === 1) {
        return { firstName: parts[0], lastName: "" };
    }

    return {
        firstName: parts.slice(0, -1).join(" "),
        lastName: parts[parts.length - 1],
    };
}

function ReceptionistCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [keyword, setKeyword] = useState("");
    const [gender, setGender] = useState("");
    const [status, setStatus] = useState("");

    const [notice, setNotice] = useState({ type: "", message: "" });

    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const loadCustomers = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page,
                size: PAGE_SIZE,
            };

            if (keyword.trim()) params.keyword = keyword.trim();
            if (gender) params.gender = gender;
            if (status !== "") params.isActive = status === "true";

            const response = await authApis().get(endpoints.adminCustomers, { params });
            const data = response.data || {};

            setCustomers(Array.isArray(data.content) ? data.content : []);
            setTotalPages(Number(data.totalPages || 0));
            setTotalElements(Number(data.totalElements || 0));
        } catch (error) {
            console.error("LOAD RECEPTIONIST CUSTOMERS ERROR:", error);

            setCustomers([]);
            setTotalPages(0);
            setTotalElements(0);

            setNotice({
                type: "error",
                message: getErrorMessage(error, "Không thể tải danh sách khách hàng."),
            });
        } finally {
            setLoading(false);
        }
    }, [keyword, gender, status, page]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const openCreateModal = () => {
        setNotice({ type: "", message: "" });
        setFormError("");
        setForm(EMPTY_FORM);
        setAvatarFile(null);
        setAvatarPreview("");
        setModal({ type: "create" });
    };

    const openEditModal = (customer) => {
        const fullname = splitFullname(customer.fullname);

        setNotice({ type: "", message: "" });
        setFormError("");
        setAvatarFile(null);
        setAvatarPreview(customer.avatar || "");

        setForm({
            firstName: fullname.firstName,
            lastName: fullname.lastName,
            email: customer.email || "",
            password: "",
            confirmPassword: "",
            phoneNumber: customer.phoneNumber || "",
            avatar: customer.avatar || "",
            dob: customer.dob || "",
            gender: customer.gender || "MALE",
            id: customer.id,
        });

        setSelectedCustomer(customer);
        setModal({ type: "edit", customer });
    };

    const closeModal = () => {
        if (saving) return;

        setSelectedCustomer(null);
        setModal(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setAvatarFile(null);
        setAvatarPreview("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0] || null;

        if (!file) {
            setAvatarFile(null);
            setAvatarPreview(modal?.type === "edit" ? form.avatar : "");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setFormError("Vui lòng chọn file hình ảnh.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFormError("Ảnh đại diện không được vượt quá 5MB.");
            event.target.value = "";
            return;
        }

        setFormError("");
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleCreateSubmit = async (event) => {
        event.preventDefault();

        if (!form.firstName.trim() || !form.lastName.trim()) {
            setFormError("Vui lòng nhập họ và tên khách hàng.");
            return;
        }

        if (!form.email.trim()) {
            setFormError("Vui lòng nhập email.");
            return;
        }

        if (!form.password) {
            setFormError("Vui lòng nhập mật khẩu.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setFormError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            setSaving(true);
            setNotice({ type: "", message: "" });
            setFormError("");

            const data = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                password: form.password,
                confirmPassword: form.confirmPassword,
                phoneNumber: form.phoneNumber.trim() || null,
                role: "CUSTOMER",
                isActive: true,
            };

            const formData = new FormData();

            formData.append(
                "data",
                new Blob([JSON.stringify(data)], {
                    type: "application/json",
                }),
            );

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            await authApis().post(endpoints.adminUsers, formData);

            setNotice({
                type: "success",
                message: "Tạo tài khoản khách hàng thành công.",
            });

            closeModal();
            setPage(0);
            await loadCustomers();
        } catch (error) {
            console.error("CREATE RECEPTIONIST CUSTOMER ERROR:", error);

            setFormError(
                getErrorMessage(
                    error,
                    "Không thể tạo tài khoản khách hàng.",
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();

        if (!selectedCustomer) return;

        if (!form.firstName.trim() || !form.lastName.trim()) {
            setFormError("Vui lòng nhập họ và tên khách hàng.");
            return;
        }

        try {
            setSaving(true);
            setNotice({ type: "", message: "" });
            setFormError("");

            const data = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phoneNumber: form.phoneNumber.trim() || null,
                avatar: form.avatar.trim() || null,
                dob: form.dob || null,
                gender: form.gender,
            };

            await authApis().put(
                endpoints.adminCustomerDetail(selectedCustomer.id),
                data,
            );

            setNotice({
                type: "success",
                message: "Cập nhật thông tin khách hàng thành công.",
            });

            closeModal();
            await loadCustomers();
        } catch (error) {
            console.error("UPDATE RECEPTIONIST CUSTOMER ERROR:", error);

            setFormError(
                getErrorMessage(
                    error,
                    "Không thể cập nhật thông tin khách hàng.",
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    const clearFilters = () => {
        setKeyword("");
        setGender("");
        setStatus("");
        setPage(0);
    };

    return (
        <div className="receptionist-customers-page">
            <Header role="RECEPTIONIST" title="Khách hàng" />

            <main className="admin-main">
                <div className="admin-shell">
                    <section className="admin-heading">
                        <div>
                            <span className="admin-eyebrow">CUSTOMER MANAGEMENT</span>
                            <h1>Quản lý khách hàng</h1>
                            <p>Tra cứu, cập nhật và tạo tài khoản khách hàng trong hệ thống.</p>
                        </div>

                        <button type="button" className="admin-primary-button" onClick={openCreateModal}>
                            + Tạo khách hàng
                        </button>
                    </section>

                    {notice.message && (
                        <div className={`admin-users-alert ${notice.type}`} role="alert">
                            <span>{notice.message}</span>
                            <button type="button" onClick={() => setNotice({ type: "", message: "" })} aria-label="Đóng">×</button>
                        </div>
                    )}

                    <section className="receptionist-customer-summary-grid">
                        <article>
                            <span>Tổng khách hàng</span>
                            <strong>{totalElements}</strong>
                        </article>

                        <article>
                            <span>Khách nam</span>
                            <strong>{customers.filter((item) => item.gender === "MALE").length}</strong>
                        </article>

                        <article>
                            <span>Khách nữ</span>
                            <strong>{customers.filter((item) => item.gender === "FEMALE").length}</strong>
                        </article>

                        <article>
                            <span>Trang hiện tại</span>
                            <strong>{totalPages ? page + 1 : 0}</strong>
                        </article>
                    </section>

                    <section className="receptionist-customer-filter-card">
                        <div className="receptionist-customer-filter-field receptionist-customer-filter-search">
                            <label htmlFor="customer-keyword">Tìm kiếm</label>
                            <input id="customer-keyword" value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0); }} placeholder="Tên, email, số điện thoại..." />
                        </div>

                        <div className="receptionist-customer-filter-field">
                            <label htmlFor="customer-gender">Giới tính</label>
                            <select id="customer-gender" value={gender} onChange={(event) => { setGender(event.target.value); setPage(0); }}>
                                <option value="">Tất cả giới tính</option>
                                {GENDER_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                            </select>
                        </div>

                        <div className="receptionist-customer-filter-field">
                            <label htmlFor="customer-status">Trạng thái</label>
                            <select id="customer-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
                                <option value="">Tất cả</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        <button type="button" className="admin-filter-reset" onClick={clearFilters}>Đặt lại</button>
                    </section>

                    <section className="receptionist-customers-table-card">
                        <div className="receptionist-customers-table-top">
                            <div>
                                <h2>Danh sách khách hàng</h2>
                                <span>Trang {totalPages ? page + 1 : 0} / {totalPages || 0}</span>
                            </div>

                            <button type="button" className="admin-refresh-btn" onClick={loadCustomers} disabled={loading}>
                                {loading ? "Đang tải..." : "↻ Làm mới"}
                            </button>
                        </div>

                        {loading ? (
                            <div className="admin-users-empty">Đang tải danh sách khách hàng...</div>
                        ) : customers.length === 0 ? (
                            <div className="admin-users-empty">
                                <strong>Không có khách hàng</strong>
                                <span>Thử thay đổi bộ lọc hoặc tạo khách hàng mới.</span>
                            </div>
                        ) : (
                            <div className="receptionist-customers-table-wrap">
                                <table className="receptionist-customers-table">
                                    <thead>
                                        <tr>
                                            <th>Khách hàng</th>
                                            <th>Số điện thoại</th>
                                            <th>Giới tính</th>
                                            <th>Ngày sinh</th>
                                            <th>Lượt sử dụng</th>
                                            <th>Tổng chi tiêu</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {customers.map((customer) => (
                                            <tr key={customer.id}>
                                                <td data-label="Khách hàng">
                                                    <div className="receptionist-customer-cell">
                                                        {customer.avatar ? <img src={customer.avatar} alt="" className="receptionist-customer-avatar" /> : <div className="receptionist-customer-avatar receptionist-customer-avatar-fallback">{getInitials(customer)}</div>}

                                                        <div>
                                                            <strong>{customer.fullname || "Chưa có tên"}</strong>
                                                            <span>{customer.email || "—"}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td data-label="Số điện thoại">{customer.phoneNumber || "—"}</td>

                                                <td data-label="Giới tính">
                                                    <span className={`receptionist-customer-gender gender-${(customer.gender || "unknown").toLowerCase()}`}>
                                                        {genderLabel(customer.gender)}
                                                    </span>
                                                </td>

                                                <td data-label="Ngày sinh">{formatDate(customer.dob)}</td>

                                                <td data-label="Lượt sử dụng">{customer.totalVisits ?? 0}</td>

                                                <td data-label="Tổng chi tiêu">{formatCurrency(customer.totalSpent)}</td>

                                                <td data-label="Thao tác">
                                                    <button type="button" className="receptionist-customer-view-btn" onClick={() => openEditModal(customer)}>
                                                        Sửa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="admin-pagination">
                            <button type="button" onClick={() => setPage(0)} disabled={page === 0 || loading}>⏮</button>
                            <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={page === 0 || loading}>←</button>

                            {Array.from({ length: Math.max(totalPages, 1) }, (_, index) => index).map((pageNumber) => (
                                <button key={pageNumber} type="button" className={pageNumber === page ? "active" : ""} onClick={() => setPage(pageNumber)} disabled={loading}>
                                    {pageNumber + 1}
                                </button>
                            ))}

                            <button type="button" onClick={() => setPage((current) => Math.min(current + 1, Math.max(totalPages - 1, 0)))} disabled={totalPages <= 1 || page >= totalPages - 1 || loading}>→</button>
                            <button type="button" onClick={() => setPage(Math.max(totalPages - 1, 0))} disabled={totalPages <= 1 || page >= totalPages - 1 || loading}>⏭</button>
                        </div>
                    </section>
                </div>
            </main>

            {modal?.type === "create" && (
                <div className="receptionist-customer-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
                    <div className="receptionist-customer-modal" role="dialog" aria-modal="true" aria-labelledby="receptionist-customer-create-title">
                        <div className="receptionist-customer-modal-header">
                            <div>
                                <span className="admin-eyebrow">CUSTOMER ACCOUNT</span>
                                <h2 id="receptionist-customer-create-title">Tạo khách hàng</h2>
                            </div>

                            <button type="button" className="admin-modal-close" onClick={closeModal} disabled={saving}>×</button>
                        </div>

                        <form onSubmit={handleCreateSubmit}>
                            <div className="receptionist-customer-modal-body">
                                {formError && <div className="admin-modal-error" role="alert">{formError}</div>}

                                <div className="receptionist-customer-edit-profile">

                                    <div>
                                        <strong>Khách hàng</strong>
                                        <span>Role: CUSTOMER</span>
                                    </div>
                                </div>

                                <div className="receptionist-customer-form-grid">
                                    <label>
                                        <span>Họ</span>
                                        <input name="firstName" value={form.firstName} onChange={handleChange} required />
                                    </label>

                                    <label>
                                        <span>Tên</span>
                                        <input name="lastName" value={form.lastName} onChange={handleChange} required />
                                    </label>

                                    <label className="full-width">
                                        <span>Email</span>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="customer@gmail.com" />
                                    </label>

                                    <label>
                                        <span>Mật khẩu</span>
                                        <input name="password" type="password" value={form.password} onChange={handleChange} required />
                                    </label>

                                    <label>
                                        <span>Xác nhận mật khẩu</span>
                                        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
                                    </label>

                                    <label>
                                        <span>Số điện thoại</span>
                                        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} inputMode="numeric" placeholder="0901234567" />
                                    </label>

                                    <label>
                                        <span>Ngày sinh</span>
                                        <input name="dob" type="date" value={form.dob || ""} onChange={handleChange} />
                                    </label>

                                    <label>
                                        <span>Giới tính</span>
                                        <select name="gender" value={form.gender} onChange={handleChange}>
                                            {GENDER_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                        </select>
                                    </label>

                                    <div className="admin-avatar-upload full-width">
                                        <div className="admin-avatar-preview">
                                            {avatarPreview ? <img src={avatarPreview} alt="Xem trước avatar" /> : <span>{getFormInitials(form)}</span>}
                                        </div>

                                        <div className="admin-avatar-upload-info">
                                            <span>Ảnh đại diện</span>

                                            <label className="admin-avatar-file-button">
                                                CHỌN ẢNH
                                                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} disabled={saving} />
                                            </label>

                                            <small>PNG, JPG hoặc WEBP · tối đa 5MB</small>

                                            {avatarFile && <strong>{avatarFile.name}</strong>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="receptionist-customer-modal-footer">
                                <button type="button" className="admin-secondary-button" onClick={closeModal} disabled={saving}>Hủy</button>
                                <button type="submit" className="admin-primary-button" disabled={saving}>
                                    {saving ? "Đang tạo..." : "Tạo khách hàng"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modal?.type === "edit" && selectedCustomer && (
                <div className="receptionist-customer-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
                    <div className="receptionist-customer-modal" role="dialog" aria-modal="true" aria-labelledby="receptionist-customer-modal-title">
                        <div className="receptionist-customer-modal-header">
                            <div>
                                <span className="admin-eyebrow">CUSTOMER PROFILE</span>
                                <h2 id="receptionist-customer-modal-title">Chỉnh sửa khách hàng</h2>
                            </div>

                            <button type="button" className="admin-modal-close" onClick={closeModal} disabled={saving}>×</button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="receptionist-customer-modal-body">
                                {formError && <div className="admin-modal-error" role="alert">{formError}</div>}

                                <div className="receptionist-customer-edit-profile">
                                    {form.avatar ? <img src={form.avatar} alt="Avatar khách hàng" className="receptionist-customer-detail-avatar" /> : <div className="receptionist-customer-detail-avatar receptionist-customer-avatar-fallback">{getInitials(selectedCustomer)}</div>}

                                    <div>
                                        <strong>{selectedCustomer.email || "—"}</strong>
                                        <span>Customer ID: {selectedCustomer.id}</span>
                                    </div>
                                </div>

                                <div className="receptionist-customer-form-grid">
                                    <label>
                                        <span>Họ</span>
                                        <input name="firstName" value={form.firstName} onChange={handleChange} required />
                                    </label>

                                    <label>
                                        <span>Tên</span>
                                        <input name="lastName" value={form.lastName} onChange={handleChange} required />
                                    </label>

                                    <label>
                                        <span>Số điện thoại</span>
                                        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} inputMode="tel" placeholder="0901234567" />
                                    </label>

                                    <label>
                                        <span>Ngày sinh</span>
                                        <input name="dob" type="date" value={form.dob || ""} onChange={handleChange} />
                                    </label>

                                    <label>
                                        <span>Giới tính</span>
                                        <select name="gender" value={form.gender} onChange={handleChange}>
                                            {GENDER_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                        </select>
                                    </label>

                                    <label className="full-width">
                                        <span>Avatar URL</span>
                                        <input name="avatar" value={form.avatar} onChange={handleChange} placeholder="https://..." />
                                    </label>
                                </div>
                            </div>

                            <div className="receptionist-customer-modal-footer">
                                <button type="button" className="admin-secondary-button" onClick={closeModal} disabled={saving}>Hủy</button>
                                <button type="submit" className="admin-primary-button" disabled={saving}>
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReceptionistCustomers;