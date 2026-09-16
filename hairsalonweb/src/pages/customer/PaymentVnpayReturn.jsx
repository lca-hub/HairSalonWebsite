import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import "./PaymentVnpayReturn.css";

export default function PaymentVnpayReturn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [retrying, setRetrying] = useState(false);
    const [error, setError] = useState("");

    const status = searchParams.get("status");
    const responseCode = searchParams.get("vnp_ResponseCode");
    const transactionStatus = searchParams.get("vnp_TransactionStatus");
    const txnRef = searchParams.get("txnRef") || searchParams.get("vnp_TxnRef");
    const appointmentId = searchParams.get("appointmentId");
    const productOrderId = searchParams.get("productOrderId");

    const success =
        status === "success" ||
        (responseCode === "00" && transactionStatus === "00");

    const isProductOrder = !!productOrderId;

    const handleRetryPayment = async () => {
        if (appointmentId) {
            try {
                setRetrying(true);
                setError("");

                const response = await authApis().post(
                    endpoints.vnpayCreate,
                    null,
                    {
                        params: {
                            appointmentId: Number(appointmentId),
                        },
                    }
                );

                if (!response.data?.paymentUrl) {
                    throw new Error("Không nhận được đường dẫn thanh toán VNPay.");
                }

                window.location.href = response.data.paymentUrl;
            } catch (err) {
                console.error("RETRY APPOINTMENT VNPAY ERROR:", err);

                setError(
                    err.response?.data?.message ||
                    "Không thể thanh toán lại cho lịch hẹn này."
                );
            } finally {
                setRetrying(false);
            }

            return;
        }

        if (productOrderId) {
            try {
                setRetrying(true);
                setError("");

                const response = await authApis().post(
                    endpoints.vnpayCreateOrder,
                    null,
                    {
                        params: {
                            orderId: Number(productOrderId),
                        },
                    }
                );

                if (!response.data?.paymentUrl) {
                    throw new Error("Không nhận được đường dẫn thanh toán VNPay.");
                }

                window.location.href = response.data.paymentUrl;
            } catch (err) {
                console.error("RETRY PRODUCT ORDER VNPAY ERROR:", err);

                setError(
                    err.response?.data?.message ||
                    "Không thể thanh toán lại cho đơn hàng này."
                );
            } finally {
                setRetrying(false);
            }

            return;
        }

        setError("Không tìm thấy đối tượng cần thanh toán.");
    };

    const handleBack = () => {
        if (productOrderId) {
            navigate(`/customer/orders/${productOrderId}`);
            return;
        }

        navigate("/customer/appointments");
    };

    return (
        <div className="payment-result-page">
            <div className="payment-result-card">
                <div className={`payment-result-icon ${success ? "success" : "failed"}`}>
                    {success ? "✓" : "×"}
                </div>

                <p className="payment-result-label">
                    VNPAY PAYMENT
                </p>

                <h1>
                    {success
                        ? "Thanh toán thành công"
                        : "Thanh toán thất bại"}
                </h1>

                <p className="payment-result-message">
                    {success
                        ? isProductOrder
                            ? "Đơn hàng của bạn đã được thanh toán thành công."
                            : "Lịch hẹn của bạn đã được thanh toán và xác nhận."
                        : isProductOrder
                            ? "Giao dịch chưa hoàn tất. Đơn hàng vẫn đang chờ thanh toán."
                            : "Giao dịch chưa hoàn tất. Lịch hẹn vẫn đang chờ thanh toán."}
                </p>

                {txnRef && (
                    <p className="payment-result-transaction">
                        Mã giao dịch: <strong>{txnRef}</strong>
                    </p>
                )}

                {error && (
                    <div className="payment-result-error">
                        {error}
                    </div>
                )}

                {success ? (
                    <button
                        type="button"
                        className="payment-result-button"
                        onClick={handleBack}
                    >
                        {isProductOrder
                            ? "XEM ĐƠN HÀNG"
                            : "XEM LỊCH HẸN"}
                    </button>
                ) : (
                    <div className="payment-result-actions">
                        <button
                            type="button"
                            className="payment-result-button"
                            onClick={handleRetryPayment}
                            disabled={retrying || (!appointmentId && !productOrderId)}
                        >
                            {retrying
                                ? "ĐANG CHUYỂN ĐẾN THANH TOÁN..."
                                : "THANH TOÁN LẠI"}
                        </button>

                        <button
                            type="button"
                            className="payment-result-secondary-button"
                            onClick={handleBack}
                        >
                            {isProductOrder
                                ? "VỀ ĐƠN HÀNG"
                                : "VỀ TRANG KHÁCH HÀNG"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}