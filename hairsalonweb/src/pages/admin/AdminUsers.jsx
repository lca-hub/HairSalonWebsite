import { useCallback, useEffect, useMemo, useState } from "react";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "../../styles/admin/AdminCommon.css";
import "./AdminUsers.css";

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
    { value: "CUSTOMER", label: "Customer" },
    { value: "STYLIST", label: "Stylist" },
    { value: "RECEPTIONIST", label: "Receptionist" },
];

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    avatar: "",
    role: "CUSTOMER",
    isActive: true,
};

function getErrorMessage(error, fallback = "Có lỗi xảy ra.") {
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

function getInitials(user) {
    const first = user?.firstName?.trim()?.charAt(0) || "";
    const last = user?.lastName?.trim()?.charAt(0) || "";
    return (first + last || user?.email?.charAt(0) || "U").toUpperCase();
}

function roleLabel(role) {
    const found = ROLE_OPTIONS.find((item) => item.value === role);
    return found?.label || role || "—";
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [keyword, setKeyword] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [notice, setNotice] = useState({ type: "", message: "" });
    const [formError, setFormError] = useState("");
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page,
                size: PAGE_SIZE,
            };

            if (keyword.trim()) params.keyword = keyword.trim();
            if (role) params.role = role;
            if (status !== "") params.isActive = status === "true";

            const response = await authApis().get(endpoints.adminUsers, { params });
            const data = response.data || {};

            setUsers(Array.isArray(data.content) ? data.content : []);
            setTotalPages(Number(data.totalPages || 0));
            setTotalElements(Number(data.totalElements || 0));
        } catch (error) {
            console.error("LOAD ADMIN USERS ERROR:", error);
            setUsers([]);
            setTotalPages(0);
            setTotalElements(0);
            setNotice({
                type: "error",
                message: getErrorMessage(error, "Không thể tải danh sách người dùng."),
            });
        } finally {
            setLoading(false);
        }
    }, [keyword, role, status, page]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
    }, [loadUsers]);

    const openCreateModal = () => {
        setNotice({ type: "", message: "" });
        setFormError("");
        setForm(EMPTY_FORM);
        setAvatarFile(null);
        setAvatarPreview("");
        setModal({ type: "create" });
    };

    const openEditModal = (user) => {
        if (user.role === "ADMIN") return;

        setNotice({ type: "", message: "" });
        setFormError("");
        setAvatarFile(null);
        setAvatarPreview(user.avatar || "");
        setForm({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            password: "",
            confirmPassword: "",
            phoneNumber: user.phoneNumber || "",
            avatar: user.avatar || "",
            role: user.role || "CUSTOMER",
            isActive: Boolean(user.isActive),
            id: user.id,
        });
        setModal({ type: "edit", user });
    };

    const closeModal = () => {
        if (saving) return;

        setModal(null);
        setFormError("");
        setForm(EMPTY_FORM);
        setAvatarFile(null);
        setAvatarPreview("");
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (modal?.type === "create" && form.password !== form.confirmPassword) {
            setFormError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            setSaving(true);
            setNotice({ type: "", message: "" });
            setFormError("");

            const data = modal?.type === "create"
                ? {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                    phoneNumber: form.phoneNumber.trim() || null,
                    role: form.role,
                    isActive: form.isActive,
                }
                : {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim() || null,
                    avatar: form.avatar.trim() || null,
                    role: form.role,
                    isActive: form.isActive,
                };

            const formData = new FormData();
            formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            if (modal?.type === "create") {
                await authApis().post(endpoints.adminUsers, formData);
                setNotice({ type: "success", message: "Tạo tài khoản thành công." });
            } else {
                await authApis().put(endpoints.adminUserDetail(form.id), formData);
                setNotice({ type: "success", message: "Cập nhật tài khoản thành công." });
            }

            closeModal();
            await loadUsers();
        } catch (error) {
            console.error("SAVE ADMIN USER ERROR:", error);
            setFormError(getErrorMessage(error, "Không thể lưu tài khoản."));
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (user) => {
        if (user.role === "ADMIN") return;

        const nextStatus = !user.isActive;

        try {
            setNotice({ type: "", message: "" });
            await authApis().patch(endpoints.adminUserStatus(user.id), null, {
                params: { isActive: nextStatus },
            });
            setNotice({
                type: "success",
                message: nextStatus ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.",
            });
            await loadUsers();
        } catch (error) {
            console.error("UPDATE USER STATUS ERROR:", error);
            setNotice({
                type: "error",
                message: getErrorMessage(error, "Không thể cập nhật trạng thái."),
            });
        }
    };

    const deleteUser = async (user) => {
        if (user.role === "ADMIN") return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa tài khoản "${user.firstName || ""} ${user.lastName || ""}"?\n\nThao tác này không thể hoàn tác.`,
        );

        if (!confirmed) return;

        try {
            setNotice({ type: "", message: "" });
            await authApis().delete(endpoints.adminUserDetail(user.id));
            setNotice({ type: "success", message: "Xóa tài khoản thành công." });

            if (users.length === 1 && page > 0) {
                setPage((current) => current - 1);
            } else {
                await loadUsers();
            }
        } catch (error) {
            console.error("DELETE ADMIN USER ERROR:", error);
            setNotice({
                type: "error",
                message: getErrorMessage(error, "Không thể xóa tài khoản."),
            });
        }
    };

    const resetPassword = async (user) => {
        if (user.role === "ADMIN") return;

        const confirmed = window.confirm(
            `Reset mật khẩu cho ${user.email}?\n\nMật khẩu tạm thời: Salon@123`,
        );

        if (!confirmed) return;

        try {
            setNotice({ type: "", message: "" });
            await authApis().post(endpoints.adminUserResetPassword(user.id));
            setNotice({
                type: "success",
                message: `Đã reset mật khẩu cho ${user.email}. Mật khẩu tạm thời: Salon@123`,
            });
        } catch (error) {
            console.error("RESET ADMIN USER PASSWORD ERROR:", error);
            setNotice({
                type: "error",
                message: getErrorMessage(error, "Không thể reset mật khẩu."),
            });
        }
    };

    const clearFilters = () => {
        setKeyword("");
        setRole("");
        setStatus("");
        setPage(0);
    };

    const roleSummary = useMemo(() => {
        return users.reduce(
            (summary, user) => {
                const key = user.role || "OTHER";
                summary[key] = (summary[key] || 0) + 1;
                return summary;
            },
            {},
        );
    }, [users]);

    return (
        <div className="admin-page">
            <Header role="ADMIN" title="Người dùng" />

            <main className="admin-main">
                <div className="admin-shell">
                    <section className="admin-heading">
                        <div>
                            <span className="admin-eyebrow">USER MANAGEMENT</span>
                            <h1>Quản lý người dùng</h1>
                            <p>Quản lý tài khoản Customer, Stylist và Receptionist trong hệ thống.</p>
                        </div>
                        <button className="admin-primary-button" type="button" onClick={openCreateModal}>Tạo tài khoản</button>
                    </section>

                    {notice.message && (
                        <div className={`admin-users-alert ${notice.type}`} role="alert">
                            <span>{notice.message}</span>
                            <button type="button" onClick={() => setNotice({ type: "", message: "" })} aria-label="Đóng">×</button>
                        </div>
                    )}

                    <section className="admin-user-summary-grid">
                        <article>
                            <span>Tổng tài khoản</span>
                            <strong>{totalElements}</strong>
                        </article>
                        <article>
                            <span>Customer</span>
                            <strong>{roleSummary.CUSTOMER || 0}</strong>
                        </article>
                        <article>
                            <span>Stylist</span>
                            <strong>{roleSummary.STYLIST || 0}</strong>
                        </article>
                        <article>
                            <span>Receptionist</span>
                            <strong>{roleSummary.RECEPTIONIST || 0}</strong>
                        </article>
                    </section>

                    <section className="admin-user-filter-card">
                        <div className="admin-user-filter-field admin-user-filter-search">
                            <label htmlFor="user-keyword">Tìm kiếm</label>
                            <input
                                id="user-keyword"
                                value={keyword}
                                onChange={(event) => {
                                    setKeyword(event.target.value);
                                    setPage(0);
                                }}
                                placeholder="Tên, email..."
                            />
                        </div>

                        <div className="admin-user-filter-field">
                            <label htmlFor="user-role">Vai trò</label>
                            <select
                                id="user-role"
                                value={role}
                                onChange={(event) => {
                                    setRole(event.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">Tất cả vai trò</option>
                                {ROLE_OPTIONS.map((item) => (
                                    <option value={item.value} key={item.value}>{item.label}</option>
                                ))}
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div className="admin-user-filter-field">
                            <label htmlFor="user-status">Trạng thái</label>
                            <select
                                id="user-status"
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        <button type="button" className="admin-filter-reset" onClick={clearFilters}>Đặt lại</button>
                    </section>

                    <section className="admin-users-table-card">
                        <div className="admin-users-table-top">
                            <div>
                                <h2>Danh sách tài khoản</h2>
                                <span>Trang {totalPages ? page + 1 : 0} / {totalPages || 0}</span>
                            </div>
                            <button type="button" className="admin-refresh-btn" onClick={loadUsers} disabled={loading}>
                                {loading ? "Đang tải..." : "↻ Làm mới"}
                            </button>
                        </div>

                        {loading ? (
                            <div className="admin-users-empty">Đang tải danh sách...</div>
                        ) : users.length === 0 ? (
                            <div className="admin-users-empty">
                                <strong>Không có tài khoản</strong>
                                <span>Thử thay đổi bộ lọc hoặc tạo tài khoản mới.</span>
                            </div>
                        ) : (
                            <div className="admin-users-table-wrap">
                                <table className="admin-users-table">
                                    <thead>
                                        <tr>
                                            <th>Người dùng</th>
                                            <th>Số điện thoại</th>
                                            <th>Vai trò</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày tạo</th>
                                            <th className="admin-users-actions-head">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td data-label="Người dùng">
                                                    <div className="admin-user-cell">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="" className="admin-user-avatar" />
                                                        ) : (
                                                            <div className="admin-user-avatar admin-user-avatar-fallback">{getInitials(user)}</div>
                                                        )}
                                                        <div>
                                                            <strong>{`${user.firstName || ""} ${user.lastName || ""}`.trim() || "Chưa có tên"}</strong>
                                                            <span>{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td data-label="Số điện thoại">{user.phoneNumber || "—"}</td>
                                                <td data-label="Vai trò">
                                                    <span className={`admin-role-badge role-${(user.role || "OTHER").toLowerCase()}`}>
                                                        {roleLabel(user.role)}
                                                    </span>
                                                </td>
                                                <td data-label="Trạng thái">
                                                    <span className={`admin-status-badge ${user.isActive ? "active" : "inactive"}`}>
                                                        {user.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td data-label="Ngày tạo">{formatDate(user.createdAt)}</td>
                                                <td data-label="Thao tác">
                                                    <div className="admin-user-actions">
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn edit"
                                                            onClick={() => openEditModal(user)}
                                                            disabled={user.role === "ADMIN"}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn toggle"
                                                            onClick={() => updateStatus(user)}
                                                            disabled={user.role === "ADMIN"}
                                                        >
                                                            {user.isActive ? "Khóa" : "Mở"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn reset"
                                                            onClick={() => resetPassword(user)}
                                                            disabled={user.role === "ADMIN"}
                                                        >
                                                            Reset
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn delete"
                                                            onClick={() => deleteUser(user)}
                                                            disabled={user.role === "ADMIN"}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
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
                            {Array.from({ length: Math.max(totalPages, 1) }, (_, index) => index).map((pageNumber) => (
                                <button key={pageNumber} type="button" className={`admin-page-button ${pageNumber === page ? "active" : ""}`} onClick={() => setPage(pageNumber)} disabled={loading}>
                                    {pageNumber + 1}
                                </button>
                            ))}
                            <button type="button" className="admin-page-button" onClick={() => setPage((current) => Math.min(current + 1, Math.max(totalPages - 1, 0)))} disabled={totalPages <= 1 || page >= totalPages - 1 || loading}>→</button>
                            <button type="button" className="admin-page-button" onClick={() => setPage(Math.max(totalPages - 1, 0))} disabled={totalPages <= 1 || page >= totalPages - 1 || loading}>⏭</button>
                        </div>
                    </section>
                </div>
            </main>

            {modal && (
                <div
                    className="admin-user-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    <div className="admin-user-modal" role="dialog" aria-modal="true" aria-labelledby="admin-user-modal-title">
                        <div className="admin-user-modal-header">
                            <div>
                                <span className="admin-eyebrow">ACCOUNT</span>
                                <h2 id="admin-user-modal-title">{modal.type === "create" ? "Tạo tài khoản" : "Chỉnh sửa tài khoản"}</h2>
                            </div>
                            <button type="button" className="admin-modal-close" onClick={closeModal} disabled={saving}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="admin-user-modal-body">
                                {formError && (
                                    <div className="admin-modal-error" role="alert">{formError}</div>
                                )}

                                <div className="admin-form-grid two-col">
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
                                        <input name="email" type="email" value={form.email} onChange={handleChange} required />
                                    </label>
                                    <label>
                                        <span>Số điện thoại</span>
                                        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} inputMode="numeric" placeholder="0901234567" />
                                    </label>
                                    <label>
                                        <span>Vai trò</span>
                                        <select
                                            name="role"
                                            value={form.role}
                                            onChange={handleChange}
                                            disabled={modal.type === "edit" && modal.user?.role === "ADMIN"}
                                            required
                                        >
                                            {ROLE_OPTIONS.map((item) => (
                                                <option key={item.value} value={item.value}>{item.label}</option>
                                            ))}
                                        </select>
                                    </label>

                                    {modal.type === "create" && (
                                        <>
                                            <label>
                                                <span>Mật khẩu</span>
                                                <input name="password" type="password" value={form.password} onChange={handleChange} required />
                                            </label>
                                            <label>
                                                <span>Xác nhận mật khẩu</span>
                                                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
                                            </label>
                                        </>
                                    )}

                                    <div className="admin-avatar-upload full-width">
                                        <div className="admin-avatar-preview">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Xem trước avatar" />
                                            ) : (
                                                <span>{getInitials(form)}</span>
                                            )}
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

                                    <label className="admin-form-checkbox">
                                        <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
                                        <span>Tài khoản đang hoạt động</span>
                                    </label>
                                </div>

                                {modal.type === "edit" && modal.user?.role === "ADMIN" && (
                                    <div className="admin-form-note">
                                        Tài khoản ADMIN được bảo vệ và không thể chỉnh sửa từ màn hình này.
                                    </div>
                                )}
                            </div>

                            <div className="admin-user-modal-footer">
                                <button type="button" className="admin-secondary-button" onClick={closeModal} disabled={saving}>Hủy</button>
                                <button type="submit" className="admin-primary-button" disabled={saving}>
                                    {saving ? "Đang lưu..." : modal.type === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;