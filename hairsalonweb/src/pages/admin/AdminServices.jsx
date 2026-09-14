import { useCallback, useEffect, useMemo, useState } from "react";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "../../styles/admin/AdminCommon.css";
import "./AdminServices.css";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
    name: "",
    serviceCode: "",
    categoryId: "",
    price: "",
    durationMinutes: "",
    description: "",
    isActive: true,
};

const EMPTY_CATEGORY_FORM = {
    name: "",
    description: "",
};

function getErrorMessage(error, fallback = "Có lỗi xảy ra.") {
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatDuration(value) {
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes <= 0) return "—";
    if (minutes < 60) return `${minutes} phút`;

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}

function normalizeContent(data) {
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.content) ? data.content : [];
}

function AdminServices() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [keyword, setKeyword] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [status, setStatus] = useState("");
    const [notice, setNotice] = useState({ type: "", message: "" });
    const [formError, setFormError] = useState("");
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [categoryModal, setCategoryModal] = useState(null);
    const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
    const [categorySaving, setCategorySaving] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    const loadCategories = useCallback(async () => {
        try {
            const response = await authApis().get(endpoints.serviceCategories);
            setCategories(normalizeContent(response.data));
        } catch (error) {
            console.error("LOAD SERVICE CATEGORIES ERROR:", error);
            setCategories([]);
        }
    }, []);

    const loadServices = useCallback(async () => {
        try {
            setLoading(true);

            const params = { page, size: PAGE_SIZE };
            if (keyword.trim()) params.keyword = keyword.trim();
            if (categoryId) params.categoryId = categoryId;
            if (status !== "") params.isActive = status === "true";

            const response = await authApis().get(endpoints.adminServices, { params });
            const data = response.data || {};

            setServices(normalizeContent(data));
            setTotalPages(Number(data.totalPages || 0));
            setTotalElements(Number(data.totalElements || 0));
        } catch (error) {
            console.error("LOAD ADMIN SERVICES ERROR:", error);
            setServices([]);
            setTotalPages(0);
            setTotalElements(0);
            setNotice({
                type: "error",
                message: getErrorMessage(error, "Không thể tải danh sách dịch vụ."),
            });
        } finally {
            setLoading(false);
        }
    }, [keyword, categoryId, status, page]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const openCreateModal = () => {
        setNotice({ type: "", message: "" });
        setFormError("");
        setForm(EMPTY_FORM);
        setModal({ type: "create" });
    };

    const openEditModal = (service) => {
        setNotice({ type: "", message: "" });
        setFormError("");
        setForm({
            id: service.id,
            name: service.name || "",
            serviceCode: service.serviceCode || "",
            categoryId: service.categoryId || service.category?.id || "",
            price: service.price ?? "",
            durationMinutes: service.durationMinutes ?? service.duration ?? "",
            description: service.description || "",
            isActive: service.isActive !== false,
        });
        setModal({ type: "edit", service });
    };

    const closeModal = () => {
        if (saving) return;
        setModal(null);
        setFormError("");
        setForm(EMPTY_FORM);
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        if (!form.name.trim()) {
            setFormError("Vui lòng nhập tên dịch vụ.");
            return;
        }

        if (!form.serviceCode.trim()) {
            setFormError("Vui lòng nhập mã dịch vụ.");
            return;
        }

        if (!form.categoryId) {
            setFormError("Vui lòng chọn danh mục.");
            return;
        }

        if (Number(form.price) < 0) {
            setFormError("Giá dịch vụ không hợp lệ.");
            return;
        }

        if (Number(form.durationMinutes) <= 0) {
            setFormError("Thời lượng dịch vụ phải lớn hơn 0 phút.");
            return;
        }

        try {
            setSaving(true);
            setNotice({ type: "", message: "" });

            const payload = {
                name: form.name.trim(),
                serviceCode: form.serviceCode.trim(),
                categoryId: Number(form.categoryId),
                price: Number(form.price),
                durationMinutes: Number(form.durationMinutes),
                description: form.description.trim() || null,
                isActive: Boolean(form.isActive),
            };

            if (modal?.type === "create") {
                await authApis().post(endpoints.adminServices, payload);
                setNotice({ type: "success", message: "Tạo dịch vụ thành công." });
            } else {
                await authApis().put(endpoints.adminServiceDetail(form.id), payload);
                setNotice({ type: "success", message: "Cập nhật dịch vụ thành công." });
            }

            closeModal();
            await loadServices();
        } catch (error) {
            console.error("SAVE ADMIN SERVICE ERROR:", error);
            console.error("STATUS:", error?.response?.status);
            console.error("DATA:", error?.response?.data);
            console.error("MESSAGE:", error?.response?.data?.message);
            setFormError(getErrorMessage(error, "Không thể lưu dịch vụ."));
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (service) => {
        try {
            setNotice({ type: "", message: "" });
            const nextStatus = !service.isActive;

            await authApis().patch(endpoints.adminServiceStatus(service.id), null, {
                params: { isActive: nextStatus },
            });

            setNotice({
                type: "success",
                message: nextStatus ? "Đã mở dịch vụ." : "Đã ẩn dịch vụ.",
            });

            await loadServices();
        } catch (error) {
            console.error("UPDATE ADMIN SERVICE STATUS ERROR:", error);
            setNotice({
                type: "error",
                message: getErrorMessage(error, "Không thể cập nhật trạng thái dịch vụ."),
            });
        }
    };

    const openCreateCategoryModal = () => {
        setCategoryError("");
        setCategoryForm(EMPTY_CATEGORY_FORM);
        setCategoryModal({ type: "create" });
    };

    const openEditCategoryModal = (category) => {
        setCategoryError("");
        setCategoryForm({
            id: category.id,
            name: category.name || "",
            description: category.description || "",
        });
        setCategoryModal({ type: "edit", category });
    };

    const closeCategoryModal = () => {
        if (categorySaving) return;
        setCategoryModal(null);
        setCategoryError("");
        setCategoryForm(EMPTY_CATEGORY_FORM);
    };

    const handleCategoryChange = (event) => {
        const { name, value } = event.target;
        setCategoryForm((current) => ({ ...current, [name]: value }));
    };

    const handleCategorySubmit = async (event) => {
        event.preventDefault();
        setCategoryError("");

        if (!categoryForm.name.trim()) {
            setCategoryError("Vui lòng nhập tên danh mục.");
            return;
        }

        try {
            setCategorySaving(true);

            const payload = {
                name: categoryForm.name.trim(),
                description: categoryForm.description.trim() || null,
                type: "SERVICE",
            };

            if (categoryModal?.type === "create") {
                await authApis().post(endpoints.adminCategories, payload);
                setNotice({ type: "success", message: "Tạo danh mục dịch vụ thành công." });
            } else {
                await authApis().put(endpoints.adminCategoryDetail(categoryForm.id), payload);
                setNotice({ type: "success", message: "Cập nhật danh mục dịch vụ thành công." });
            }

            closeCategoryModal();
            await loadCategories();
        } catch (error) {
            console.error("SAVE SERVICE CATEGORY ERROR:", error);
            setCategoryError(getErrorMessage(error, "Không thể lưu danh mục dịch vụ."));
        } finally {
            setCategorySaving(false);
        }
    };

    const clearFilters = () => {
        setKeyword("");
        setCategoryId("");
        setStatus("");
        setPage(0);
    };

    const inactiveCount = useMemo(
        () => services.filter((service) => service.isActive === false).length,
        [services]
    );

    const displayTotalPages = Math.max(totalPages, 1);

    return (
        <div className="admin-page">
            <Header role="ADMIN" title="Dịch vụ" />

            <main className="admin-main">
                <div className="admin-shell">
                    <section className="admin-heading">
                        <div>
                            <span className="admin-eyebrow">SERVICE MANAGEMENT</span>
                            <h1>Quản lý dịch vụ</h1>
                            <p>Quản lý dịch vụ làm tóc, giá, thời lượng và trạng thái hoạt động.</p>
                        </div>
                        <div className="admin-heading-actions">
                            <button className="admin-secondary-button" type="button" onClick={openCreateCategoryModal}>
                                + Tạo danh mục
                            </button>
                            <button className="admin-primary-button" type="button" onClick={openCreateModal}>
                                + Tạo dịch vụ
                            </button>
                        </div>
                    </section>

                    {notice.message && (
                        <div className={`admin-alert ${notice.type}`} role="alert">
                            <span>{notice.message}</span>
                            <button type="button" onClick={() => setNotice({ type: "", message: "" })} aria-label="Đóng">
                                ×
                            </button>
                        </div>
                    )}

                    <section className="admin-summary-grid">
                        <article><span>Tổng dịch vụ</span><strong>{totalElements}</strong></article>
                        <article><span>Đang ẩn</span><strong>{inactiveCount}</strong></article>
                        <article><span>Danh mục</span><strong>{categories.length}</strong></article>
                    </section>

                    <section className="admin-filter-card admin-service-filters">
                        <label>
                            <span>Tìm kiếm</span>
                            <input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0); }} placeholder="Tên dịch vụ..." />
                        </label>
                        <label>
                            <span>Danh mục</span>
                            <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(0); }}>
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span>Trạng thái</span>
                            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
                                <option value="">Tất cả</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </label>
                        <button className="admin-filter-reset" type="button" onClick={clearFilters}>Đặt lại</button>
                    </section>

                    <section className="admin-category-card">
                        <div className="admin-table-top">
                            <div>
                                <h2>Danh mục dịch vụ</h2>
                                <span>{categories.length} danh mục đang có</span>
                            </div>
                            <button className="admin-refresh-btn" type="button" onClick={openCreateCategoryModal}>
                                + Thêm danh mục
                            </button>
                        </div>

                        {categories.length === 0 ? (
                            <div className="admin-empty admin-category-empty">
                                <strong>Chưa có danh mục</strong>
                                <span>Tạo danh mục trước khi tạo dịch vụ.</span>
                            </div>
                        ) : (
                            <div className="admin-category-list">
                                {categories.map((category) => (
                                    <div className="admin-category-item" key={category.id}>
                                        <div>
                                            <strong>{category.name || "Chưa có tên"}</strong>
                                            <span>{category.description || "Chưa có mô tả"}</span>
                                        </div>
                                        <button type="button" className="admin-action-btn" onClick={() => openEditCategoryModal(category)}>
                                            Sửa
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="admin-table-card">
                        <div className="admin-table-top">
                            <div>
                                <h2>Danh sách dịch vụ</h2>
                                <span>Trang {totalPages ? page + 1 : 0} / {totalPages || 0} · {totalElements} dịch vụ</span>
                            </div>
                            <button className="admin-refresh-btn" type="button" onClick={loadServices} disabled={loading}>
                                {loading ? "Đang tải..." : "↻ Làm mới"}
                            </button>
                        </div>

                        {loading ? (
                            <div className="admin-empty">Đang tải danh sách...</div>
                        ) : services.length === 0 ? (
                            <div className="admin-empty">
                                <strong>Không có dịch vụ</strong>
                                <span>Thử thay đổi bộ lọc hoặc tạo dịch vụ mới.</span>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table admin-services-table">
                                    <thead>
                                        <tr>
                                            <th>Dịch vụ</th>
                                            <th>Danh mục</th>
                                            <th>Giá</th>
                                            <th>Thời lượng</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((service) => (
                                            <tr key={service.id}>
                                                <td data-label="Dịch vụ">
                                                    <div className="admin-service-cell">
                                                        <strong>{service.name || "Chưa có tên"}</strong>
                                                        <span>{service.description || "Chưa có mô tả"}</span>
                                                    </div>
                                                </td>
                                                <td data-label="Danh mục">{service.categoryName || service.category?.name || "—"}</td>
                                                <td data-label="Giá">{formatMoney(service.price)}</td>
                                                <td data-label="Thời lượng">{formatDuration(service.durationMinutes ?? service.duration)}</td>
                                                <td data-label="Trạng thái">
                                                    <span className={`admin-service-status ${service.isActive === false ? "inactive" : "active"}`}>
                                                        {service.isActive === false ? "Inactive" : "Active"}
                                                    </span>
                                                </td>
                                                <td data-label="Thao tác">
                                                    <div className="admin-service-actions">
                                                        <button type="button" className="admin-action-btn" onClick={() => openEditModal(service)}>Sửa</button>
                                                        <button type="button" className="admin-action-btn" onClick={() => updateStatus(service)}>
                                                            {service.isActive === false ? "Mở" : "Ẩn"}
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
                            {Array.from({ length: displayTotalPages }, (_, index) => index).map((pageNumber) => (
                                <button key={pageNumber} type="button" className={`admin-page-button ${pageNumber === page ? "active" : ""}`} onClick={() => setPage(pageNumber)} disabled={loading}>
                                    {pageNumber + 1}
                                </button>
                            ))}
                            <button type="button" className="admin-page-button" onClick={() => setPage((current) => Math.min(current + 1, displayTotalPages - 1))} disabled={page >= displayTotalPages - 1 || loading}>→</button>
                            <button type="button" className="admin-page-button" onClick={() => setPage(displayTotalPages - 1)} disabled={displayTotalPages <= 1 || page >= displayTotalPages - 1 || loading}>⏭</button>
                        </div>
                    </section>
                </div>
            </main>

            {categoryModal && (
                <div
                    className="admin-service-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeCategoryModal();
                    }}
                >
                    <div className="admin-service-modal admin-category-modal" role="dialog" aria-modal="true" aria-labelledby="admin-category-modal-title">
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-eyebrow">SERVICE CATEGORY</span>
                                <h2 id="admin-category-modal-title">
                                    {categoryModal.type === "create" ? "Tạo danh mục dịch vụ" : "Chỉnh sửa danh mục"}
                                </h2>
                            </div>
                            <button type="button" className="admin-modal-close" onClick={closeCategoryModal} disabled={categorySaving}>×</button>
                        </div>

                        <form onSubmit={handleCategorySubmit}>
                            <div className="admin-modal-body">
                                {categoryError && <div className="admin-modal-error" role="alert">{categoryError}</div>}
                                <div className="admin-form-grid">
                                    <label>
                                        <span>Tên danh mục</span>
                                        <input name="name" value={categoryForm.name} onChange={handleCategoryChange} required maxLength={100} placeholder="Ví dụ: Cắt tóc" />
                                    </label>
                                    <label>
                                        <span>Mô tả</span>
                                        <textarea name="description" value={categoryForm.description} onChange={handleCategoryChange} placeholder="Mô tả ngắn về danh mục..." />
                                    </label>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button type="button" className="admin-secondary-button" onClick={closeCategoryModal} disabled={categorySaving}>Hủy</button>
                                <button type="submit" className="admin-primary-button" disabled={categorySaving}>
                                    {categorySaving ? "Đang lưu..." : categoryModal.type === "create" ? "Tạo danh mục" : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modal && (
                <div
                    className="admin-service-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    <div className="admin-service-modal" role="dialog" aria-modal="true" aria-labelledby="admin-service-modal-title">
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-eyebrow">SERVICE</span>
                                <h2 id="admin-service-modal-title">
                                    {modal.type === "create" ? "Tạo dịch vụ" : "Chỉnh sửa dịch vụ"}
                                </h2>
                            </div>
                            <button type="button" className="admin-modal-close" onClick={closeModal} disabled={saving}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body">
                                {formError && <div className="admin-modal-error" role="alert">{formError}</div>}

                                <div className="admin-form-grid two-col">
                                    <label className="full-width">
                                        <span>Tên dịch vụ</span>
                                        <input name="name" value={form.name} onChange={handleChange} required placeholder="Ví dụ: Cắt và tạo kiểu" />
                                    </label>
                                    <label>
                                        <span>Mã dịch vụ</span>
                                        <input name="serviceCode" value={form.serviceCode} onChange={handleChange} required maxLength={50} placeholder="Ví dụ: CAT-001" />
                                    </label>
                                    <label>
                                        <span>Danh mục</span>
                                        <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        <span>Giá</span>
                                        <input name="price" type="number" min="0" step="1000" value={form.price} onChange={handleChange} required />
                                    </label>
                                    <label>
                                        <span>Thời lượng (phút)</span>
                                        <input name="durationMinutes" type="number" min="5" step="5" value={form.durationMinutes} onChange={handleChange} required placeholder="Ví dụ: 90" />
                                    </label>
                                    <label className="full-width">
                                        <span>Mô tả</span>
                                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả ngắn về dịch vụ..." />
                                    </label>
                                    <label className="admin-form-checkbox">
                                        <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
                                        <span>Dịch vụ đang hoạt động</span>
                                    </label>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button type="button" className="admin-secondary-button" onClick={closeModal} disabled={saving}>Hủy</button>
                                <button type="submit" className="admin-primary-button" disabled={saving}>
                                    {saving ? "Đang lưu..." : modal.type === "create" ? "Tạo dịch vụ" : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminServices;