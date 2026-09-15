import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "./OrderDetailPage.css";

const paymentStatusLabels = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
    REFUNDED: "Đã hoàn tiền",
};

const paymentMethodLabels = {
    CASH: "Thanh toán tại salon",
    MOMO: "MoMo",
    VNPAY: "VNPay",
    ZALOPAY: "ZaloPay",
};

const orderStatusLabels = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [paying, setPaying] = useState(false);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(
                endpoints.myOrderDetail(id)
            );

            setOrder(response.data);
        } catch (err) {
            console.error("LOAD ORDER DETAIL ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Không thể tải thông tin đơn hàng."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [id]);

    const formatMoney = (value) => {
        return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "--";
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
    };

    const handleCancel = async () => {
        const confirmed = window.confirm(
            "Bạn có chắc muốn hủy đơn hàng này?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancelling(true);
            setError("");

            await authApis().post(
                endpoints.cancelOrder(id)
            );

            await loadOrder();
        } catch (err) {
            console.error("CANCEL ORDER ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Không thể hủy đơn hàng."
            );
        } finally {
            setCancelling(false);
        }
    };

    const handlePayment = async () => {
        if (!order) {
            return;
        }

        if (String(order.paymentStatus || "").toUpperCase() !== "PENDING") {
            setError("Đơn hàng không ở trạng thái chờ thanh toán.");
            return;
        }

        try {
            setPaying(true);
            setError("");

            const response = await authApis().post(
                endpoints.vnpayCreateOrder,
                null,
                {
                    params: {
                        orderId: Number(id),
                    },
                }
            );

            if (!response.data?.paymentUrl) {
                throw new Error("Không nhận được đường dẫn thanh toán VNPay.");
            }

            window.location.href = response.data.paymentUrl;
        } catch (err) {
            console.error("ORDER PAYMENT ERROR:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Không thể mở thanh toán VNPay."
            );
        } finally {
            setPaying(false);
        }
    };

    const getOrderStatusClass = (status) => {
        return String(status || "").toLowerCase();
    };

    const getPaymentStatusClass = (status) => {
        return String(status || "").toLowerCase();
    };

    if (loading) {
        return (
            <div className="order-detail-page">
                <Header />

                <main className="order-detail-main">
                    <div className="order-detail-shell">
                        <div className="order-detail-loading">
                            <div className="order-detail-spinner"></div>
                            <p>Đang tải thông tin đơn hàng...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-page">
                <Header />

                <main className="order-detail-main">
                    <div className="order-detail-shell">
                        <div className="order-detail-error">
                            <h2>Không tìm thấy đơn hàng</h2>
                            <p>{error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem."}</p>
                            <button type="button" onClick={() => navigate("/customer/orders")}>QUAY LẠI ĐƠN HÀNG</button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const paymentStatus = String(order.paymentStatus || "").toUpperCase();
    const orderStatus = String(order.orderStatus || "").toUpperCase();
    const items = order.items || [];
    const canCancel = orderStatus === "PENDING";
    const canPay = paymentStatus === "PENDING" && orderStatus !== "CANCELLED";

    return (
        <div className="order-detail-page">
            <Header />

            <main className="order-detail-main">
                <div className="order-detail-shell">

                    <div className="order-detail-breadcrumb">
                        <button type="button" onClick={() => navigate("/")}>Trang chủ</button>
                        <span>/</span>
                        <button type="button" onClick={() => navigate("/customer/orders")}>Đơn hàng</button>
                        <span>/</span>
                        <span>Chi tiết</span>
                    </div>

                    <div className="order-detail-header">
                        <div>
                            <span className="order-detail-eyebrow">ORDER DETAIL</span>
                            <h1>Chi tiết đơn hàng</h1>
                            <p>Mã đơn hàng <strong>{order.orderCode || `ORD-${order.id}`}</strong></p>
                        </div>

                        <div className={`order-detail-status ${getOrderStatusClass(orderStatus)}`}>
                            <span className="order-detail-status-dot"></span>
                            {orderStatusLabels[orderStatus] || orderStatus}
                        </div>
                    </div>

                    {error && (
                        <div className="order-detail-alert">{error}</div>
                    )}

                    <div className="order-detail-layout">

                        <div className="order-detail-left">

                            <section className="order-detail-card">

                                <div className="order-detail-card-header">
                                    <div>
                                        <span>PRODUCTS</span>
                                        <h2>Sản phẩm đã đặt</h2>
                                    </div>

                                    <strong>{items.length} sản phẩm</strong>
                                </div>

                                <div className="order-detail-products">

                                    {items.map((item) => (
                                        <div className="order-detail-product" key={item.id}>

                                            <div className="order-detail-product-image">
                                                {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>NO IMAGE</span>}
                                            </div>

                                            <div className="order-detail-product-info">
                                                <strong>{item.productName}</strong>
                                                <span>Đơn giá: {formatMoney(item.unitPrice)}</span>
                                                <span>Số lượng: {item.quantity}</span>
                                            </div>

                                            <strong className="order-detail-product-total">{formatMoney(item.totalPrice)}</strong>

                                        </div>
                                    ))}

                                </div>

                            </section>

                            <section className="order-detail-card">

                                <div className="order-detail-card-header">
                                    <div>
                                        <span>SHIPPING</span>
                                        <h2>Thông tin nhận hàng</h2>
                                    </div>
                                </div>

                                <div className="order-detail-info-grid">

                                    <div>
                                        <span>Người nhận</span>
                                        <strong>{order.receiverName || "--"}</strong>
                                    </div>

                                    <div>
                                        <span>Số điện thoại</span>
                                        <strong>{order.receiverPhone || "--"}</strong>
                                    </div>

                                    <div className="order-detail-info-full">
                                        <span>Địa chỉ</span>
                                        <strong>{order.shippingAddress || "--"}</strong>
                                    </div>

                                    <div className="order-detail-info-full">
                                        <span>Ghi chú</span>
                                        <strong>{order.note || "Không có ghi chú."}</strong>
                                    </div>

                                </div>

                            </section>

                        </div>

                        <aside className="order-detail-right">

                            <section className="order-detail-summary">

                                <span className="order-detail-summary-eyebrow">ORDER SUMMARY</span>
                                <h2>Tổng quan đơn hàng</h2>

                                <div className="order-detail-summary-line">
                                    <span>Mã đơn hàng</span>
                                    <strong>{order.orderCode || `ORD-${order.id}`}</strong>
                                </div>

                                <div className="order-detail-summary-line">
                                    <span>Ngày đặt</span>
                                    <strong>{formatDateTime(order.createdAt)}</strong>
                                </div>

                                <div className="order-detail-summary-line">
                                    <span>Thanh toán</span>
                                    <strong className={`order-detail-payment-status ${getPaymentStatusClass(paymentStatus)}`}>{paymentStatusLabels[paymentStatus] || paymentStatus}</strong>
                                </div>

                                <div className="order-detail-summary-line">
                                    <span>Phương thức</span>
                                    <strong>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod || "--"}</strong>
                                </div>

                                <div className="order-detail-summary-divider"></div>

                                <div className="order-detail-summary-line">
                                    <span>Tạm tính</span>
                                    <strong>{formatMoney(order.subTotal)}</strong>
                                </div>

                                <div className="order-detail-summary-line">
                                    <span>Giảm giá</span>
                                    <strong>{formatMoney(order.discountAmount)}</strong>
                                </div>

                                <div className="order-detail-summary-line">
                                    <span>Phí giao hàng</span>
                                    <strong>{formatMoney(order.shippingFee)}</strong>
                                </div>

                                <div className="order-detail-summary-divider"></div>

                                <div className="order-detail-summary-total">
                                    <span>Tổng cộng</span>
                                    <strong>{formatMoney(order.totalAmount)}</strong>
                                </div>

                                <div className="order-detail-actions">

                                    {canPay && (
                                        <button type="button" className="order-detail-pay-button" onClick={handlePayment} disabled={paying}>{paying ? "ĐANG CHUYỂN ĐẾN VNPay..." : "THANH TOÁN VNPAY"}</button>
                                    )}

                                    {canCancel && (
                                        <button type="button" className="order-detail-cancel-button" onClick={handleCancel} disabled={cancelling || paying}>{cancelling ? "ĐANG HỦY..." : "HỦY ĐƠN HÀNG"}</button>
                                    )}

                                    <button type="button" className="order-detail-back-button" onClick={() => navigate("/customer/orders")} disabled={cancelling || paying}>QUAY LẠI ĐƠN HÀNG</button>

                                </div>

                            </section>

                        </aside>

                    </div>

                </div>
            </main>
        </div>
    );
}

export default OrderDetailPage;