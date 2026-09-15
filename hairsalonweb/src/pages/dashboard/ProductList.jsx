import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "./ProductList.css";

function ProductList() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addingId, setAddingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(endpoints.products, {
                params: {
                    page: 0,
                    size: 50,
                    isActive: true,
                },
            });

            setProducts(response.data?.content || []);
        } catch (err) {
            console.error("LOAD PRODUCTS ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Không thể tải danh sách sản phẩm."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const formatMoney = (value) => {
        return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
    };

    const handleAddToCart = async (product) => {
        try {
            setAddingId(product.id);
            setError("");
            setSuccessMessage("");

            await authApis().post(endpoints.cartItems, {
                productId: product.id,
                quantity: 1,
            });

            setSuccessMessage(`Đã thêm "${product.name}" vào giỏ hàng.`);

            setTimeout(() => {
                setSuccessMessage("");
            }, 2500);
        } catch (err) {
            console.error("ADD TO CART ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Không thể thêm sản phẩm vào giỏ hàng."
            );
        } finally {
            setAddingId(null);
        }
    };

    if (loading) {
        return (
            <div className="product-list-page">
                <Header />

                <main className="product-list-main">
                    <div className="product-list-shell">
                        <div className="product-list-loading">
                            <div className="product-list-spinner"></div>
                            <p>Đang tải sản phẩm...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="product-list-page">
            <Header />

            <main className="product-list-main">
                <div className="product-list-shell">

                    <div className="product-list-breadcrumb">
                        <button type="button" onClick={() => navigate("/")}>Trang chủ</button>
                        <span>/</span>
                        <span>Sản phẩm</span>
                    </div>

                    <div className="product-list-header">
                        <div>
                            <span className="product-list-eyebrow">HAIR CARE SHOP</span>
                            <h1>Sản phẩm</h1>
                            <p>Các sản phẩm chăm sóc và tạo kiểu tóc dành cho bạn.</p>
                        </div>

                        <button type="button" className="product-cart-button" onClick={() => navigate("/customer/cart")}>GIỎ HÀNG</button>
                    </div>

                    {error && (
                        <div className="product-list-alert">{error}</div>
                    )}

                    {successMessage && (
                        <div className="product-list-success">{successMessage}</div>
                    )}

                    {products.length === 0 ? (
                        <section className="product-list-empty">
                            <h2>Chưa có sản phẩm</h2>
                            <p>Hiện tại salon chưa có sản phẩm nào đang được bán.</p>
                        </section>
                    ) : (
                        <div className="product-grid">
                            {products.map((product) => {
                                const isAdding = addingId === product.id;
                                const stock = Number(product.stockQuantity || 0);
                                const isOutOfStock = stock <= 0;
                                const imageUrl = product.imageUrl || "/images/product-default.jpg";

                                return (
                                    <article className="product-card" key={product.id}>

                                        <div className="product-image-wrap">
                                            <img src={imageUrl} alt={product.name} className="product-image" />

                                            {isOutOfStock && (
                                                <span className="product-stock-badge">HẾT HÀNG</span>
                                            )}
                                        </div>

                                        <div className="product-card-content">
                                            <span className="product-code">{product.productCode || `SP${product.id}`}</span>

                                            <h2>{product.name}</h2>

                                            <div className="product-card-bottom">
                                                <strong>{formatMoney(product.price)}</strong>

                                                <span className={isOutOfStock ? "product-stock out" : "product-stock"}>
                                                    {isOutOfStock ? "Hết hàng" : `Còn ${stock} sản phẩm`}
                                                </span>
                                            </div>

                                            <button type="button" className="product-add-button" onClick={() => handleAddToCart(product)} disabled={isAdding || isOutOfStock}>{isAdding ? "ĐANG THÊM..." : isOutOfStock ? "HẾT HÀNG" : "THÊM VÀO GIỎ"}</button>
                                        </div>

                                    </article>
                                );
                            })}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

export default ProductList;