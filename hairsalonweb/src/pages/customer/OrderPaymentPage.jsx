import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "./OrderPaymentPage.css";

function OrderPaymentPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        items: [],
        totalAmount: 0,
    });

    const [form, setForm] = useState({
        receiverName: "",
        receiverPhone: "",
        shippingAddress: "",
        note: "",
        paymentMethod: "VNPAY",
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const loadCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(endpoints.cart);

            const data = response.data || {
                items: [],
                totalAmount: 0,
            };

            if (!data.items?.length) {
                navigate("/customer/cart", { replace: true });
                return;
            }

            setCart(data);
        } catch (err) {
            console.error("LOAD PAYMENT CART ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Không thể tải thông tin giỏ hàng."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const formatMoney = (value) => {
        return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.receiverName.trim()) {
            setError("Vui lòng nhập họ tên người nhận.");
            return;
        }

        if (!form.receiverPhone.trim()) {
            setError("Vui lòng nhập số điện thoại.");
            return;
        }

        if (!form.shippingAddress.trim()) {
            setError("Vui lòng nhập địa chỉ nhận hàng.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const orderResponse = await authApis().post(
                endpoints.orders,
                {
                    receiverName: form.receiverName.trim(),
                    receiverPhone: form.receiverPhone.trim(),
                    shippingAddress: form.shippingAddress.trim(),
                    note: form.note.trim(),
                    paymentMethod: form.paymentMethod,
                }
            );

            const order = orderResponse.data;

            if (!order?.id) {
                throw new Error("Không nhận được mã đơn hàng.");
            }

            if (form.paymentMethod === "VNPAY") {
                const paymentResponse = await authApis().post(
                    endpoints.vnpayCreateOrder,
                    null,
                    {
                        params: {
                            orderId: Number(order.id),
                        },
                    }
                );

                if (!paymentResponse.data?.paymentUrl) {
                    throw new Error("Không nhận được đường dẫn thanh toán VNPay.");
                }

                window.location.href = paymentResponse.data.paymentUrl;
                return;
            }

            navigate(`/customer/orders/${order.id}`);
        } catch (err) {
            console.error("CREATE PRODUCT ORDER ERROR:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Không thể tạo đơn hàng."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="order-payment-page">
                <Header />

                <main className="order-payment-main">
                    <div className="order-payment-shell">
                        <div className="order-payment-loading">
                            <div className="order-payment-spinner"></div>
                            <p>Đang tải thông tin đơn hàng...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const items = cart.items || [];
    const totalAmount = Number(cart.totalAmount || 0);

    return (
        <div className="order-payment-page">
            <Header />

            <main className="order-payment-main">
                <div className="order-payment-shell">

                    <div className="order-payment-breadcrumb">
                        <button type="button" onClick={() => navigate("/products")}>Sản phẩm</button>
                        <span>/</span>
                        <button type="button" onClick={() => navigate("/customer/cart")}>Giỏ hàng</button>
                        <span>/</span>
                        <span>Thanh toán</span>
                    </div>

                    <div className="order-payment-header">
                        <div>
                            <span className="order-payment-eyebrow">ORDER & PAYMENT</span>
                            <h1>Thanh toán đơn hàng</h1>
                            <p>Kiểm tra thông tin nhận hàng trước khi tiến hành thanh toán.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="order-payment-alert">{error}</div>
                    )}

                    <form className="order-payment-layout" onSubmit={handleSubmit}>

                        <section className="order-payment-form-card">

                            <div className="order-payment-section">
                                <div className="order-payment-section-title">
                                    <span>01</span>
                                    <div>
                                        <h2>Thông tin nhận hàng</h2>
                                        <p>Thông tin dùng để giao sản phẩm cho bạn.</p>
                                    </div>
                                </div>

                                <div className="order-payment-fields">

                                    <label>
                                        Họ và tên
                                        <input type="text" name="receiverName" value={form.receiverName} onChange={handleChange} placeholder="Nhập họ và tên" disabled={submitting} />
                                    </label>

                                    <label>
                                        Số điện thoại
                                        <input type="tel" name="receiverPhone" value={form.receiverPhone} onChange={handleChange} placeholder="Nhập số điện thoại" disabled={submitting} />
                                    </label>

                                    <label className="order-payment-field-full">
                                        Địa chỉ nhận hàng
                                        <input type="text" name="shippingAddress" value={form.shippingAddress} onChange={handleChange} placeholder="Nhập địa chỉ nhận hàng" disabled={submitting} />
                                    </label>

                                    <label className="order-payment-field-full">
                                        Ghi chú
                                        <textarea name="note" value={form.note} onChange={handleChange} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" rows="4" disabled={submitting}></textarea>
                                    </label>

                                </div>
                            </div>

                            <div className="order-payment-section">

                                <div className="order-payment-section-title">
                                    <span>02</span>
                                    <div>
                                        <h2>Phương thức thanh toán</h2>
                                        <p>Chọn phương thức thanh toán cho đơn hàng.</p>
                                    </div>
                                </div>

                                <div className="payment-method-list">

                                    <label className={`payment-method ${form.paymentMethod === "VNPAY" ? "selected" : ""}`}>
                                        <input type="radio" name="paymentMethod" value="VNPAY" checked={form.paymentMethod === "VNPAY"} onChange={handleChange} disabled={submitting} />
                                        <div>
                                            <strong>VNPay</strong>
                                            <span>Thanh toán trực tuyến qua VNPay.</span>
                                        </div>
                                    </label>

                                    <label className={`payment-method ${form.paymentMethod === "CASH" ? "selected" : ""}`}>
                                        <input type="radio" name="paymentMethod" value="CASH" checked={form.paymentMethod === "CASH"} onChange={handleChange} disabled={submitting} />
                                        <div>
                                            <strong>Thanh toán tại salon</strong>
                                            <span>Thanh toán trực tiếp theo chính sách đơn hàng.</span>
                                        </div>
                                    </label>

                                </div>
                            </div>

                        </section>

                        <aside className="order-payment-summary">

                            <span className="order-payment-summary-eyebrow">YOUR ORDER</span>
                            <h2>Đơn hàng</h2>

                            <div className="order-payment-items">
                                {items.map((item) => (
                                    <div className="order-payment-item" key={item.id}>
                                        <div className="order-payment-item-image">
                                            {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>NO IMAGE</span>}
                                        </div>

                                        <div className="order-payment-item-info">
                                            <strong>{item.productName}</strong>
                                            <span>{item.quantity} × {formatMoney(item.unitPrice)}</span>
                                        </div>

                                        <strong className="order-payment-item-total">{formatMoney(item.totalPrice)}</strong>
                                    </div>
                                ))}
                            </div>

                            <div className="order-payment-summary-line">
                                <span>Tạm tính</span>
                                <strong>{formatMoney(totalAmount)}</strong>
                            </div>

                            <div className="order-payment-summary-line">
                                <span>Phí giao hàng</span>
                                <strong>0đ</strong>
                            </div>

                            <div className="order-payment-summary-divider"></div>

                            <div className="order-payment-total">
                                <span>Tổng cộng</span>
                                <strong>{formatMoney(totalAmount)}</strong>
                            </div>

                            <button type="submit" className="order-payment-submit" disabled={submitting}>{submitting ? "ĐANG XỬ LÝ..." : form.paymentMethod === "VNPAY" ? "TIẾN HÀNH THANH TOÁN VNPAY" : "ĐẶT ĐƠN HÀNG"}</button>

                            <button type="button" className="order-payment-back" onClick={() => navigate("/customer/cart")} disabled={submitting}>QUAY LẠI GIỎ HÀNG</button>

                        </aside>

                    </form>

                </div>
            </main>
        </div>
    );
}

export default OrderPaymentPage;