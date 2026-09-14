import { useCallback, useEffect, useMemo, useState } from "react";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "../../styles/admin/AdminCommon.css";
import "./AdminProducts.css";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
    supplierId: "",
    productCode: "",
    name: "",
    price: "",
    categoryId: "",
    stockQuantity: 0,
    minStockAlert: 5,
    imageUrl: "",
    isActive: true,
};

const EMPTY_CATEGORY_FORM = {
    name: "",
    description: "",
};

const EMPTY_SUPPLIER_FORM = {
    name: "",
    phone: "",
    email: "",
    address: "",
};

function getErrorMessage(error, fallback = "Có lỗi xảy ra.") {
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function normalizeContent(data) {
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.content) ? data.content : [];
}

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [keyword, setKeyword] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [status, setStatus] = useState("");

    const [notice, setNotice] = useState({
        type: "",
        message: "",
    });

    const [formError, setFormError] = useState("");
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [categoryModal, setCategoryModal] = useState(null);
    const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
    const [categorySaving, setCategorySaving] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    const [supplierModal, setSupplierModal] = useState(false);
    const [supplierForm, setSupplierForm] = useState(EMPTY_SUPPLIER_FORM);
    const [supplierSaving, setSupplierSaving] = useState(false);
    const [supplierError, setSupplierError] = useState("");

    const loadCategories = useCallback(async () => {
        try {
            const response = await authApis().get(
                endpoints.adminCategories,
                {
                    params: {
                        type: "PRODUCT",
                    },
                },
            );

            setCategories(normalizeContent(response.data));
        } catch (error) {
            console.error("LOAD PRODUCT CATEGORIES ERROR:", error);
            setCategories([]);
        }
    }, []);

    const loadSuppliers = useCallback(async () => {
        try {
            const response = await authApis().get(
                endpoints.adminSuppliers,
                {
                    params: {
                        page: 0,
                        size: 100,
                    },
                },
            );

            setSuppliers(normalizeContent(response.data));
        } catch (error) {
            console.error("LOAD PRODUCT SUPPLIERS ERROR:", error);
            setSuppliers([]);
        }
    }, []);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page,
                size: PAGE_SIZE,
            };

            if (keyword.trim()) params.keyword = keyword.trim();
            if (categoryId) params.categoryId = categoryId;
            if (supplierId) params.supplierId = supplierId;
            if (status !== "") params.isActive = status === "true";

            const response = await authApis().get(
                endpoints.adminProducts,
                {
                    params,
                },
            );

            const data = response.data || {};

            setProducts(normalizeContent(data));
            setTotalPages(Number(data.totalPages || 0));
            setTotalElements(Number(data.totalElements || 0));
        } catch (error) {
            console.error("LOAD ADMIN PRODUCTS ERROR:", error);

            setProducts([]);
            setTotalPages(0);
            setTotalElements(0);

            setNotice({
                type: "error",
                message: getErrorMessage(error, "Không thể tải danh sách sản phẩm."),
            });
        } finally {
            setLoading(false);
        }
    }, [keyword, categoryId, supplierId, status, page]);

    useEffect(() => {
        loadCategories();
        loadSuppliers();
    }, [loadCategories, loadSuppliers]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const lowStockCount = useMemo(
        () =>
            products.filter(
                (product) =>
                    Number(product.stockQuantity || 0) <= Number(product.minStockAlert || 0),
            ).length,
        [products],
    );

    const displayTotalPages = Math.max(totalPages, 1);

    const openCreateModal = () => {
        setNotice({
            type: "",
            message: "",
        });

        setFormError("");
        setForm(EMPTY_FORM);
        setImageFile(null);
        setImagePreview("");
        setModal({
            type: "create",
        });
    };

    const openEditModal = (product) => {
        setNotice({
            type: "",
            message: "",
        });

        setFormError("");

        setForm({
            id: product.id,
            supplierId: product.supplierId || "",
            productCode: product.productCode || "",
            name: product.name || "",
            price: product.price ?? "",
            categoryId: product.categoryId || "",
            stockQuantity: product.stockQuantity ?? 0,
            minStockAlert: product.minStockAlert ?? 5,
            imageUrl: product.imageUrl || "",
            isActive: product.isActive !== false,
        });

        setImageFile(null);
        setImagePreview(product.imageUrl || "");

        setModal({
            type: "edit",
            product,
        });
    };

    const closeModal = () => {
        if (saving) return;

        setModal(null);
        setFormError("");
        setForm(EMPTY_FORM);
        setImageFile(null);
        setImagePreview("");
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0] || null;

        if (!file) {
            setImageFile(null);
            setImagePreview(form.imageUrl || "");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setFormError("Vui lòng chọn file hình ảnh.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFormError("Ảnh sản phẩm không được vượt quá 5MB.");
            event.target.value = "";
            return;
        }

        setFormError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        if (!form.supplierId) {
            setFormError("Vui lòng chọn nhà cung cấp.");
            return;
        }

        if (!form.categoryId) {
            setFormError("Vui lòng chọn danh mục Product.");
            return;
        }

        if (!form.productCode.trim()) {
            setFormError("Vui lòng nhập mã sản phẩm.");
            return;
        }

        if (!form.name.trim()) {
            setFormError("Vui lòng nhập tên sản phẩm.");
            return;
        }

        if (Number(form.price) < 0) {
            setFormError("Giá sản phẩm không hợp lệ.");
            return;
        }

        if (Number(form.stockQuantity) < 0) {
            setFormError("Số lượng tồn kho không hợp lệ.");
            return;
        }

        if (Number(form.minStockAlert) < 0) {
            setFormError("Mức cảnh báo tồn kho không hợp lệ.");
            return;
        }

        try {
            setSaving(true);

            setNotice({
                type: "",
                message: "",
            });

            const data = {
                supplierId: Number(form.supplierId),
                productCode: form.productCode.trim(),
                name: form.name.trim(),
                price: Number(form.price),
                categoryId: Number(form.categoryId),
                stockQuantity: Number(form.stockQuantity),
                minStockAlert: Number(form.minStockAlert),
                imageUrl: form.imageUrl.trim() || null,
                isActive: Boolean(form.isActive),
            };

            const formData = new FormData();

            formData.append(
                "data",
                new Blob([JSON.stringify(data)], {
                    type: "application/json",
                }),
            );

            if (imageFile) {
                formData.append("image", imageFile);
            }

            if (modal?.type === "create") {
                await authApis().post(
                    endpoints.adminProducts,
                    formData,
                );

                setNotice({
                    type: "success",
                    message: "Tạo sản phẩm thành công.",
                });
            } else {
                await authApis().put(
                    endpoints.adminProductDetail(form.id),
                    formData,
                );

                setNotice({
                    type: "success",
                    message: "Cập nhật sản phẩm thành công.",
                });
            }

            closeModal();
            await loadProducts();
        } catch (error) {
            console.error("SAVE ADMIN PRODUCT ERROR:", error);

            setFormError(
                getErrorMessage(
                    error,
                    "Không thể lưu sản phẩm.",
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (product) => {
        try {
            setNotice({
                type: "",
                message: "",
            });

            const nextStatus = !product.isActive;

            await authApis().patch(
                endpoints.adminProductStatus(product.id),
                null,
                {
                    params: {
                        isActive: nextStatus,
                    },
                },
            );

            setNotice({
                type: "success",
                message: nextStatus
                    ? "Đã mở sản phẩm."
                    : "Đã ẩn sản phẩm.",
            });

            await loadProducts();
        } catch (error) {
            console.error("UPDATE ADMIN PRODUCT STATUS ERROR:", error);

            setNotice({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể cập nhật trạng thái sản phẩm.",
                ),
            });
        }
    };

    const deleteProduct = async (product) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`,
        );

        if (!confirmed) return;

        try {
            setNotice({
                type: "",
                message: "",
            });

            await authApis().delete(
                endpoints.adminProductDetail(product.id),
            );

            setNotice({
                type: "success",
                message: "Xóa sản phẩm thành công.",
            });

            if (products.length === 1 && page > 0) {
                setPage((current) => current - 1);
            } else {
                await loadProducts();
            }
        } catch (error) {
            console.error("DELETE ADMIN PRODUCT ERROR:", error);

            setNotice({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể xóa sản phẩm.",
                ),
            });
        }
    };

    const openCreateCategoryModal = () => {
        setCategoryError("");
        setCategoryForm(EMPTY_CATEGORY_FORM);

        setCategoryModal({
            type: "create",
        });
    };

    const openEditCategoryModal = (category) => {
        setCategoryError("");

        setCategoryForm({
            id: category.id,
            name: category.name || "",
            description: category.description || "",
        });

        setCategoryModal({
            type: "edit",
            category,
        });
    };

    const closeCategoryModal = () => {
        if (categorySaving) return;

        setCategoryModal(null);
        setCategoryError("");
        setCategoryForm(EMPTY_CATEGORY_FORM);
    };

    const handleCategoryChange = (event) => {
        const { name, value } = event.target;

        setCategoryForm((current) => ({
            ...current,
            [name]: value,
        }));
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
                type: "PRODUCT",
            };

            if (categoryModal?.type === "create") {
                await authApis().post(
                    endpoints.adminCategories,
                    payload,
                );

                setNotice({
                    type: "success",
                    message: "Tạo danh mục Product thành công.",
                });
            } else {
                await authApis().put(
                    endpoints.adminCategoryDetail(categoryForm.id),
                    payload,
                );

                setNotice({
                    type: "success",
                    message: "Cập nhật danh mục Product thành công.",
                });
            }

            closeCategoryModal();
            await loadCategories();
        } catch (error) {
            console.error("SAVE PRODUCT CATEGORY ERROR:", error);

            setCategoryError(
                getErrorMessage(
                    error,
                    "Không thể lưu danh mục Product.",
                ),
            );
        } finally {
            setCategorySaving(false);
        }
    };

    const closeSupplierModal = () => {
        if (supplierSaving) return;

        setSupplierModal(false);
        setSupplierError("");

        setSupplierForm(EMPTY_SUPPLIER_FORM);
    };

    const handleSupplierChange = (event) => {
        const { name, value } = event.target;

        setSupplierForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSupplierSubmit = async (event) => {
        event.preventDefault();
        setSupplierError("");

        if (!supplierForm.name.trim()) {
            setSupplierError("Vui lòng nhập tên nhà cung cấp.");
            return;
        }

        try {
            setSupplierSaving(true);

            const payload = {
                name: supplierForm.name.trim(),
                phone: supplierForm.phone.trim() || null,
                email: supplierForm.email.trim() || null,
                address: supplierForm.address.trim() || null,
            };

            await authApis().post(
                endpoints.adminSuppliers,
                payload,
            );

            setNotice({
                type: "success",
                message: "Tạo nhà cung cấp thành công.",
            });

            closeSupplierModal();
            await loadSuppliers();
        } catch (error) {
            console.error("CREATE SUPPLIER ERROR:", error);

            setSupplierError(
                getErrorMessage(
                    error,
                    "Không thể tạo nhà cung cấp.",
                ),
            );
        } finally {
            setSupplierSaving(false);
        }
    };

    const clearFilters = () => {
        setKeyword("");
        setCategoryId("");
        setSupplierId("");
        setStatus("");
        setPage(0);
    };

    return (
        <div className="admin-page">
            <Header role="ADMIN" title="Sản phẩm" />

            <main className="admin-main">
                <div className="admin-shell">
                    <section className="admin-heading">
                        <div>
                            <span className="admin-eyebrow">PRODUCT MANAGEMENT</span>
                            <h1>Quản lý sản phẩm</h1>
                            <p>Quản lý sản phẩm bán tại salon và theo dõi số lượng tồn kho.</p>
                        </div>

                        <div className="admin-products-heading-actions">
                            <button
                                className="admin-primary-button admin-products-heading-button"
                                type="button"
                                onClick={openCreateModal}
                            >
                                Thêm Sản phẩm
                            </button>
                        </div>
                    </section>

                    {notice.message && (
                        <div className={`admin-alert ${notice.type}`} role="alert">
                            <span>{notice.message}</span>
                            <button
                                type="button"
                                onClick={() => setNotice({ type: "", message: "" })}
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <section className="admin-summary-grid">
                        <article>
                            <span>Tổng sản phẩm</span>
                            <strong>{totalElements}</strong>
                        </article>
                        <article>
                            <span>Sắp hết hàng</span>
                            <strong>{lowStockCount}</strong>
                        </article>
                        <article>
                            <span>Danh mục Product</span>
                            <strong>{categories.length}</strong>
                        </article>
                    </section>

                    <section className="admin-filter-card admin-product-filters">
                        <label>
                            <span>Tìm kiếm</span>
                            <input
                                value={keyword}
                                onChange={(event) => {
                                    setKeyword(event.target.value);
                                    setPage(0);
                                }}
                                placeholder="Mã, tên sản phẩm..."
                            />
                        </label>

                        <label>
                            <span>Danh mục Product</span>
                            <select
                                value={categoryId}
                                onChange={(event) => {
                                    setCategoryId(event.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">Tất cả</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Nhà cung cấp</span>
                            <select
                                value={supplierId}
                                onChange={(event) => {
                                    setSupplierId(event.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">Tất cả</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Trạng thái</span>
                            <select
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
                        </label>

                        <button className="admin-filter-reset" type="button" onClick={clearFilters}>Đặt lại</button>
                    </section>

                    <section className="admin-category-card">
                        <div className="admin-table-top">
                            <div>
                                <h2>Danh mục Product</h2>
                                <span>{categories.length} danh mục Product đang có</span>
                            </div>

                            <button
                                className="admin-refresh-btn"
                                type="button"
                                onClick={openCreateCategoryModal}
                            >
                                + Thêm danh mục
                            </button>
                        </div>

                        {categories.length === 0 ? (
                            <div className="admin-empty admin-category-empty">
                                <strong>Chưa có danh mục Product</strong>
                                <span>Tạo danh mục Product trước khi tạo sản phẩm.</span>
                            </div>
                        ) : (
                            <div className="admin-category-list">
                                {categories.map((category) => (
                                    <div className="admin-category-item" key={category.id}>
                                        <div>
                                            <strong>{category.name || "Chưa có tên"}</strong>
                                            <span>{category.description || "Chưa có mô tả"}</span>
                                        </div>

                                        <button
                                            type="button"
                                            className="admin-action-btn"
                                            onClick={() => openEditCategoryModal(category)}
                                        >
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
                                <h2>Danh sách sản phẩm</h2>
                                <span>
                                    Trang {totalPages ? page + 1 : 0} / {totalPages || 0} · {totalElements} sản phẩm
                                </span>
                            </div>

                            <button
                                className="admin-refresh-btn"
                                type="button"
                                onClick={loadProducts}
                                disabled={loading}
                            >
                                {loading ? "Đang tải..." : "Làm mới"}
                            </button>
                        </div>

                        {loading ? (
                            <div className="admin-empty">Đang tải danh sách...</div>
                        ) : products.length === 0 ? (
                            <div className="admin-empty">
                                <strong>Không có sản phẩm</strong>
                                <span>Thử thay đổi bộ lọc hoặc tạo sản phẩm mới.</span>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table admin-products-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Danh mục</th>
                                            <th>Nhà cung cấp</th>
                                            <th>Giá</th>
                                            <th>Tồn kho</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((product) => {
                                            const stock = Number(product.stockQuantity || 0);
                                            const minStock = Number(product.minStockAlert || 0);
                                            const lowStock = stock <= minStock;

                                            return (
                                                <tr key={product.id}>
                                                    <td data-label="Sản phẩm">
                                                        <div className="admin-product-cell">
                                                            {product.imageUrl ? (
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    className="admin-product-image"
                                                                />
                                                            ) : (
                                                                <div className="admin-product-image admin-product-image-fallback">SP</div>
                                                            )}

                                                            <div>
                                                                <strong>{product.name}</strong>
                                                                <span>{product.productCode}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td data-label="Danh mục">
                                                        {product.categoryName || product.category?.name || "—"}
                                                    </td>

                                                    <td data-label="Nhà cung cấp">
                                                        {product.supplierName || product.supplier?.name || "—"}
                                                    </td>

                                                    <td data-label="Giá">{formatMoney(product.price)}</td>

                                                    <td data-label="Tồn kho">
                                                        <span className={`admin-product-stock ${lowStock ? "low" : "ok"}`}>
                                                            {stock}
                                                        </span>

                                                        <small className="admin-product-stock-note">
                                                            Cảnh báo: {minStock}
                                                        </small>
                                                    </td>

                                                    <td data-label="Trạng thái">
                                                        <span className={`admin-product-status ${product.isActive ? "active" : "inactive"}`}>
                                                            {product.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td data-label="Thao tác">
                                                        <div className="admin-user-actions">
                                                            <button
                                                                type="button"
                                                                className="admin-action-btn"
                                                                onClick={() => openEditModal(product)}
                                                            >
                                                                Sửa
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="admin-action-btn"
                                                                onClick={() => updateStatus(product)}
                                                            >
                                                                {product.isActive ? "Ẩn" : "Mở"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="admin-action-btn delete"
                                                                onClick={() => deleteProduct(product)}
                                                            >
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="admin-pagination">
                            <button
                                type="button"
                                className="admin-page-button"
                                onClick={() => setPage(0)}
                                disabled={page === 0 || loading}
                            >
                                ⏮
                            </button>

                            <button
                                type="button"
                                className="admin-page-button"
                                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                                disabled={page === 0 || loading}
                            >
                                ←
                            </button>

                            {Array.from({ length: displayTotalPages }, (_, index) => index).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    className={`admin-page-button ${pageNumber === page ? "active" : ""}`}
                                    onClick={() => setPage(pageNumber)}
                                    disabled={loading}
                                >
                                    {pageNumber + 1}
                                </button>
                            ))}

                            <button
                                type="button"
                                className="admin-page-button"
                                onClick={() => setPage((current) => Math.min(current + 1, displayTotalPages - 1))}
                                disabled={page >= displayTotalPages - 1 || loading}
                            >
                                →
                            </button>

                            <button
                                type="button"
                                className="admin-page-button"
                                onClick={() => setPage(displayTotalPages - 1)}
                                disabled={displayTotalPages <= 1 || page >= displayTotalPages - 1 || loading}
                            >
                                ⏭
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {supplierModal && (
                <div
                    className="admin-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeSupplierModal();
                    }}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-product-supplier-modal-title"
                    >
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-eyebrow">SUPPLIER</span>
                                <h2 id="admin-product-supplier-modal-title">Tạo nhà cung cấp</h2>
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeSupplierModal}
                                disabled={supplierSaving}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSupplierSubmit}>
                            <div className="admin-modal-body">
                                {supplierError && (
                                    <div className="admin-modal-error" role="alert">{supplierError}</div>
                                )}

                                <div className="admin-form-grid two-col">
                                    <label>
                                        <span>Tên nhà cung cấp</span>
                                        <input
                                            name="name"
                                            value={supplierForm.name}
                                            onChange={handleSupplierChange}
                                            required
                                            maxLength={255}
                                            placeholder="Ví dụ: L'Oréal Việt Nam"
                                        />
                                    </label>

                                    <label>
                                        <span>Số điện thoại</span>
                                        <input
                                            name="phone"
                                            value={supplierForm.phone}
                                            onChange={handleSupplierChange}
                                            maxLength={20}
                                            placeholder="0901234567"
                                        />
                                    </label>

                                    <label>
                                        <span>Email</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={supplierForm.email}
                                            onChange={handleSupplierChange}
                                            maxLength={255}
                                            placeholder="supplier@gmail.com"
                                        />
                                    </label>

                                    <label>
                                        <span>Địa chỉ</span>
                                        <input
                                            name="address"
                                            value={supplierForm.address}
                                            onChange={handleSupplierChange}
                                            maxLength={255}
                                            placeholder="Địa chỉ nhà cung cấp"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={closeSupplierModal}
                                    disabled={supplierSaving}
                                >
                                    HỦY
                                </button>

                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={supplierSaving}
                                >
                                    {supplierSaving ? "ĐANG LƯU..." : "TẠO NHÀ CUNG CẤP"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {categoryModal && (
                <div
                    className="admin-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeCategoryModal();
                    }}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-product-category-modal-title"
                    >
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-eyebrow">PRODUCT CATEGORY</span>
                                <h2 id="admin-product-category-modal-title">
                                    {categoryModal.type === "create" ? "Tạo danh mục Product" : "Chỉnh sửa danh mục Product"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeCategoryModal}
                                disabled={categorySaving}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCategorySubmit}>
                            <div className="admin-modal-body">
                                {categoryError && (
                                    <div className="admin-modal-error" role="alert">{categoryError}</div>
                                )}

                                <div className="admin-form-grid">
                                    <label>
                                        <span>Tên danh mục Product</span>
                                        <input
                                            name="name"
                                            value={categoryForm.name}
                                            onChange={handleCategoryChange}
                                            required
                                            maxLength={100}
                                            placeholder="Ví dụ: Chăm sóc tóc"
                                        />
                                    </label>

                                    <label>
                                        <span>Mô tả</span>
                                        <textarea
                                            name="description"
                                            value={categoryForm.description}
                                            onChange={handleCategoryChange}
                                            placeholder="Mô tả ngắn về danh mục..."
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={closeCategoryModal}
                                    disabled={categorySaving}
                                >
                                    HỦY
                                </button>

                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={categorySaving}
                                >
                                    {categorySaving
                                        ? "ĐANG LƯU..."
                                        : categoryModal.type === "create"
                                            ? "TẠO DANH MỤC"
                                            : "LƯU THAY ĐỔI"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modal && (
                <div
                    className="admin-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-product-modal-title"
                    >
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-eyebrow">PRODUCT</span>
                                <h2 id="admin-product-modal-title">
                                    {modal.type === "create" ? "Tạo sản phẩm" : "Chỉnh sửa sản phẩm"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body">
                                {formError && (
                                    <div className="admin-modal-error" role="alert">{formError}</div>
                                )}

                                <div className="admin-form-grid two-col">
                                    <label>
                                        <span>Mã sản phẩm</span>
                                        <input
                                            name="productCode"
                                            value={form.productCode}
                                            onChange={handleChange}
                                            required
                                            placeholder="SP001"
                                        />
                                    </label>

                                    <label>
                                        <span>Tên sản phẩm</span>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Dầu gội..."
                                        />
                                    </label>

                                    <label>
                                        <span>Danh mục Product</span>
                                        <select
                                            name="categoryId"
                                            value={form.categoryId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Chọn --</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Nhà cung cấp</span>
                                        <select
                                            name="supplierId"
                                            value={form.supplierId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Chọn --</option>
                                            {suppliers.map((supplier) => (
                                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Giá bán</span>
                                        <input
                                            name="price"
                                            type="number"
                                            min="0"
                                            value={form.price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>Số lượng tồn kho</span>
                                        <input
                                            name="stockQuantity"
                                            type="number"
                                            min="0"
                                            value={form.stockQuantity}
                                            onChange={handleChange}
                                            disabled={modal.type === "edit"}
                                        />
                                    </label>

                                    <label>
                                        <span>Mức cảnh báo tồn kho</span>
                                        <input
                                            name="minStockAlert"
                                            type="number"
                                            min="0"
                                            value={form.minStockAlert}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label>
                                        <span>Trạng thái</span>
                                        <select
                                            name="isActive"
                                            value={form.isActive ? "true" : "false"}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    isActive: event.target.value === "true",
                                                }))
                                            }
                                        >
                                            <option value="true">Đang bán</option>
                                            <option value="false">Ngừng bán</option>
                                        </select>
                                    </label>

                                    <label className="full-width">
                                        <span>Ảnh sản phẩm</span>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handleImageChange}
                                            disabled={saving}
                                        />
                                    </label>

                                    {imagePreview && (
                                        <div className="admin-product-image-preview full-width">
                                            <img src={imagePreview} alt="Xem trước sản phẩm" />
                                        </div>
                                    )}
                                </div>

                                <div className="admin-form-note">
                                    {modal.type === "create"
                                        ? "Số lượng tồn kho ban đầu có thể nhập khi tạo sản phẩm. Sau đó nên tăng tồn kho thông qua phiếu nhập."
                                        : "Số lượng tồn kho không chỉnh sửa trực tiếp khi cập nhật sản phẩm; hãy sử dụng phiếu nhập kho."}
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    HỦY
                                </button>

                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "ĐANG LƯU..."
                                        : modal.type === "create"
                                            ? "TẠO SẢN PHẨM"
                                            : "LƯU THAY ĐỔI"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProducts;