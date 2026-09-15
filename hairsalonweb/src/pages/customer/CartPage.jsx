import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "./CartPage.css";

function CartPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        items: [],
        totalAmount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [removingId, setRemovingId] = useState(null);
    const [clearing, setClearing] = useState(false);
    const [error, setError] = useState("");

    const loadCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(endpoints.cart);

            setCart(response.data || {
                items: [],
                totalAmount: 0,
            });
        } catch (err) {
            console.error("LOAD CART ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Không thể tải giỏ hàng."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const formatMoney = (value) => {
        return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
    };

    const updateQuantity = async (item, quantity) => {
        if (quantity < 1) {
            return;
        }

        try {
            setUpdatingId(item.productId);
            setError("");

            const response = await authApis().put(
                endpoints.cartItem(item.productId),
                {
                    productId: item.productId,
                    quantity,
                }
            );

            setCart(response.data);
        } catch (err) {
            console.error("UPDATE CART ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Không thể cập nhật số lượng."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const removeItem = async (productId) => {
        try {
            setRemovingId(productId);
            setError("");

            await authApis().delete(endpoints.cartItem(productId));

            await loadCart();
        } catch (err) {
            console.error("REMOVE CART ITEM ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Không thể xóa sản phẩm khỏi giỏ hàng."
            );
        } finally {
            setRemovingId(null);
        }
    };

    const clearCart = async () => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");

        if (!confirmed) {
            return;
        }

        try {
            setClearing(true);
            setError("");

            await authApis().delete(endpoints.cart);

            setCart({
                items: [],
                totalAmount: 0,
            });
        } catch (err) {
            console.error("CLEAR CART ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Không thể xóa giỏ hàng."
            );
        } finally {
            setClearing(false);
        }
    };

    const handlePayment = () => {
        if (!cart.items?.length) {
            return;
        }

        navigate("/customer/order-payment");
    };

    if (loading) {
        return (
            <div className="cart-page">
                <Header />
                <main className="cart-main">
                    <div className="cart-shell">
                        <div className="cart-loading">
                            <div className="cart-spinner"></div>
                            <p>Đang tải giỏ hàng...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const items = cart.items || [];
    const totalAmount = Number(cart.totalAmount || 0);

    return (
        <div className="cart-page">
            <Header />

            <main className="cart-main">
                <div className="cart-shell">

                    <div className="cart-breadcrumb">
                        <button type="button" onClick={() => navigate("/")}>Trang chủ</button>
                        <span>/</span>
                        <span>Giỏ hàng</span>
                    </div>

                    <div className="cart-header">
                        <div>
                            <span className="cart-eyebrow">SHOPPING BAG</span>
                            <h1>Giỏ hàng</h1>
                            <p>Kiểm tra sản phẩm trước khi tiến hành thanh toán.</p>
                        </div>

                        {items.length > 0 && (
                            <button type="button" className="cart-clear-button" onClick={clearCart} disabled={clearing}>{clearing ? "ĐANG XÓA..." : "XÓA GIỎ HÀNG"}</button>
                        )}
                    </div>

                    {error && (
                        <div className="cart-alert">{error}</div>
                    )}

                    {items.length === 0 ? (
                        <section className="cart-empty">
                            <div className="cart-empty-icon">🛒</div>
                            <h2>Giỏ hàng đang trống</h2>
                            <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                            <button type="button" onClick={() => navigate("/products")}>TIẾP TỤC MUA SẮM</button>
                        </section>
                    ) : (
                        <div className="cart-layout">

                            <section className="cart-items-card">

                                <div className="cart-items-heading">
                                    <span>Sản phẩm</span>
                                    <span>Đơn giá</span>
                                    <span>Số lượng</span>
                                    <span>Thành tiền</span>
                                    <span></span>
                                </div>

                                {items.map((item) => {
                                    const isUpdating = updatingId === item.productId;
                                    const isRemoving = removingId === item.productId;

                                    return (
                                        <div className="cart-item" key={item.id}>

                                            <div className="cart-product">
                                                <div className="cart-product-image">
                                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>NO IMAGE</span>}
                                                </div>

                                                <div className="cart-product-info">
                                                    <strong>{item.productName}</strong>
                                                    <small>Mã SP: {item.productId}</small>
                                                </div>
                                            </div>

                                            <div className="cart-price">{formatMoney(item.unitPrice)}</div>

                                            <div className="cart-quantity">
                                                <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} disabled={isUpdating || isRemoving || item.quantity <= 1}>−</button>
                                                <span>{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} disabled={isUpdating || isRemoving}>+</button>
                                            </div>

                                            <div className="cart-item-total">{formatMoney(item.totalPrice)}</div>

                                            <button type="button" className="cart-remove" onClick={() => removeItem(item.productId)} disabled={isRemoving || isUpdating}>{isRemoving ? "..." : "×"}</button>

                                        </div>
                                    );
                                })}

                            </section>

                            <aside className="cart-summary">

                                <span className="cart-summary-eyebrow">ORDER SUMMARY</span>

                                <h2>Tổng đơn hàng</h2>

                                <div className="cart-summary-line">
                                    <span>Tạm tính</span>
                                    <strong>{formatMoney(totalAmount)}</strong>
                                </div>

                                <div className="cart-summary-line">
                                    <span>Phí giao hàng</span>
                                    <strong>0đ</strong>
                                </div>

                                <div className="cart-summary-divider"></div>

                                <div className="cart-summary-total">
                                    <span>Tổng cộng</span>
                                    <strong>{formatMoney(totalAmount)}</strong>
                                </div>

                                <button type="button" className="cart-payment-button" onClick={handlePayment}>TIẾN HÀNH THANH TOÁN</button>

                                <button type="button" className="cart-shopping-button" onClick={() => navigate("/products")}>TIẾP TỤC MUA SẮM</button>

                            </aside>

                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

export default CartPage;