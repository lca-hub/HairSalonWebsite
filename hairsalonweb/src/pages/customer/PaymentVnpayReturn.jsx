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

    const success =
        status === "success" ||
        (responseCode === "00" && transactionStatus === "00");

    const handleRetryPayment = async () => {
        if (!appointmentId) {
            setError("Không tìm thấy lịch hẹn để thanh toán lại.");
            return;
        }

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
            console.error("RETRY VNPAY PAYMENT ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Không thể thanh toán lại cho lịch hẹn này."
            );
        } finally {
            setRetrying(false);
        }
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
                        ? "Lịch hẹn của bạn đã được thanh toán và xác nhận."
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
                        onClick={() => navigate("/customer")}
                    >
                        VỀ TRANG KHÁCH HÀNG
                    </button>
                ) : (
                    <div className="payment-result-actions">
                        <button
                            type="button"
                            className="payment-result-button"
                            onClick={handleRetryPayment}
                            disabled={retrying || !appointmentId}
                        >
                            {retrying
                                ? "ĐANG CHUYỂN ĐẾN THANH TOÁN..."
                                : "THANH TOÁN LẠI"}
                        </button>

                        <button
                            type="button"
                            className="payment-result-secondary-button"
                            onClick={() => navigate("/customer")}
                        >
                            VỀ TRANG KHÁCH HÀNG
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}