import { useCallback, useEffect, useState } from "react";
import Header from "../../components/Header";
import { authApis, endpoints } from "../../configs/api/Apis";
import "../../styles/admin/AdminCommon.css";
import "./AdminInvoices.css";

const PAGE_SIZE = 10;

const PAYMENT_METHOD_LABELS = {
    CASH: "Tiền mặt",
    MOMO: "MoMo",
    VNPAY: "VNPay",
    ZALOPAY: "ZaloPay",
};

const PAYMENT_STATUS_LABELS = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
};

const ORDER_STATUS_LABELS = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

function normalizeContent(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (data?.content && Array.isArray(data.content)) {
        return data.content;
    }

    if (data?.data?.content && Array.isArray(data.data.content)) {
        return data.data.content;
    }

    if (data?.data && Array.isArray(data.data)) {
        return data.data;
    }

    return [];
}

function formatMoney(value) {
    const number = Number(value || 0);
    return `${number.toLocaleString("vi-VN")}đ`;
}

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
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
    return PAYMENT_METHOD_LABELS[value] || value || "-";
}

function getPaymentStatusLabel(value) {
    return PAYMENT_STATUS_LABELS[value] || value || "-";
}

function getOrderStatusLabel(value) {
    return ORDER_STATUS_LABELS[value] || value || "-";
}

function getOrderStatusClass(value) {
    return String(value || "").toLowerCase();
}

function AdminInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [keyword, setKeyword] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

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

            const response = await authApis().get(endpoints.adminInvoices, {
                params,
            });

            setInvoices(normalizeContent(response.data));
            setTotalPages(Number(response.data?.totalPages || 0));
        } catch (err) {
            console.error("LOAD ADMIN INVOICES ERROR:", err);
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
            setOrderStatus(invoice.orderStatus || "");

            const response = await authApis().get(
                endpoints.adminInvoiceDetail(invoice.id)
            );

            setSelectedInvoice(response.data);
            setOrderStatus(response.data?.orderStatus || "");
        } catch (err) {
            console.error("LOAD ADMIN INVOICE DETAIL ERROR:", err);

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
        if (detailLoading || updatingOrderStatus) return;

        setSelectedInvoice(null);
        setOrderStatus("");
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
                endpoints.adminOrderStatus(selectedInvoice.productOrderId),
                null,
                {
                    params: {
                        status: orderStatus,
                    },
                }
            );

            const updatedStatus = response.data?.orderStatus || orderStatus;

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
            console.error("UPDATE ORDER STATUS ERROR:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể cập nhật trạng thái đơn hàng."
            );
        } finally {
            setUpdatingOrderStatus(false);
        }
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

    const handlePageChange = (nextPage) => {
        if (nextPage < 0 || nextPage >= displayTotalPages) return;

        setPage(nextPage);
    };

    return (
        <div className="admin-page admin-invoices-page">
            <Header role="ADMIN" title="Hóa đơn" />

            <main className="admin-main">
                <div className="admin-shell">
                    <section className="admin-heading">
                        <div>
                            <span className="admin-section-eyebrow">BILLING MANAGEMENT</span>
                            <h1>Hóa đơn</h1>
                            <p>Quản lý hóa đơn, đơn hàng sản phẩm và theo dõi trạng thái thanh toán của khách hàng.</p>
                        </div>
                    </section>

                    <section className="admin-filter-card">
                        <div className="admin-invoice-filter-grid">
                            <div className="admin-form-group admin-invoice-keyword">
                                <label htmlFor="invoice-keyword">Tìm kiếm</label>
                                <input id="invoice-keyword" type="text" className="admin-form-input" value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0); }} placeholder="Mã hóa đơn, tên khách hàng, email..." />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="invoice-customer-id">Mã khách hàng</label>
                                <input id="invoice-customer-id" type="number" className="admin-form-input" value={customerId} onChange={(event) => { setCustomerId(event.target.value); setPage(0); }} placeholder="ID khách hàng" min="1" />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="invoice-status">Trạng thái thanh toán</label>
                                <select id="invoice-status" className="admin-form-select" value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); setPage(0); }}>
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="PENDING">Chờ thanh toán</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="FAILED">Thất bại</option>
                                    <option value="REFUNDED">Đã hoàn tiền</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="invoice-method">Phương thức</label>
                                <select id="invoice-method" className="admin-form-select" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setPage(0); }}>
                                    <option value="">Tất cả phương thức</option>
                                    <option value="CASH">Tiền mặt</option>
                                    <option value="MOMO">MoMo</option>
                                    <option value="VNPAY">VNPay</option>
                                    <option value="ZALOPAY">ZaloPay</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="invoice-from">Từ ngày</label>
                                <input id="invoice-from" type="date" className="admin-form-input" value={from} onChange={(event) => { setFrom(event.target.value); setPage(0); }} />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="invoice-to">Đến ngày</label>
                                <input id="invoice-to" type="date" className="admin-form-input" value={to} onChange={(event) => { setTo(event.target.value); setPage(0); }} />
                            </div>

                            <div className="admin-filter-actions">
                                <button type="button" className="admin-secondary-button" onClick={resetFilters}>Xóa lọc</button>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="admin-invoices-error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={loadInvoices}>Thử lại</button>
                        </div>
                    )}

                    <section className="admin-section-card admin-invoices-card">
                        <div className="admin-section-heading">
                            <div>
                                <span className="admin-section-eyebrow">INVOICES</span>
                                <h2>Danh sách hóa đơn</h2>
                            </div>

                            <span>
                                {loading ? "Đang tải..." : `Trang ${page + 1} / ${displayTotalPages}`}
                            </span>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table admin-invoice-table">
                                <thead>
                                    <tr>
                                        <th>Mã hóa đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày tạo</th>
                                        <th>Tạm tính</th>
                                        <th>Giảm giá</th>
                                        <th>Tổng tiền</th>
                                        <th>Thanh toán</th>
                                        <th>Trạng thái thanh toán</th>
                                        <th>Trạng thái đơn hàng</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="10" className="admin-table-empty">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="admin-table-empty">Không có hóa đơn phù hợp.</td>
                                        </tr>
                                    ) : (
                                        invoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td data-label="Mã hóa đơn">
                                                    <strong>{invoice.invoiceCode || `#${invoice.id}`}</strong>
                                                </td>

                                                <td data-label="Khách hàng">
                                                    <div className="admin-invoice-customer">
                                                        <strong>{invoice.customerName || "-"}</strong>
                                                        <span>ID: {invoice.customerId || "-"}</span>
                                                    </div>
                                                </td>

                                                <td data-label="Ngày tạo">
                                                    {formatDateTime(invoice.createdAt)}
                                                </td>

                                                <td data-label="Tạm tính">
                                                    {formatMoney(invoice.subTotal)}
                                                </td>

                                                <td data-label="Giảm giá">
                                                    {formatMoney(invoice.discountAmount)}
                                                </td>

                                                <td data-label="Tổng tiền">
                                                    <strong>{formatMoney(invoice.totalAmount)}</strong>
                                                </td>

                                                <td data-label="Thanh toán">
                                                    {getPaymentMethodLabel(invoice.paymentMethod)}
                                                </td>

                                                <td data-label="Trạng thái thanh toán">
                                                    <span className={`admin-invoice-status admin-invoice-status-${String(invoice.paymentStatus || "").toLowerCase()}`}>
                                                        {getPaymentStatusLabel(invoice.paymentStatus)}
                                                    </span>
                                                </td>

                                                <td data-label="Trạng thái đơn hàng">
                                                    {invoice.productOrderId ? (
                                                        <div className="admin-invoice-order-status-cell">
                                                            <span className={`admin-order-status admin-order-status-${getOrderStatusClass(invoice.orderStatus)}`}>
                                                                {getOrderStatusLabel(invoice.orderStatus)}
                                                            </span>
                                                            <span className="admin-invoice-order-id">Đơn #{invoice.productOrderId}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="admin-invoice-no-order">-</span>
                                                    )}
                                                </td>

                                                <td data-label="Thao tác">
                                                    <button type="button" className="admin-invoice-detail-button" onClick={() => openDetail(invoice)}>
                                                        Xem
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-pagination">
                            <button type="button" className="admin-page-button" disabled={page === 0 || loading} onClick={() => handlePageChange(0)}>⏮</button>

                            <button type="button" className="admin-page-button" disabled={page === 0 || loading} onClick={() => handlePageChange(page - 1)}>←</button>

                            {Array.from({ length: displayTotalPages }, (_, index) => index).map((pageNumber) => (
                                <button key={pageNumber} type="button" className={`admin-page-button ${pageNumber === page ? "active" : ""}`} disabled={loading} onClick={() => handlePageChange(pageNumber)}>
                                    {pageNumber + 1}
                                </button>
                            ))}

                            <button type="button" className="admin-page-button" disabled={page >= displayTotalPages - 1 || loading} onClick={() => handlePageChange(page + 1)}>→</button>

                            <button type="button" className="admin-page-button" disabled={page >= displayTotalPages - 1 || loading} onClick={() => handlePageChange(displayTotalPages - 1)}>⏭</button>
                        </div>
                    </section>
                </div>
            </main>

            {selectedInvoice && (
                <div className="admin-modal-overlay" onMouseDown={closeDetail}>
                    <div className="admin-modal admin-invoice-detail-modal" onMouseDown={(event) => event.stopPropagation()}>

                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-section-eyebrow">INVOICE DETAIL</span>
                                <h2>{selectedInvoice.invoiceCode || `Hóa đơn #${selectedInvoice.id}`}</h2>
                            </div>

                            <button type="button" className="admin-modal-close" onClick={closeDetail} disabled={detailLoading || updatingOrderStatus}>
                                ×
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="admin-invoice-detail-loading">
                                Đang tải chi tiết hóa đơn...
                            </div>
                        ) : (
                            <>
                                <div className="admin-invoice-detail-summary">
                                    <div>
                                        <span>Khách hàng</span>
                                        <strong>{selectedInvoice.customerName || "-"}</strong>
                                    </div>

                                    <div>
                                        <span>Khách hàng ID</span>
                                        <strong>{selectedInvoice.customerId || "-"}</strong>
                                    </div>

                                    <div>
                                        <span>Mã lịch hẹn</span>
                                        <strong>{selectedInvoice.appointmentId || "-"}</strong>
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
                                        <span>Trạng thái thanh toán</span>
                                        <strong>{getPaymentStatusLabel(selectedInvoice.paymentStatus)}</strong>
                                    </div>

                                    {selectedInvoice.productOrderId && (
                                        <div>
                                            <span>Trạng thái đơn hàng</span>
                                            <strong>{getOrderStatusLabel(selectedInvoice.orderStatus)}</strong>
                                        </div>
                                    )}
                                </div>

                                {selectedInvoice.productOrderId && selectedInvoice.orderStatus !== "DELIVERED" && selectedInvoice.orderStatus !== "CANCELLED" && (
                                    <div className="admin-invoice-order-status-update">
                                        <div className="admin-invoice-order-status-heading">
                                            <span className="admin-section-eyebrow">ORDER STATUS</span>
                                            <h3>Cập nhật trạng thái đơn hàng</h3>
                                            <p>Trạng thái này sẽ được cập nhật cho đơn hàng của khách hàng.</p>
                                        </div>

                                        <div className="admin-invoice-order-status-controls">
                                            <select className="admin-form-select" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} disabled={updatingOrderStatus}>
                                                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>

                                            <button type="button" className="admin-primary-button" onClick={handleUpdateOrderStatus} disabled={updatingOrderStatus || orderStatus === selectedInvoice.orderStatus}>
                                                {updatingOrderStatus ? "ĐANG CẬP NHẬT..." : "CẬP NHẬT"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="admin-invoice-detail-items">
                                    <div className="admin-section-heading">
                                        <div>
                                            <span className="admin-section-eyebrow">ITEMS</span>
                                            <h3>Chi tiết dịch vụ & sản phẩm</h3>
                                        </div>
                                    </div>

                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Loại</th>
                                                    <th>Tên</th>
                                                    <th>Số lượng</th>
                                                    <th>Đơn giá</th>
                                                    <th>Thành tiền</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {selectedInvoice.items?.length ? (
                                                    selectedInvoice.items.map((item, index) => (
                                                        <tr key={item.id || index}>
                                                            <td data-label="Loại">{item.serviceId ? "Dịch vụ" : "Sản phẩm"}</td>
                                                            <td data-label="Tên">{item.serviceName || item.productName || "-"}</td>
                                                            <td data-label="Số lượng">{item.quantity ?? "-"}</td>
                                                            <td data-label="Đơn giá">{formatMoney(item.unitPrice)}</td>
                                                            <td data-label="Thành tiền"><strong>{formatMoney(item.totalPrice)}</strong></td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="admin-table-empty">Không có sản phẩm/dịch vụ.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="admin-invoice-detail-total">
                                    <div>
                                        <span>Tạm tính</span>
                                        <strong>{formatMoney(selectedInvoice.subTotal)}</strong>
                                    </div>

                                    <div>
                                        <span>Giảm giá</span>
                                        <strong>- {formatMoney(selectedInvoice.discountAmount)}</strong>
                                    </div>

                                    <div>
                                        <span>Hoàn tiền</span>
                                        <strong>{formatMoney(selectedInvoice.refundAmount)}</strong>
                                    </div>

                                    <div className="admin-invoice-grand-total">
                                        <span>Tổng thanh toán</span>
                                        <strong>{formatMoney(selectedInvoice.totalAmount)}</strong>
                                    </div>
                                </div>

                                {selectedInvoice.refundTime && (
                                    <div className="admin-invoice-refund-note">
                                        Thời gian hoàn tiền: {formatDateTime(selectedInvoice.refundTime)}
                                    </div>
                                )}

                                <div className="admin-modal-actions">
                                    <button type="button" className="admin-secondary-button" onClick={closeDetail} disabled={updatingOrderStatus}>
                                        Đóng
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminInvoices;

