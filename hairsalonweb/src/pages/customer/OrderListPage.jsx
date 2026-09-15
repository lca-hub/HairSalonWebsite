import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "./OrderListPage.css";

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
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
};

function OrderListPage() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(endpoints.myOrders, {
                params: {
                    page: 0,
                    size: 10,
                },
            });

            setOrders(response.data?.content || []);
        } catch (err) {
            console.error("LOAD ORDERS ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Không thể tải danh sách đơn hàng."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const formatMoney = (value) => {
        return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
    };

    const formatDate = (value) => {
        if (!value) {
            return "--";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleCancel = async (orderId) => {
        const confirmed = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(orderId);
            setError("");

            await authApis().post(endpoints.cancelOrder(orderId));

            await loadOrders();
        } catch (err) {
            console.error("CANCEL ORDER ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Không thể hủy đơn hàng."
            );
        } finally {
            setCancellingId(null);
        }
    };

    const getPaymentStatusClass = (status) => {
        return String(status || "").toLowerCase();
    };

    const getOrderStatusClass = (status) => {
        return String(status || "").toLowerCase();
    };

    if (loading) {
        return (
            <div className="order-list-page">
                <Header />

                <main className="order-list-main">
                    <div className="order-list-shell">
                        <div className="order-list-loading">
                            <div className="order-list-spinner"></div>
                            <p>Đang tải đơn hàng...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="order-list-page">
            <Header />

            <main className="order-list-main">
                <div className="order-list-shell">

                    <div className="order-list-breadcrumb">
                        <button type="button" onClick={() => navigate("/")}>Trang chủ</button>
                        <span>/</span>
                        <span>Đơn hàng</span>
                    </div>

                    <div className="order-list-header">
                        <div>
                            <span className="order-list-eyebrow">MY ORDERS</span>
                            <h1>Đơn hàng của tôi</h1>
                            <p>Theo dõi tình trạng và lịch sử mua hàng của bạn.</p>
                        </div>

                        <button type="button" className="order-shop-button" onClick={() => navigate("/products")}>TIẾP TỤC MUA SẮM</button>
                    </div>

                    {error && (
                        <div className="order-list-alert">{error}</div>
                    )}

                    {orders.length === 0 ? (
                        <section className="order-list-empty">
                            <div className="order-empty-icon">🛍</div>
                            <h2>Chưa có đơn hàng</h2>
                            <p>Bạn chưa có đơn hàng sản phẩm nào.</p>
                            <button type="button" onClick={() => navigate("/products")}>MUA SẮM NGAY</button>
                        </section>
                    ) : (
                        <section className="order-list-card">

                            <div className="order-list-table-heading">
                                <span>Đơn hàng</span>
                                <span>Ngày đặt</span>
                                <span>Thanh toán</span>
                                <span>Trạng thái</span>
                                <span>Tổng tiền</span>
                                <span></span>
                            </div>

                            {orders.map((order) => {
                                const paymentStatus = String(order.paymentStatus || "").toUpperCase();
                                const orderStatus = String(order.orderStatus || "").toUpperCase();
                                const canCancel = orderStatus === "PENDING";
                                const isCancelling = cancellingId === order.id;

                                return (
                                    <div className="order-list-row" key={order.id}>

                                        <div className="order-code">
                                            <strong>{order.orderCode || `ORD-${order.id}`}</strong>
                                            <span>{order.items?.length || 0} sản phẩm</span>
                                        </div>

                                        <div className="order-date">
                                            {formatDate(order.createdAt)}
                                        </div>

                                        <div className="order-payment-info">
                                            <strong className={`order-payment-status ${getPaymentStatusClass(paymentStatus)}`}>{paymentStatusLabels[paymentStatus] || paymentStatus}</strong>
                                            <span>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod || "--"}</span>
                                        </div>

                                        <div className={`order-status ${getOrderStatusClass(orderStatus)}`}>
                                            <span className="order-status-dot"></span>
                                            {orderStatusLabels[orderStatus] || orderStatus}
                                        </div>

                                        <div className="order-total">
                                            {formatMoney(order.totalAmount)}
                                        </div>

                                        <div className="order-actions">
                                            <button type="button" className="order-detail-button" onClick={() => navigate(`/customer/orders/${order.id}`)}>CHI TIẾT</button>

                                            {canCancel && (
                                                <button type="button" className="order-cancel-button" onClick={() => handleCancel(order.id)} disabled={isCancelling}>{isCancelling ? "ĐANG HỦY..." : "HỦY ĐƠN"}</button>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}

                        </section>
                    )}

                </div>
            </main>
        </div>
    );
}

export default OrderListPage;