import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { authApis, endpoints } from "../../configs/api/Apis";
import "../../styles/admin/AdminCommon.css";
import "./ReceptionistProductSale.css";

const PAYMENT_METHODS = [
    { value: "CASH", label: "Tiền mặt" },
    { value: "VNPAY", label: "VNPay" },
];

function normalizeContent(data) {
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.content) ? data.content : [];
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

function getErrorMessage(error, fallback = "Có lỗi xảy ra.") {
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

function getCustomerName(customer) {
    return customer?.fullname || `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Chưa có tên";
}

function getInitials(customer) {
    const name = getCustomerName(customer);
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return parts[0]?.[0]?.toUpperCase() || "K";
}

function ReceptionistProductSale() {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [items, setItems] = useState([]);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const [customerKeyword, setCustomerKeyword] = useState("");
    const [productKeyword, setProductKeyword] = useState("");
    const [customerPage, setCustomerPage] = useState(0);

    const [notice, setNotice] = useState({ type: "", message: "" });

    const selectedCustomer = useMemo(() => customers.find((customer) => String(customer.id) === String(selectedCustomerId)), [customers, selectedCustomerId]);

    const filteredProducts = useMemo(() => {
        const keyword = productKeyword.trim().toLowerCase();
        if (!keyword) return products;
        return products.filter((product) => {
            const name = String(product?.name || "").toLowerCase();
            const code = String(product?.productCode || "").toLowerCase();
            return name.includes(keyword) || code.includes(keyword);
        });
    }, [products, productKeyword]);

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0), [items]);
    const discount = Math.max(0, Number(discountAmount || 0));
    const total = Math.max(0, subtotal - discount);

    const loadCustomers = useCallback(async () => {
        try {
            setCustomersLoading(true);
            const params = { page: customerPage, size: 100 };
            if (customerKeyword.trim()) params.keyword = customerKeyword.trim();

            const response = await authApis().get(endpoints.adminCustomers, { params });
            const data = response.data || {};

            setCustomers(normalizeContent(data));
        } catch (error) {
            console.error("LOAD SALE CUSTOMERS ERROR:", error);
            setCustomers([]);
            setNotice({ type: "error", message: getErrorMessage(error, "Không thể tải danh sách khách hàng.") });
        } finally {
            setCustomersLoading(false);
        }
    }, [customerKeyword, customerPage]);

    const loadProducts = useCallback(async () => {
        try {
            setProductsLoading(true);

            const response = await authApis().get(endpoints.products, { params: { page: 0, size: 100 } });

            setProducts(normalizeContent(response.data).filter((product) => product?.isActive !== false));
        } catch (error) {
            console.error("LOAD SALE PRODUCTS ERROR:", error);
            setProducts([]);
            setNotice({ type: "error", message: getErrorMessage(error, "Không thể tải danh sách sản phẩm.") });
        } finally {
            setProductsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleCustomerSelect = (customerId) => {
        setSelectedCustomerId(customerId);
        setNotice({ type: "", message: "" });
    };

    const handleProductChange = (event) => {
        setProductId(event.target.value);
        setQuantity(1);
    };

    const addProduct = () => {
        const product = products.find((item) => String(item.id) === String(productId));

        if (!product) {
            setNotice({ type: "error", message: "Vui lòng chọn sản phẩm." });
            return;
        }

        const stock = Number(product.stockQuantity || 0);
        const requestedQuantity = Number(quantity || 0);
        const existingItem = items.find((item) => String(item.productId) === String(product.id));
        const nextQuantity = Number(existingItem?.quantity || 0) + requestedQuantity;

        if (stock <= 0) {
            setNotice({ type: "error", message: `Sản phẩm "${product.name}" đã hết hàng.` });
            return;
        }

        if (requestedQuantity <= 0) {
            setNotice({ type: "error", message: "Số lượng phải lớn hơn 0." });
            return;
        }

        if (nextQuantity > stock) {
            setNotice({ type: "error", message: `Sản phẩm "${product.name}" chỉ còn ${stock} sản phẩm.` });
            return;
        }

        if (existingItem) {
            setItems((current) => current.map((item) => String(item.productId) === String(product.id) ? { ...item, quantity: nextQuantity, totalPrice: Number(product.price || 0) * nextQuantity } : item));
        } else {
            setItems((current) => [...current, { productId: product.id, productName: product.name, imageUrl: product.imageUrl || "", quantity: requestedQuantity, unitPrice: Number(product.price || 0), totalPrice: Number(product.price || 0) * requestedQuantity, stockQuantity: stock }]);
        }

        setProductId("");
        setQuantity(1);
        setNotice({ type: "", message: "" });
    };

    const updateItemQuantity = (productIdValue, nextQuantity) => {
        const item = items.find((currentItem) => String(currentItem.productId) === String(productIdValue));
        if (!item) return;

        const quantityValue = Number(nextQuantity);

        if (quantityValue <= 0) {
            removeItem(productIdValue);
            return;
        }

        if (quantityValue > item.stockQuantity) {
            setNotice({ type: "error", message: `Sản phẩm "${item.productName}" chỉ còn ${item.stockQuantity} sản phẩm.` });
            return;
        }

        setItems((current) => current.map((currentItem) => String(currentItem.productId) === String(productIdValue) ? { ...currentItem, quantity: quantityValue, totalPrice: currentItem.unitPrice * quantityValue } : currentItem));
    };

    const removeItem = (productIdValue) => {
        setItems((current) => current.filter((item) => String(item.productId) !== String(productIdValue)));
    };

    const resetSale = () => {
        setSelectedCustomerId("");
        setProductId("");
        setQuantity(1);
        setItems([]);
        setDiscountAmount(0);
        setPaymentMethod("CASH");
        setCustomerKeyword("");
        setProductKeyword("");
        setNotice({ type: "", message: "" });
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            setNotice({ type: "error", message: "Vui lòng chọn khách hàng." });
            return;
        }

        if (items.length === 0) {
            setNotice({ type: "error", message: "Vui lòng thêm ít nhất một sản phẩm." });
            return;
        }

        if (discount > subtotal) {
            setNotice({ type: "error", message: "Giảm giá không được lớn hơn tạm tính." });
            return;
        }

        const confirmed = window.confirm(`Xác nhận tạo đơn cho ${getCustomerName(selectedCustomer)} với tổng tiền ${formatCurrency(total)}?`);

        if (!confirmed) return;

        try {
            setSaving(true);
            setNotice({ type: "", message: "" });

            const requestData = {
                customerId: selectedCustomer.id,
                paymentMethod,
                receiverName: getCustomerName(selectedCustomer),
                receiverPhone: selectedCustomer.phoneNumber || "",
                shippingAddress: "Mua tại salon",
                note: "Bán hàng trực tiếp tại salon",
                discountAmount: discount,
                items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
            };

            const response = await authApis().post(endpoints.adminProductSale, requestData);
            const invoice = response.data;

            if (paymentMethod === "VNPAY") {
                const orderId = invoice?.productOrderId;

                if (!orderId) {
                    throw new Error("Không nhận được mã đơn hàng để thanh toán VNPay.");
                }

                const paymentResponse = await authApis().post(endpoints.vnpayCreateOrder, null, { params: { orderId } });
                const paymentUrl = paymentResponse.data?.paymentUrl;

                if (!paymentUrl) {
                    throw new Error("Không nhận được đường dẫn thanh toán VNPay.");
                }

                window.location.href = paymentUrl;
                return;
            }

            setNotice({ type: "success", message: `Bán hàng thành công. Hóa đơn ${invoice?.invoiceCode || ""} đã được thanh toán.` });
            resetSale();
            await loadProducts();
        } catch (error) {
            console.error("CREATE RECEPTIONIST PRODUCT SALE ERROR:", error);
            setNotice({ type: "error", message: getErrorMessage(error, error?.message || "Không thể thực hiện bán hàng.") });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="receptionist-sale-page">
            <Header role="RECEPTIONIST" title="Bán hàng" />

            <main className="admin-main receptionist-sale-main">
                <div className="receptionist-sale-shell">
                    <section className="receptionist-sale-page-header">
                        <div>
                            <span className="receptionist-sale-eyebrow">POINT OF SALE</span>
                            <h1>Bán hàng</h1>
                            <p>Tạo đơn hàng và thanh toán sản phẩm trực tiếp tại salon.</p>
                        </div>
                    </section>

                    {notice.message && <div className={`receptionist-sale-notice ${notice.type}`}><span>{notice.message}</span><button type="button" onClick={() => setNotice({ type: "", message: "" })}>×</button></div>}

                    <div className="receptionist-sale-workspace">
                        <section className="receptionist-sale-left">
                            <div className="receptionist-sale-card receptionist-sale-customer-card">
                                <div className="receptionist-sale-card-header">
                                    <div><span className="receptionist-sale-eyebrow">01</span><h2>Khách hàng</h2></div>
                                    {selectedCustomer && <span className="receptionist-sale-selected-badge">Đã chọn</span>}
                                </div>

                                <div className="receptionist-sale-customer-search">
                                    <div className="receptionist-sale-search-icon">⌕</div>
                                    <input type="text" value={customerKeyword} onChange={(event) => { setCustomerKeyword(event.target.value); setCustomerPage(0); }} placeholder="Tìm theo tên, email hoặc số điện thoại..." />
                                </div>

                                <div className="receptionist-sale-customer-list">
                                    {customersLoading ? (
                                        <div className="receptionist-sale-loading">Đang tải khách hàng...</div>
                                    ) : customers.length === 0 ? (
                                        <div className="receptionist-sale-empty-small">Không tìm thấy khách hàng.</div>
                                    ) : (
                                        customers.map((customer) => (
                                            <button type="button" key={customer.id} className={`receptionist-sale-customer-item ${String(customer.id) === String(selectedCustomerId) ? "active" : ""}`} onClick={() => handleCustomerSelect(customer.id)}>
                                                {customer.avatar ? <img src={customer.avatar} alt="" /> : <div className="receptionist-sale-avatar-fallback">{getInitials(customer)}</div>}
                                                <span className="receptionist-sale-customer-info"><strong>{getCustomerName(customer)}</strong><small>{customer.phoneNumber || customer.email || "Không có thông tin liên hệ"}</small></span>
                                                {String(customer.id) === String(selectedCustomerId) && <span className="receptionist-sale-check">✓</span>}
                                            </button>
                                        ))
                                    )}
                                </div>

                                {selectedCustomer && (
                                    <div className="receptionist-sale-customer-selected">
                                        <div><span>Khách hàng</span><strong>{getCustomerName(selectedCustomer)}</strong></div>
                                        <div><span>Điện thoại</span><strong>{selectedCustomer.phoneNumber || "—"}</strong></div>
                                        <div><span>Email</span><strong>{selectedCustomer.email || "—"}</strong></div>
                                    </div>
                                )}
                            </div>

                            <div className="receptionist-sale-card receptionist-sale-product-card">
                                <div className="receptionist-sale-card-header">
                                    <div><span className="receptionist-sale-eyebrow">02</span><h2>Chọn sản phẩm</h2></div>
                                    <span className="receptionist-sale-muted">{filteredProducts.length} sản phẩm</span>
                                </div>

                                <div className="receptionist-sale-product-toolbar">
                                    <div className="receptionist-sale-search-box"><span>⌕</span><input type="text" value={productKeyword} onChange={(event) => setProductKeyword(event.target.value)} placeholder="Tìm tên hoặc mã sản phẩm..." /></div>
                                    <select value={productId} onChange={handleProductChange} disabled={productsLoading}><option value="">{productsLoading ? "Đang tải..." : "Chọn sản phẩm"}</option>{filteredProducts.map((product) => <option key={product.id} value={product.id} disabled={Number(product.stockQuantity || 0) <= 0}>{product.name} — {formatCurrency(product.price)}</option>)}</select>
                                    <div className="receptionist-sale-quantity-input"><label>SL</label><input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))} /></div>
                                    <button type="button" className="receptionist-sale-add-btn" onClick={addProduct}>+ Thêm</button>
                                </div>

                                <div className="receptionist-sale-product-grid">
                                    {productsLoading ? (
                                        <div className="receptionist-sale-loading">Đang tải sản phẩm...</div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="receptionist-sale-empty-small">Không tìm thấy sản phẩm.</div>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <button type="button" key={product.id} className={`receptionist-sale-product-tile ${Number(product.stockQuantity || 0) <= 0 ? "disabled" : ""}`} onClick={() => { if (Number(product.stockQuantity || 0) > 0) { setProductId(String(product.id)); setQuantity(1); } }}>
                                                {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <div className="receptionist-sale-product-image-fallback">PRODUCT</div>}
                                                <span className="receptionist-sale-product-tile-name">{product.name}</span>
                                                <span className="receptionist-sale-product-tile-price">{formatCurrency(product.price)}</span>
                                                <span className={`receptionist-sale-stock ${Number(product.stockQuantity || 0) <= 0 ? "out" : Number(product.stockQuantity || 0) <= 5 ? "low" : ""}`}>Kho {product.stockQuantity ?? 0}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="receptionist-sale-card receptionist-sale-order-card">
                                <div className="receptionist-sale-card-header">
                                    <div><span className="receptionist-sale-eyebrow">03</span><h2>Đơn hàng</h2></div>
                                    <span className="receptionist-sale-muted">{items.length} mặt hàng</span>
                                </div>

                                {items.length === 0 ? (
                                    <div className="receptionist-sale-empty-order"><span className="receptionist-sale-empty-order-icon">🛒</span><strong>Chưa có sản phẩm trong đơn</strong><small>Chọn sản phẩm phía trên để bắt đầu tạo đơn.</small></div>
                                ) : (
                                    <div className="receptionist-sale-order-list">
                                        {items.map((item, index) => (
                                            <div className="receptionist-sale-order-item" key={item.productId}>
                                                <div className="receptionist-sale-order-number">{String(index + 1).padStart(2, "0")}</div>
                                                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="receptionist-sale-order-image-fallback">P</div>}
                                                <div className="receptionist-sale-order-name"><strong>{item.productName}</strong><small>{formatCurrency(item.unitPrice)} / sản phẩm</small></div>
                                                <div className="receptionist-sale-order-qty"><button type="button" onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}>−</button><input type="number" min="1" max={item.stockQuantity} value={item.quantity} onChange={(event) => updateItemQuantity(item.productId, event.target.value)} /><button type="button" onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}>+</button></div>
                                                <strong className="receptionist-sale-order-price">{formatCurrency(item.totalPrice)}</strong>
                                                <button type="button" className="receptionist-sale-order-remove" onClick={() => removeItem(item.productId)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <aside className="receptionist-sale-right">
                            <div className="receptionist-sale-summary-card">
                                <div className="receptionist-sale-summary-top"><div><span className="receptionist-sale-eyebrow">PAYMENT</span><h2>Thanh toán</h2></div><div className="receptionist-sale-receipt-mark">SALE</div></div>

                                <div className="receptionist-sale-summary-customer">
                                    <div className="receptionist-sale-mini-avatar">{selectedCustomer ? getInitials(selectedCustomer) : "?"}</div>
                                    <div><span>Khách hàng</span><strong>{selectedCustomer ? getCustomerName(selectedCustomer) : "Chưa chọn khách hàng"}</strong></div>
                                </div>

                                <div className="receptionist-sale-summary-lines">
                                    <div><span>Tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
                                    <div><span>Giảm giá</span><strong>{discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}</strong></div>
                                </div>

                                <div className="receptionist-sale-summary-total"><span>Tổng thanh toán</span><strong>{formatCurrency(total)}</strong></div>

                                <div className="receptionist-sale-payment-title"><span>Phương thức thanh toán</span></div>

                                <div className="receptionist-sale-payment-options">
                                    {PAYMENT_METHODS.map((method) => (
                                        <button type="button" key={method.value} className={`receptionist-sale-payment-method ${paymentMethod === method.value ? "active" : ""}`} onClick={() => setPaymentMethod(method.value)}>
                                            <span className="receptionist-sale-radio">{paymentMethod === method.value ? "✓" : ""}</span>
                                            <span><strong>{method.label}</strong>{method.value === "CASH" ? <small>Thanh toán tại quầy</small> : <small>Thanh toán trực tuyến</small>}</span>
                                        </button>
                                    ))}
                                </div>

                                <label className="receptionist-sale-discount"><span>Giảm giá</span><div><input type="number" min="0" max={subtotal} step="1000" value={discountAmount} onChange={(event) => setDiscountAmount(Math.max(0, Number(event.target.value || 0)))} /><span>₫</span></div></label>

                                <button type="button" className="receptionist-sale-pay-btn" onClick={handleSubmit} disabled={saving || !selectedCustomer || items.length === 0}>{saving ? "ĐANG XỬ LÝ..." : paymentMethod === "VNPAY" ? "THANH TOÁN QUA VNPAY" : "HOÀN TẤT THANH TOÁN"}</button>

                                <button type="button" className="receptionist-sale-clear-btn" onClick={resetSale} disabled={saving}>XÓA ĐƠN & TẠO LẠI</button>
                            </div>

                            <div className="receptionist-sale-hint-card"><span>Gợi ý</span><p>Kiểm tra khách hàng, số lượng và tồn kho trước khi hoàn tất thanh toán.</p></div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ReceptionistProductSale;