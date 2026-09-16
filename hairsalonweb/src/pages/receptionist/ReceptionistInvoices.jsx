import { useCallback, useEffect, useState } from "react";
import Header from "../../components/Header";
import { authApis, endpoints } from "../../configs/api/Apis";
import "./ReceptionistInvoices.css";

const PAGE_SIZE = 10;

const PAYMENT_METHOD_LABELS = {
    CASH: "Tiền mặt",
    VNPAY: "VNPay",
    MOMO: "MoMo",
    ZALOPAY: "ZaloPay",
};

const PAYMENT_STATUS_LABELS = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
    REFUNDED: "Đã hoàn tiền",
};

const ORDER_STATUS_LABELS = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
};

function normalizeContent(data) {
    if (Array.isArray(data)) {
        return data;
    }

    return Array.isArray(data?.content) ? data.content : [];
}

function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + " ₫";
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getPaymentMethodLabel(value) {
    return PAYMENT_METHOD_LABELS[value] || value || "—";
}

function getPaymentStatusLabel(value) {
    return PAYMENT_STATUS_LABELS[value] || value || "—";
}

function getOrderStatusLabel(value) {
    return ORDER_STATUS_LABELS[value] || value || "—";
}

function getPaymentStatusClass(value) {
    return String(value || "").toLowerCase();
}

function getOrderStatusClass(value) {
    return String(value || "").toLowerCase();
}

function ReceptionistInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [keyword, setKeyword] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [orderStatus, setOrderStatus] = useState("");
    const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

    const displayTotalPages = Math.max(totalPages, 1);

    const loadInvoices = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                size: PAGE_SIZE,
            };

            if (keyword.trim()) {
                params.keyword = keyword.trim();
            }

            if (customerId) {
                params.customerId = customerId;
            }

            if (paymentStatus) {
                params.paymentStatus = paymentStatus;
            }

            if (paymentMethod) {
                params.paymentMethod = paymentMethod;
            }

            if (from) {
                params.from = `${from}T00:00:00`;
            }

            if (to) {
                params.to = `${to}T23:59:59`;
            }

            const response = await authApis().get(
                endpoints.adminInvoices,
                { params }
            );

            setInvoices(normalizeContent(response.data));
            setTotalPages(Number(response.data?.totalPages || 0));
        } catch (err) {
            console.error("LOAD RECEPTIONIST INVOICES ERROR:", err);
            setInvoices([]);
            setTotalPages(0);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể tải danh sách hóa đơn."
            );
        } finally {
            setLoading(false);
        }
    }, [keyword, customerId, paymentStatus, paymentMethod, from, to, page]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const openDetail = async (invoice) => {
        try {
            setDetailLoading(true);
            setSelectedInvoice(invoice);
            setOrderStatus(invoice?.orderStatus || "");

            const response = await authApis().get(
                endpoints.adminInvoiceDetail(invoice.id)
            );

            setSelectedInvoice(response.data);
            setOrderStatus(response.data?.orderStatus || "");
        } catch (err) {
            console.error("LOAD RECEPTIONIST INVOICE DETAIL ERROR:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể tải chi tiết hóa đơn."
            );

            setSelectedInvoice(null);
            setOrderStatus("");
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        if (detailLoading || updatingOrderStatus) {
            return;
        }

        setSelectedInvoice(null);
        setOrderStatus("");
    };

    const resetFilters = () => {
        setKeyword("");
        setCustomerId("");
        setPaymentStatus("");
        setPaymentMethod("");
        setFrom("");
        setTo("");
        setPage(0);
    };

    const handleUpdateOrderStatus = async () => {
        if (!selectedInvoice?.productOrderId || !orderStatus) {
            return;
        }

        const currentStatus = String(
            selectedInvoice.orderStatus || ""
        ).toUpperCase();

        if (currentStatus === orderStatus) {
            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc muốn cập nhật trạng thái đơn hàng thành "${getOrderStatusLabel(orderStatus)}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingOrderStatus(true);

            const response = await authApis().put(
                endpoints.adminOrderStatus(
                    selectedInvoice.productOrderId
                ),
                null,
                {
                    params: {
                        status: orderStatus,
                    },
                }
            );

            const updatedStatus =
                response.data?.orderStatus || orderStatus;

            setSelectedInvoice((current) => ({
                ...current,
                orderStatus: updatedStatus,
            }));

            setOrderStatus(updatedStatus);

            setInvoices((current) =>
                current.map((invoice) =>
                    invoice.id === selectedInvoice.id
                        ? {
                            ...invoice,
                            orderStatus: updatedStatus,
                        }
                        : invoice
                )
            );
        } catch (err) {
            console.error(
                "UPDATE RECEPTIONIST ORDER STATUS ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể cập nhật trạng thái đơn hàng."
            );
        } finally {
            setUpdatingOrderStatus(false);
        }
    };

    const handlePageChange = (nextPage) => {
        if (nextPage < 0 || nextPage >= displayTotalPages) {
            return;
        }

        setPage(nextPage);
    };

    return (
        <div className="admin-page receptionist-invoices-page">
            <Header role="RECEPTIONIST" title="Hóa đơn" />

            <main className="admin-main">
                <div className="admin-shell">
                    <section className="admin-heading">
                        <div>
                            <span className="admin-section-eyebrow">BILLING MANAGEMENT</span>
                            <h1>Hóa đơn</h1>
                            <p>Tra cứu hóa đơn, thanh toán và theo dõi đơn hàng sản phẩm của khách hàng.</p>
                        </div>
                    </section>

                    <section className="admin-filter-card receptionist-invoice-filter-card">
                        <div className="receptionist-invoice-filter-grid">
                            <div className="admin-form-group">
                                <label htmlFor="receptionist-invoice-keyword">Tìm kiếm</label>
                                <input id="receptionist-invoice-keyword" type="text" className="admin-form-input" value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0); }} placeholder="Mã hóa đơn, khách hàng..." />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="receptionist-invoice-customer">Mã khách hàng</label>
                                <input id="receptionist-invoice-customer" type="number" className="admin-form-input" value={customerId} onChange={(event) => { setCustomerId(event.target.value); setPage(0); }} placeholder="ID khách hàng" min="1" />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="receptionist-invoice-payment-status">Thanh toán</label>
                                <select id="receptionist-invoice-payment-status" className="admin-form-select" value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); setPage(0); }}>
                                    <option value="">Tất cả</option>
                                    <option value="PENDING">Chờ thanh toán</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="FAILED">Thất bại</option>
                                    <option value="REFUNDED">Đã hoàn tiền</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="receptionist-invoice-payment-method">Phương thức</label>
                                <select id="receptionist-invoice-payment-method" className="admin-form-select" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setPage(0); }}>
                                    <option value="">Tất cả</option>
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="VNPAY">VNPay</option>
                                    <option value="MOMO">MoMo</option>
                                    <option value="ZALOPAY">ZaloPay</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="receptionist-invoice-from">Từ ngày</label>
                                <input id="receptionist-invoice-from" type="date" className="admin-form-input" value={from} onChange={(event) => { setFrom(event.target.value); setPage(0); }} />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="receptionist-invoice-to">Đến ngày</label>
                                <input id="receptionist-invoice-to" type="date" className="admin-form-input" value={to} onChange={(event) => { setTo(event.target.value); setPage(0); }} />
                            </div>

                            <button type="button" className="admin-filter-reset receptionist-invoice-reset" onClick={resetFilters}>ĐẶT LẠI</button>
                        </div>
                    </section>

                    {error && (
                        <div className="admin-invoices-error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={loadInvoices}>Thử lại</button>
                        </div>
                    )}

                    <section className="admin-section-card receptionist-invoices-card">
                        <div className="admin-section-heading">
                            <div>
                                <span className="admin-section-eyebrow">INVOICES</span>
                                <h2>Danh sách hóa đơn</h2>
                            </div>

                            <span>{loading ? "Đang tải..." : `Trang ${page + 1} / ${displayTotalPages}`}</span>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table receptionist-invoice-table">
                                <thead>
                                    <tr>
                                        <th>Mã hóa đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày tạo</th>
                                        <th>Tạm tính</th>
                                        <th>Giảm giá</th>
                                        <th>Tổng tiền</th>
                                        <th>Thanh toán</th>
                                        <th>Đơn hàng</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="receptionist-invoice-empty">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="receptionist-invoice-empty">Không có hóa đơn phù hợp.</td>
                                        </tr>
                                    ) : (
                                        invoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td>
                                                    <strong>{invoice.invoiceCode || `#${invoice.id}`}</strong>
                                                </td>

                                                <td>
                                                    <div className="receptionist-invoice-customer">
                                                        <strong>{invoice.customerName || "—"}</strong>
                                                        <span>ID: {invoice.customerId || "—"}</span>
                                                    </div>
                                                </td>

                                                <td>{formatDateTime(invoice.createdAt)}</td>

                                                <td>{formatMoney(invoice.subTotal)}</td>

                                                <td>{formatMoney(invoice.discountAmount)}</td>

                                                <td>
                                                    <strong>{formatMoney(invoice.totalAmount)}</strong>
                                                </td>

                                                <td>
                                                    <div className="receptionist-invoice-payment">
                                                        <span>{getPaymentMethodLabel(invoice.paymentMethod)}</span>
                                                        <span className={`receptionist-invoice-status ${getPaymentStatusClass(invoice.paymentStatus)}`}>{getPaymentStatusLabel(invoice.paymentStatus)}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    {invoice.productOrderId ? (
                                                        <span className={`receptionist-invoice-order-status ${getOrderStatusClass(invoice.orderStatus)}`}>{getOrderStatusLabel(invoice.orderStatus)}</span>
                                                    ) : (
                                                        <span className="receptionist-invoice-service-label">Dịch vụ</span>
                                                    )}
                                                </td>

                                                <td>
                                                    <button type="button" className="admin-action-button" onClick={() => openDetail(invoice)}>CHI TIẾT</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-pagination">
                            <button type="button" onClick={() => handlePageChange(0)} disabled={page === 0}>⏮</button>
                            <button type="button" onClick={() => handlePageChange(page - 1)} disabled={page === 0}>←</button>

                            {Array.from({ length: displayTotalPages }, (_, index) => index)
                                .slice(Math.max(0, page - 1), Math.min(displayTotalPages, page + 2))
                                .map((pageNumber) => (
                                    <button key={pageNumber} type="button" className={pageNumber === page ? "active" : ""} onClick={() => handlePageChange(pageNumber)}>{pageNumber + 1}</button>
                                ))}

                            <button type="button" onClick={() => handlePageChange(page + 1)} disabled={page >= displayTotalPages - 1}>→</button>
                            <button type="button" onClick={() => handlePageChange(displayTotalPages - 1)} disabled={page >= displayTotalPages - 1}>⏭</button>
                        </div>
                    </section>
                </div>
            </main>

            {selectedInvoice && (
                <div className="admin-modal-overlay" onMouseDown={closeDetail}>
                    <div className="admin-modal receptionist-invoice-modal" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-section-eyebrow">INVOICE DETAIL</span>
                                <h2>{selectedInvoice.invoiceCode || `#${selectedInvoice.id}`}</h2>
                            </div>

                            <button type="button" className="admin-modal-close" onClick={closeDetail}>×</button>
                        </div>

                        {detailLoading ? (
                            <div className="receptionist-invoice-modal-loading">Đang tải chi tiết...</div>
                        ) : (
                            <div className="receptionist-invoice-modal-body">
                                <div className="receptionist-invoice-summary">
                                    <div>
                                        <span>Khách hàng</span>
                                        <strong>{selectedInvoice.customerName || "—"}</strong>
                                    </div>

                                    <div>
                                        <span>Mã khách hàng</span>
                                        <strong>{selectedInvoice.customerId || "—"}</strong>
                                    </div>

                                    {selectedInvoice.productOrderId && (
                                        <div>
                                            <span>Mã đơn hàng</span>
                                            <strong>#{selectedInvoice.productOrderId}</strong>
                                        </div>
                                    )}

                                    <div>
                                        <span>Ngày tạo</span>
                                        <strong>{formatDateTime(selectedInvoice.createdAt)}</strong>
                                    </div>

                                    <div>
                                        <span>Phương thức</span>
                                        <strong>{getPaymentMethodLabel(selectedInvoice.paymentMethod)}</strong>
                                    </div>

                                    <div>
                                        <span>Thanh toán</span>
                                        <strong>{getPaymentStatusLabel(selectedInvoice.paymentStatus)}</strong>
                                    </div>

                                    {selectedInvoice.productOrderId && (
                                        <div>
                                            <span>Đơn hàng</span>
                                            <strong>{getOrderStatusLabel(selectedInvoice.orderStatus)}</strong>
                                        </div>
                                    )}
                                </div>

                                {selectedInvoice.productOrderId && selectedInvoice.orderStatus !== "DELIVERED" && selectedInvoice.orderStatus !== "CANCELLED" && (
                                    <div className="receptionist-invoice-order-update">
                                        <div>
                                            <span className="admin-section-eyebrow">ORDER STATUS</span>
                                            <h3>Cập nhật trạng thái đơn hàng</h3>
                                            <p>Trạng thái này được cập nhật trực tiếp cho đơn hàng sản phẩm.</p>
                                        </div>

                                        <div className="receptionist-invoice-order-controls">
                                            <select className="admin-form-select" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} disabled={updatingOrderStatus}>
                                                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>

                                            <button type="button" className="admin-primary-button" onClick={handleUpdateOrderStatus} disabled={updatingOrderStatus || orderStatus === selectedInvoice.orderStatus}>{updatingOrderStatus ? "ĐANG CẬP NHẬT..." : "CẬP NHẬT"}</button>
                                        </div>
                                    </div>
                                )}

                                <div className="receptionist-invoice-items">
                                    <div className="admin-section-heading">
                                        <div>
                                            <span className="admin-section-eyebrow">ITEMS</span>
                                            <h3>Chi tiết</h3>
                                        </div>
                                    </div>

                                    <div className="receptionist-invoice-items-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm / dịch vụ</th>
                                                    <th>SL</th>
                                                    <th>Đơn giá</th>
                                                    <th>Thành tiền</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {selectedInvoice.items?.length ? (
                                                    selectedInvoice.items.map((item) => (
                                                        <tr key={item.id}>
                                                            <td>
                                                                <strong>{item.productName || item.serviceName || "Sản phẩm / dịch vụ"}</strong>
                                                            </td>
                                                            <td>{item.quantity}</td>
                                                            <td>{formatMoney(item.unitPrice)}</td>
                                                            <td>{formatMoney(item.totalPrice)}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="receptionist-invoice-empty">Không có item.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="receptionist-invoice-total">
                                    <div>
                                        <span>Tạm tính</span>
                                        <strong>{formatMoney(selectedInvoice.subTotal)}</strong>
                                    </div>

                                    <div>
                                        <span>Giảm giá</span>
                                        <strong>-{formatMoney(selectedInvoice.discountAmount)}</strong>
                                    </div>

                                    <div className="receptionist-invoice-total-final">
                                        <span>Tổng thanh toán</span>
                                        <strong>{formatMoney(selectedInvoice.totalAmount)}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="admin-modal-footer">
                            <button type="button" className="admin-secondary-button" onClick={closeDetail}>ĐÓNG</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default ReceptionistInvoices;