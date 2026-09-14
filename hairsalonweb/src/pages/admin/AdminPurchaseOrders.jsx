import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { authApis, endpoints } from "../../configs/api/Apis";
import "../../styles/admin/AdminCommon.css";
import "./AdminPurchaseOrders.css";

const emptyForm = {
    supplierId: "",
    note: "",
    items: [],
};

const emptyItem = {
    productId: "",
    quantity: 1,
    importPrice: "",
};

const emptySupplierForm = {
    name: "",
    phone: "",
    email: "",
    address: "",
};

function normalizeContent(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
}

function getTotalPages(data) {
    return Math.max(Number(data?.totalPages) || 0, 1);
}

function formatMoney(value) {
    const number = Number(value || 0);
    return `${number.toLocaleString("vi-VN")}đ`;
}

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getPurchaseStatus(isReceived) {
    return Boolean(isReceived)
        ? {
            label: "Đã nhập kho",
            className: "received",
        }
        : {
            label: "Chưa nhập kho",
            className: "pending",
        };
}

function AdminPurchaseOrders() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [supplierId, setSupplierId] = useState("");
    const [isReceived, setIsReceived] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [modalType, setModalType] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [receivingId, setReceivingId] = useState(null);

    const [supplierModal, setSupplierModal] = useState(false);
    const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
    const [supplierError, setSupplierError] = useState("");
    const [supplierSaving, setSupplierSaving] = useState(false);

    const [suppliersLoading, setSuppliersLoading] = useState(false);
    const [supplierPage, setSupplierPage] = useState(0);
    const [supplierTotalPages, setSupplierTotalPages] = useState(1);

    const [productsLoading, setProductsLoading] = useState(false);
    const [productPage, setProductPage] = useState(0);
    const [productTotalPages, setProductTotalPages] = useState(1);

    const pageSize = 10;
    const supplierPageSize = 10;
    const productPageSize = 10;

    const loadPurchaseOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                size: pageSize,
            };

            if (supplierId) {
                params.supplierId = supplierId;
            }

            if (isReceived !== "") {
                params.isReceived = isReceived;
            }

            if (from) {
                params.from = `${from}T00:00:00`;
            }

            if (to) {
                params.to = `${to}T23:59:59`;
            }

            const response = await authApis().get(endpoints.adminPurchaseOrders, { params });

            setPurchaseOrders(normalizeContent(response.data));
            setTotalPages(getTotalPages(response.data));
        } catch (err) {
            console.error("LOAD PURCHASE ORDERS ERROR:", err);
            setPurchaseOrders([]);
            setTotalPages(1);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể tải danh sách phiếu nhập."
            );
        } finally {
            setLoading(false);
        }
    }, [page, supplierId, isReceived, from, to]);

    const loadSuppliers = useCallback(async (nextPage = 0, append = false) => {
        try {
            setSuppliersLoading(true);

            const response = await authApis().get(endpoints.adminSuppliers, {
                params: {
                    page: nextPage,
                    size: supplierPageSize,
                },
            });

            const content = normalizeContent(response.data);

            setSuppliers((current) => {
                if (!append) return content;

                const existingIds = new Set(current.map((supplier) => supplier.id));

                return [
                    ...current,
                    ...content.filter((supplier) => !existingIds.has(supplier.id)),
                ];
            });

            setSupplierPage(nextPage);
            setSupplierTotalPages(getTotalPages(response.data));
        } catch (err) {
            console.error("LOAD SUPPLIERS ERROR:", err);
        } finally {
            setSuppliersLoading(false);
        }
    }, []);

    const loadProducts = useCallback(async (supplier, nextPage = 0, append = false) => {
        if (!supplier) {
            setProducts([]);
            setProductPage(0);
            setProductTotalPages(1);
            return;
        }

        try {
            setProductsLoading(true);

            const response = await authApis().get(endpoints.adminProducts, {
                params: {
                    supplierId: supplier,
                    page: nextPage,
                    size: productPageSize,
                },
            });

            const content = normalizeContent(response.data);

            setProducts((current) => {
                if (!append) return content;

                const existingIds = new Set(current.map((product) => product.id));

                return [
                    ...current,
                    ...content.filter((product) => !existingIds.has(product.id)),
                ];
            });

            setProductPage(nextPage);
            setProductTotalPages(getTotalPages(response.data));
        } catch (err) {
            console.error("LOAD PRODUCTS ERROR:", err);

            if (!append) {
                setProducts([]);
            }
        } finally {
            setProductsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPurchaseOrders();
    }, [loadPurchaseOrders]);

    useEffect(() => {
        if (modalType === "create" || modalType === "edit") {
            loadSuppliers(0, false);
        }
    }, [modalType, loadSuppliers]);

    const filteredProducts = useMemo(() => {
        if (!form.supplierId) return [];

        return products.filter((product) => {
            const productSupplierId = product.supplierId ?? product.supplier?.id;
            return String(productSupplierId) === String(form.supplierId);
        });
    }, [products, form.supplierId]);

    const openCreateModal = () => {
        setForm({
            supplierId: "",
            note: "",
            items: [],
        });

        setProducts([]);
        setProductPage(0);
        setProductTotalPages(1);
        setFormError("");
        setSelectedOrder(null);
        setSupplierModal(false);
        setModalType("create");
    };

    const openDetailModal = async (id) => {
        try {
            setFormError("");

            const response = await authApis().get(endpoints.adminPurchaseOrderDetail(id));

            setSelectedOrder(response.data);
            setModalType("detail");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Không thể tải chi tiết phiếu nhập."
            );
        }
    };

    const openEditModal = async (id) => {
        try {
            setFormError("");

            const response = await authApis().get(endpoints.adminPurchaseOrderDetail(id));
            const order = response.data;

            if (order.isReceived) {
                alert("Không thể sửa phiếu nhập đã nhập kho.");
                return;
            }

            setSelectedOrder(order);

            setForm({
                supplierId: order.supplierId ? String(order.supplierId) : "",
                note: order.note || "",
                items: order.items?.map((item) => ({
                    productId: item.productId ? String(item.productId) : "",
                    quantity: item.quantity ?? 1,
                    importPrice: item.importPrice ?? "",
                })) || [],
            });

            setProducts([]);
            setProductPage(0);
            setProductTotalPages(1);
            setModalType("edit");

            if (order.supplierId) {
                await loadProducts(order.supplierId, 0, false);
            }
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Không thể tải phiếu nhập."
            );
        }
    };

    const closeModal = () => {
        if (saving || receivingId || supplierSaving) return;

        setModalType("");
        setSelectedOrder(null);

        setForm({
            supplierId: "",
            note: "",
            items: [],
        });

        setProducts([]);
        setProductPage(0);
        setProductTotalPages(1);
        setFormError("");
        setSupplierModal(false);
    };

    const openSupplierModal = () => {
        setSupplierForm({
            name: "",
            phone: "",
            email: "",
            address: "",
        });

        setSupplierError("");
        setSupplierModal(true);
    };

    const closeSupplierModal = () => {
        if (supplierSaving) return;

        setSupplierModal(false);
        setSupplierForm({
            name: "",
            phone: "",
            email: "",
            address: "",
        });
        setSupplierError("");
    };

    const handleSupplierFormChange = (event) => {
        const { name, value } = event.target;

        setSupplierForm((current) => ({
            ...current,
            [name]: value,
        }));

        setSupplierError("");
    };

    const handleCreateSupplier = async (event) => {
        event.preventDefault();

        if (!supplierForm.name.trim()) {
            setSupplierError("Tên nhà cung cấp không được để trống.");
            return;
        }

        try {
            setSupplierSaving(true);
            setSupplierError("");

            const payload = {
                name: supplierForm.name.trim(),
                phone: supplierForm.phone.trim() || null,
                email: supplierForm.email.trim() || null,
                address: supplierForm.address.trim() || null,
            };

            const response = await authApis().post(endpoints.adminSuppliers, payload);
            const newSupplier = response.data;

            setSuppliers((current) => [
                newSupplier,
                ...current.filter((supplier) => supplier.id !== newSupplier.id),
            ]);

            setForm((current) => ({
                ...current,
                supplierId: String(newSupplier.id),
                items: [],
            }));

            setProducts([]);
            setProductPage(0);
            setProductTotalPages(1);

            setSupplierModal(false);
            setSupplierForm({
                name: "",
                phone: "",
                email: "",
                address: "",
            });
            setSupplierError("");

            await loadProducts(newSupplier.id, 0, false);
        } catch (err) {
            console.error("CREATE SUPPLIER ERROR:", err);

            setSupplierError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể thêm nhà cung cấp."
            );
        } finally {
            setSupplierSaving(false);
        }
    };

    const handleSupplierChange = async (event) => {
        const value = event.target.value;

        setForm((current) => ({
            ...current,
            supplierId: value,
            items: [],
        }));

        setFormError("");
        setProducts([]);
        setProductPage(0);
        setProductTotalPages(1);

        if (value) {
            await loadProducts(value, 0, false);
        }
    };

    const addItem = () => {
        setForm((current) => ({
            ...current,
            items: [...current.items, { ...emptyItem }],
        }));
    };

    const removeItem = (index) => {
        setForm((current) => ({
            ...current,
            items: current.items.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const updateItem = (index, field, value) => {
        setForm((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            ),
        }));
    };

    const calculateFormTotal = () => {
        return form.items.reduce((total, item) => {
            const quantity = Number(item.quantity || 0);
            const importPrice = Number(item.importPrice || 0);

            return total + quantity * importPrice;
        }, 0);
    };

    const validateForm = () => {
        if (!form.supplierId) {
            return "Vui lòng chọn nhà cung cấp.";
        }

        if (!form.items.length) {
            return "Phiếu nhập phải có ít nhất một sản phẩm.";
        }

        const productIds = new Set();

        for (let index = 0; index < form.items.length; index += 1) {
            const item = form.items[index];

            if (!item.productId) {
                return `Vui lòng chọn sản phẩm ở dòng ${index + 1}.`;
            }

            if (productIds.has(String(item.productId))) {
                return `Sản phẩm ở dòng ${index + 1} bị trùng.`;
            }

            productIds.add(String(item.productId));

            if (Number(item.quantity) <= 0) {
                return `Số lượng ở dòng ${index + 1} phải lớn hơn 0.`;
            }

            if (Number(item.importPrice) <= 0) {
                return `Giá nhập ở dòng ${index + 1} phải lớn hơn 0.`;
            }
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            const payload = {
                supplierId: Number(form.supplierId),
                note: form.note?.trim() || "",
                items: form.items.map((item) => ({
                    productId: Number(item.productId),
                    quantity: Number(item.quantity),
                    importPrice: Number(item.importPrice),
                })),
            };

            if (modalType === "create") {
                await authApis().post(endpoints.adminPurchaseOrders, payload);
            } else {
                await authApis().put(
                    endpoints.adminPurchaseOrderDetail(selectedOrder.id),
                    payload
                );
            }

            setModalType("");
            setSelectedOrder(null);

            setForm({
                supplierId: "",
                note: "",
                items: [],
            });

            setProducts([]);
            setProductPage(0);
            setProductTotalPages(1);

            await loadPurchaseOrders();
        } catch (err) {
            console.error("SAVE PURCHASE ORDER ERROR:", err);

            setFormError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể lưu phiếu nhập."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleReceive = async (order) => {
        if (order.isReceived) return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn nhận phiếu nhập #${order.id}?\nSau khi nhận hàng, tồn kho sẽ được cộng theo số lượng trong phiếu.`
        );

        if (!confirmed) return;

        try {
            setReceivingId(order.id);

            await authApis().post(endpoints.adminPurchaseOrderReceive(order.id));

            await loadPurchaseOrders();

            if (modalType === "detail" && selectedOrder?.id === order.id) {
                const response = await authApis().get(
                    endpoints.adminPurchaseOrderDetail(order.id)
                );

                setSelectedOrder(response.data);
            }
        } catch (err) {
            console.error("RECEIVE PURCHASE ORDER ERROR:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể nhận hàng."
            );
        } finally {
            setReceivingId(null);
        }
    };

    const loadMoreSuppliers = async () => {
        if (supplierPage >= supplierTotalPages - 1 || suppliersLoading) return;

        await loadSuppliers(supplierPage + 1, true);
    };

    const loadMoreProducts = async () => {
        if (
            !form.supplierId ||
            productPage >= productTotalPages - 1 ||
            productsLoading
        ) {
            return;
        }

        await loadProducts(form.supplierId, productPage + 1, true);
    };

    const resetFilters = () => {
        setSupplierId("");
        setIsReceived("");
        setFrom("");
        setTo("");
        setPage(0);
    };

    const handlePageChange = (nextPage) => {
        if (nextPage < 0 || nextPage >= totalPages) return;

        setPage(nextPage);
    };

    return (
        <div className="admin-page admin-purchase-orders-page">
            <Header role="ADMIN" title="Nhập hàng" />

            <main className="admin-main">
                <div className="admin-shell">
                    <section className="admin-heading">
                        <div>
                            <span className="admin-section-eyebrow">INVENTORY MANAGEMENT</span>
                            <h1>Nhập hàng</h1>
                            <p>Quản lý phiếu nhập hàng từ nhà cung cấp và cập nhật tồn kho.</p>
                        </div>

                        <button type="button" className="admin-primary-button" onClick={openCreateModal}>
                            + Tạo phiếu nhập
                        </button>
                    </section>

                    <section className="admin-filter-card">
                        <div className="admin-filter-grid">
                            <div className="admin-form-group">
                                <label htmlFor="purchase-supplier-filter">Nhà cung cấp</label>
                                <select id="purchase-supplier-filter" className="admin-form-select" value={supplierId} onChange={(event) => { setSupplierId(event.target.value); setPage(0); }}>
                                    <option value="">Tất cả nhà cung cấp</option>

                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="purchase-status-filter">Trạng thái</label>
                                <select id="purchase-status-filter" className="admin-form-select" value={isReceived} onChange={(event) => { setIsReceived(event.target.value); setPage(0); }}>
                                    <option value="">Tất cả</option>
                                    <option value="false">Chưa nhập kho</option>
                                    <option value="true">Đã nhập kho</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="purchase-from">Từ ngày</label>
                                <input id="purchase-from" type="date" className="admin-form-input" value={from} onChange={(event) => { setFrom(event.target.value); setPage(0); }} />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="purchase-to">Đến ngày</label>
                                <input id="purchase-to" type="date" className="admin-form-input" value={to} onChange={(event) => { setTo(event.target.value); setPage(0); }} />
                            </div>

                            <div className="admin-filter-actions">
                                <button type="button" className="admin-secondary-button" onClick={resetFilters}>
                                    Xóa lọc
                                </button>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="admin-purchase-orders-error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={loadPurchaseOrders}>Thử lại</button>
                        </div>
                    )}

                    <section className="admin-section-card admin-purchase-orders-card">
                        <div className="admin-section-heading">
                            <div>
                                <span className="admin-section-eyebrow">PURCHASE ORDERS</span>
                                <h2>Danh sách phiếu nhập</h2>
                            </div>

                            <span>
                                {loading ? "Đang tải..." : `Trang ${page + 1} / ${totalPages}`}
                            </span>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Mã phiếu</th>
                                        <th>Nhà cung cấp</th>
                                        <th>Ngày nhập</th>
                                        <th>Số sản phẩm</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="admin-table-empty">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : purchaseOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="admin-table-empty">Chưa có phiếu nhập nào.</td>
                                        </tr>
                                    ) : (
                                        purchaseOrders.map((order) => {
                                            const status = getPurchaseStatus(order.isReceived);

                                            return (
                                                <tr key={order.id}>
                                                    <td><strong>#{order.id}</strong></td>
                                                    <td>{order.supplierName || "-"}</td>
                                                    <td>{formatDateTime(order.orderDate)}</td>
                                                    <td>{order.items?.length || 0}</td>
                                                    <td><strong>{formatMoney(order.totalAmount)}</strong></td>

                                                    <td>
                                                        <span className={`admin-status-badge admin-status-${status.className}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="admin-table-actions">
                                                            <button type="button" className="admin-table-button" onClick={() => openDetailModal(order.id)}>Xem</button>

                                                            {!order.isReceived && (
                                                                <>
                                                                    <button type="button" className="admin-table-button" onClick={() => openEditModal(order.id)}>Sửa</button>

                                                                    <button
                                                                        type="button"
                                                                        className="admin-table-button admin-table-button-primary"
                                                                        disabled={receivingId === order.id}
                                                                        onClick={() => handleReceive(order)}
                                                                    >
                                                                        {receivingId === order.id ? "Đang nhận..." : "Nhận hàng"}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-pagination">
                            <button
                                type="button"
                                className="admin-page-button"
                                disabled={page === 0 || loading}
                                onClick={() => handlePageChange(0)}
                            >
                                ⏮
                            </button>

                            <button
                                type="button"
                                className="admin-page-button"
                                disabled={page === 0 || loading}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                ←
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => index).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    className={`admin-page-button ${pageNumber === page ? "active" : ""}`}
                                    disabled={loading}
                                    onClick={() => handlePageChange(pageNumber)}
                                >
                                    {pageNumber + 1}
                                </button>
                            ))}

                            <button
                                type="button"
                                className="admin-page-button"
                                disabled={page >= totalPages - 1 || loading}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                →
                            </button>

                            <button
                                type="button"
                                className="admin-page-button"
                                disabled={page >= totalPages - 1 || loading}
                                onClick={() => handlePageChange(totalPages - 1)}
                            >
                                ⏭
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {(modalType === "create" || modalType === "edit") && (
                <div className="admin-modal-overlay" onMouseDown={closeModal}>
                    <div className="admin-modal admin-purchase-modal" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-section-eyebrow">
                                    {modalType === "create" ? "NEW PURCHASE ORDER" : "EDIT PURCHASE ORDER"}
                                </span>

                                <h2>
                                    {modalType === "create" ? "Tạo phiếu nhập" : `Sửa phiếu #${selectedOrder?.id}`}
                                </h2>
                            </div>

                            <button type="button" className="admin-modal-close" onClick={closeModal} disabled={saving}>
                                ×
                            </button>
                        </div>

                        <form className="admin-form" onSubmit={handleSubmit}>
                            <div className="admin-purchase-supplier-row">
                                <div className="admin-form-group">
                                    <label htmlFor="purchase-form-supplier">Nhà cung cấp *</label>

                                    <select id="purchase-form-supplier" className="admin-form-select" value={form.supplierId} onChange={handleSupplierChange} disabled={saving}>
                                        <option value="">Chọn nhà cung cấp</option>

                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    className="admin-secondary-button admin-supplier-add-button"
                                    onClick={openSupplierModal}
                                    disabled={saving}
                                >
                                    + Nhà cung cấp
                                </button>
                            </div>

                            {suppliersLoading && (
                                <div className="admin-lazy-loading">Đang tải nhà cung cấp...</div>
                            )}

                            {!suppliersLoading && supplierPage < supplierTotalPages - 1 && (
                                <div className="admin-lazy-more">
                                    <button type="button" className="admin-link-button" onClick={loadMoreSuppliers}>
                                        Tải thêm nhà cung cấp
                                    </button>
                                </div>
                            )}

                            <div className="admin-purchase-items-heading">
                                <div>
                                    <h3>Sản phẩm nhập</h3>
                                    <span>Chỉ hiển thị sản phẩm thuộc nhà cung cấp đã chọn.</span>
                                </div>

                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={addItem}
                                    disabled={saving || !form.supplierId}
                                >
                                    + Thêm sản phẩm
                                </button>
                            </div>

                            {!form.supplierId ? (
                                <div className="admin-purchase-items-empty">Vui lòng chọn nhà cung cấp trước.</div>
                            ) : productsLoading && products.length === 0 ? (
                                <div className="admin-purchase-items-empty">Đang tải sản phẩm...</div>
                            ) : form.items.length === 0 ? (
                                <div className="admin-purchase-items-empty">Chưa có sản phẩm nào trong phiếu nhập.</div>
                            ) : (
                                <div className="admin-purchase-items">
                                    {form.items.map((item, index) => (
                                        <div className="admin-purchase-item" key={`${index}-${item.productId}`}>
                                            <div className="admin-form-group admin-purchase-product">
                                                <label htmlFor={`purchase-product-${index}`}>Sản phẩm</label>

                                                <select
                                                    id={`purchase-product-${index}`}
                                                    className="admin-form-select"
                                                    value={item.productId}
                                                    onChange={(event) => updateItem(index, "productId", event.target.value)}
                                                    disabled={saving || productsLoading}
                                                >
                                                    <option value="">Chọn sản phẩm</option>

                                                    {filteredProducts.map((product) => (
                                                        <option key={product.id} value={product.id}>{product.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="admin-form-group admin-purchase-quantity">
                                                <label htmlFor={`purchase-quantity-${index}`}>Số lượng</label>
                                                <input id={`purchase-quantity-${index}`} type="number" min="1" className="admin-form-input" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} disabled={saving} />
                                            </div>

                                            <div className="admin-form-group admin-purchase-price">
                                                <label htmlFor={`purchase-price-${index}`}>Giá nhập</label>
                                                <input id={`purchase-price-${index}`} type="number" min="0" step="0.01" className="admin-form-input" value={item.importPrice} onChange={(event) => updateItem(index, "importPrice", event.target.value)} disabled={saving} />
                                            </div>

                                            <div className="admin-purchase-item-total">
                                                <span>Thành tiền</span>
                                                <strong>{formatMoney(Number(item.quantity || 0) * Number(item.importPrice || 0))}</strong>
                                            </div>

                                            <button type="button" className="admin-purchase-remove" onClick={() => removeItem(index)} disabled={saving} title="Xóa sản phẩm">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {form.supplierId && productTotalPages > 1 && (
                                <div className="admin-lazy-products">
                                    <span>Đã tải {filteredProducts.length} sản phẩm</span>

                                    <button
                                        type="button"
                                        className="admin-link-button"
                                        onClick={loadMoreProducts}
                                        disabled={productsLoading || productPage >= productTotalPages - 1}
                                    >
                                        {productsLoading ? "Đang tải..." : productPage >= productTotalPages - 1 ? "Đã tải hết" : "Tải thêm sản phẩm"}
                                    </button>
                                </div>
                            )}

                            <div className="admin-form-group">
                                <label htmlFor="purchase-note">Ghi chú</label>
                                <textarea id="purchase-note" className="admin-form-textarea" rows="3" maxLength="500" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} disabled={saving} placeholder="Nhập ghi chú cho phiếu nhập..." />
                            </div>

                            {formError && (
                                <div className="admin-form-error">{formError}</div>
                            )}

                            <div className="admin-purchase-total">
                                <span>Tổng tiền</span>
                                <strong>{formatMoney(calculateFormTotal())}</strong>
                            </div>

                            <div className="admin-modal-actions">
                                <button type="button" className="admin-secondary-button" onClick={closeModal} disabled={saving}>
                                    Hủy
                                </button>

                                <button type="submit" className="admin-primary-button" disabled={saving}>
                                    {saving ? "Đang lưu..." : modalType === "create" ? "Tạo phiếu nhập" : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {supplierModal && (
                <div className="admin-modal-overlay admin-supplier-modal-overlay" onMouseDown={closeSupplierModal}>
                    <div className="admin-modal admin-supplier-modal" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-section-eyebrow">NEW SUPPLIER</span>
                                <h2>Thêm nhà cung cấp</h2>
                            </div>

                            <button type="button" className="admin-modal-close" onClick={closeSupplierModal} disabled={supplierSaving}>
                                ×
                            </button>
                        </div>

                        <form className="admin-form" onSubmit={handleCreateSupplier}>
                            <div className="admin-form-group">
                                <label htmlFor="supplier-name">Tên nhà cung cấp *</label>
                                <input id="supplier-name" name="name" type="text" className="admin-form-input" value={supplierForm.name} onChange={handleSupplierFormChange} maxLength="255" disabled={supplierSaving} placeholder="Nhập tên nhà cung cấp" />
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label htmlFor="supplier-phone">Số điện thoại</label>
                                    <input id="supplier-phone" name="phone" type="text" className="admin-form-input" value={supplierForm.phone} onChange={handleSupplierFormChange} maxLength="20" disabled={supplierSaving} placeholder="Nhập số điện thoại" />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="supplier-email">Email</label>
                                    <input id="supplier-email" name="email" type="email" className="admin-form-input" value={supplierForm.email} onChange={handleSupplierFormChange} maxLength="255" disabled={supplierSaving} placeholder="Nhập email" />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="supplier-address">Địa chỉ</label>
                                <input id="supplier-address" name="address" type="text" className="admin-form-input" value={supplierForm.address} onChange={handleSupplierFormChange} maxLength="255" disabled={supplierSaving} placeholder="Nhập địa chỉ" />
                            </div>

                            {supplierError && (
                                <div className="admin-form-error">{supplierError}</div>
                            )}

                            <div className="admin-modal-actions">
                                <button type="button" className="admin-secondary-button" onClick={closeSupplierModal} disabled={supplierSaving}>
                                    Hủy
                                </button>

                                <button type="submit" className="admin-primary-button" disabled={supplierSaving}>
                                    {supplierSaving ? "Đang thêm..." : "Thêm nhà cung cấp"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalType === "detail" && selectedOrder && (
                <div className="admin-modal-overlay" onMouseDown={closeModal}>
                    <div className="admin-modal admin-purchase-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-section-eyebrow">PURCHASE ORDER</span>
                                <h2>Chi tiết phiếu #{selectedOrder.id}</h2>
                            </div>

                            <button type="button" className="admin-modal-close" onClick={closeModal} disabled={Boolean(receivingId)}>
                                ×
                            </button>
                        </div>

                        <div className="admin-purchase-detail-grid">
                            <div>
                                <span>Nhà cung cấp</span>
                                <strong>{selectedOrder.supplierName || "-"}</strong>
                            </div>

                            <div>
                                <span>Ngày nhập</span>
                                <strong>{formatDateTime(selectedOrder.orderDate)}</strong>
                            </div>

                            <div>
                                <span>Trạng thái</span>
                                <strong>{getPurchaseStatus(selectedOrder.isReceived).label}</strong>
                            </div>

                            <div>
                                <span>Tổng tiền</span>
                                <strong>{formatMoney(selectedOrder.totalAmount)}</strong>
                            </div>
                        </div>

                        <div className="admin-purchase-detail-note">
                            <span>Ghi chú</span>
                            <p>{selectedOrder.note || "Không có ghi chú."}</p>
                        </div>

                        <div className="admin-section-heading admin-purchase-detail-items-heading">
                            <div>
                                <span className="admin-section-eyebrow">ITEMS</span>
                                <h3>Sản phẩm trong phiếu</h3>
                            </div>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Giá nhập</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {selectedOrder.items?.length ? (
                                        selectedOrder.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.productName || "-"}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatMoney(item.importPrice)}</td>
                                                <td><strong>{formatMoney(item.totalPrice)}</strong></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="admin-table-empty">Không có sản phẩm.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-modal-actions">
                            <button type="button" className="admin-secondary-button" onClick={closeModal} disabled={Boolean(receivingId)}>
                                Đóng
                            </button>

                            {!selectedOrder.isReceived && (
                                <button type="button" className="admin-primary-button" disabled={receivingId === selectedOrder.id} onClick={() => handleReceive(selectedOrder)}>
                                    {receivingId === selectedOrder.id ? "Đang nhận hàng..." : "Nhận hàng"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPurchaseOrders;