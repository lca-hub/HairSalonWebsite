import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import "./AppointmentDetail.css";

function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);


  useEffect(() => {
    const loadAppointment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authApis().get(
          endpoints.myAppointmentDetail(id),
        );

        console.log("APPOINTMENT DETAIL:", response.data);

        setAppointment(response.data);
      } catch (err) {
        console.error("LOAD APPOINTMENT DETAIL ERROR:", err);

        setError(
          err.response?.data?.message ||
          "Không thể tải thông tin lịch hẹn.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [id]);

  useEffect(() => {
    if (!appointment) {
      return;
    }

    const status = String(
      appointment.status || "",
    )
      .trim()
      .toUpperCase();

    if (
      status !== "PENDING_PAYMENT" ||
      !appointment.paymentDeadline
    ) {
      setRemainingSeconds(null);
      return;
    }

    const calculateRemaining = () => {
      const deadline = new Date(
        appointment.paymentDeadline,
      ).getTime();

      const now = Date.now();

      const seconds = Math.max(
        0,
        Math.floor((deadline - now) / 1000),
      );

      setRemainingSeconds(seconds);
    };

    calculateRemaining();

    const timer = setInterval(
      calculateRemaining,
      1000,
    );

    return () => clearInterval(timer);
  }, [appointment]);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn hủy lịch hẹn này?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      await authApis().post(
        endpoints.cancelAppointment(id),
      );

      const response = await authApis().get(
        endpoints.myAppointmentDetail(id),
      );

      setAppointment(response.data);
    } catch (err) {
      console.error(
        "CANCEL APPOINTMENT ERROR:",
        err,
      );

      setError(
        err.response?.data?.message ||
        "Không thể hủy lịch hẹn.",
      );
    } finally {
      setCancelling(false);
    }
  };


  const handleRetryPayment = async () => {
    if (!appointment) {
      return;
    }

    const status = String(
      appointment.status || "",
    )
      .trim()
      .toUpperCase();

    if (status !== "PENDING_PAYMENT") {
      setError(
        "Lịch hẹn này không còn ở trạng thái chờ thanh toán.",
      );
      return;
    }

    if (
      remainingSeconds === null ||
      remainingSeconds <= 0
    ) {
      setError(
        "Thời gian thanh toán đã hết. Vui lòng đặt lại lịch hẹn để tiếp tục.",
      );
      return;
    }

    try {
      setPaying(true);
      setError("");

      const response = await authApis().post(
        endpoints.vnpayCreate,
        null,
        {
          params: {
            appointmentId: Number(id),
          },
        },
      );

      if (!response.data?.paymentUrl) {
        throw new Error(
          "Không nhận được đường dẫn thanh toán VNPay.",
        );
      }

      window.location.href =
        response.data.paymentUrl;
    } catch (err) {
      console.error(
        "RETRY PAYMENT ERROR:",
        err,
      );

      setError(
        err.response?.data?.message ||
        "Không thể mở thanh toán VNPay.",
      );
    } finally {
      setPaying(false);
    }
  };


  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "vi-VN",
      {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  };


  const formatMoney = (value) => {
    return (
      Number(value || 0).toLocaleString(
        "vi-VN",
      ) + "đ"
    );
  };


  const formatCountdown = (seconds) => {
    if (
      seconds === null ||
      seconds < 0
    ) {
      return "--:--";
    }

    const minutes = Math.floor(
      seconds / 60,
    );

    const remaining = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0",
    )}:${String(remaining).padStart(2, "0")}`;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Chờ xử lý",
          className: "pending",
        };

      case "PENDING_PAYMENT":
        return {
          label: "Chờ thanh toán",
          className: "pending-payment",
        };

      case "CONFIRMED":
        return {
          label: "Đã thanh toán",
          className: "confirmed",
        };

      case "IN_SERVICE":
        return {
          label: "Đang phục vụ",
          className: "in-service",
        };

      case "COMPLETED":
        return {
          label: "Đã hoàn thành",
          className: "completed",
        };

      case "CANCELLED":
        return {
          label: "Đã hủy",
          className: "cancelled",
        };

      case "NO_SHOW":
        return {
          label: "Không đến",
          className: "no-show",
        };

      case "EXPIRED":
        return {
          label: "Đã hết hạn",
          className: "expired",
        };

      default:
        return {
          label: status || "Không xác định",
          className: "pending",
        };
    }
  };

  if (loading) {
    return (
      <div className="appointment-detail-page">
        <div className="appointment-detail-container">
          <div className="appointment-loading">
            <div className="loading-spinner"></div>

            <p>
              Đang tải thông tin lịch hẹn...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="appointment-detail-page">
        <div className="appointment-detail-container">
          <div className="appointment-error">
            <div className="error-icon">
              !
            </div>

            <h2>
              Không thể tải lịch hẹn
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="back-button"
              onClick={() =>
                navigate(
                  "/customer/appointments",
                )
              }
            >
              ← Quay lại lịch hẹn
            </button>
          </div>
        </div>
      </div>
    );
  }


  const normalizedStatus = String(
    appointment?.status || "",
  )
    .trim()
    .toUpperCase();

  const status =
    getStatusInfo(normalizedStatus);

  const stylistName =
    appointment?.stylistName ||
    `${appointment?.stylist?.firstName || ""} ${appointment?.stylist?.lastName || ""
      }`.trim() ||
    "Stylist";

  const serviceName =
    appointment?.serviceName ||
    appointment?.service?.name ||
    "Dịch vụ làm tóc";

  const servicePrice = Number(
    appointment?.bookingAmount ??
    appointment?.service?.price ??
    appointment?.servicePrice ??
    0,
  );

  const totalAmount = Number(
    appointment?.bookingAmount ??
    appointment?.totalAmount ??
    servicePrice ??
    0,
  );

  const isCancelled = [
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
    "EXPIRED",
  ].includes(normalizedStatus);

  const canRetryPayment =
    normalizedStatus ===
    "PENDING_PAYMENT" &&
    remainingSeconds !== null &&
    remainingSeconds > 0;


  return (
    <div className="appointment-detail-page">
      <div className="appointment-detail-container">


        <button
          type="button"
          className="appointment-back"
          onClick={() =>
            navigate(
              "/customer/appointments",
            )
          }
        >
          <span>←</span>

          <span>
            Lịch hẹn của tôi
          </span>
        </button>


        <div className="appointment-page-header">
          <div className="header-left">
            <span className="appointment-eyebrow">
              APPOINTMENT
            </span>

            <h1>
              Chi tiết lịch hẹn
            </h1>

            <p>
              Mã lịch hẹn{" "}
              <strong>
                {appointment?.appointmentCode ||
                  `#${id}`}
              </strong>
            </p>
          </div>

          <div
            className={`appointment-status ${status.className}`}
          >
            <span className="status-dot"></span>

            {status.label}
          </div>
        </div>



        {error && (
          <div className="appointment-alert">
            {error}
          </div>
        )}


        {normalizedStatus ===
          "PENDING_PAYMENT" && (
            <div
              className={
                canRetryPayment
                  ? "payment-warning"
                  : "payment-warning payment-warning-expired"
              }
            >
              <div className="payment-warning-icon">
                !
              </div>

              <div className="payment-warning-content">
                <strong>
                  {canRetryPayment
                    ? "Lịch hẹn đang chờ thanh toán"
                    : "Đã hết thời gian thanh toán"}
                </strong>

                <p>
                  {canRetryPayment
                    ? `Vui lòng hoàn tất thanh toán trong ${formatCountdown(
                      remainingSeconds,
                    )} để giữ lịch hẹn.`
                    : "Thời gian thanh toán 10 phút đã hết. Vui lòng đặt lại lịch hẹn để tiếp tục."}
                </p>
              </div>

              {canRetryPayment && (
                <div className="payment-countdown">
                  {formatCountdown(
                    remainingSeconds,
                  )}
                </div>
              )}
            </div>
          )}



        <div className="appointment-content">

          <div className="appointment-main-card">



            <div className="detail-row service-row">
              <div className="detail-label">
                <span className="detail-number">
                  01
                </span>

                <span>
                  Dịch vụ
                </span>
              </div>

              <div className="service-content">
                <div className="service-symbol">
                  ✂
                </div>

                <div className="service-text">
                  <h2>
                    {serviceName}
                  </h2>

                  <p>
                    Dịch vụ làm tóc
                  </p>
                </div>

                <strong className="service-amount">
                  {formatMoney(
                    servicePrice,
                  )}
                </strong>
              </div>
            </div>


            <div className="detail-row">
              <div className="detail-label">
                <span className="detail-number">
                  02
                </span>

                <span>
                  Stylist
                </span>
              </div>

              <div className="stylist-content">
                <div className="stylist-avatar-large">
                  {appointment?.stylist?.avatar ? (
                    <img
                      src={
                        appointment.stylist
                          .avatar
                      }
                      alt={stylistName}
                    />
                  ) : (
                    <span>
                      {stylistName
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="stylist-text">
                  <h2>
                    {stylistName}
                  </h2>

                  <p>
                    {appointment?.stylist
                      ?.specialization ||
                      "Hair Designer"}
                  </p>
                </div>
              </div>
            </div>


            <div className="detail-row">
              <div className="detail-label">
                <span className="detail-number">
                  03
                </span>

                <span>
                  Thời gian
                </span>
              </div>

              <div className="appointment-datetime">
                <div className="datetime-box">
                  <span className="datetime-icon">
                    ◷
                  </span>

                  <div>
                    <small>
                      NGÀY HẸN
                    </small>

                    <strong>
                      {formatDate(
                        appointment?.appointmentDate,
                      )}
                    </strong>
                  </div>
                </div>

                <div className="datetime-box">
                  <span className="datetime-icon">
                    ◷
                  </span>

                  <div>
                    <small>
                      GIỜ HẸN
                    </small>

                    <strong>
                      {appointment?.startTime ||
                        "--:--"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>


            {appointment?.customerNote && (
              <div className="detail-row">
                <div className="detail-label">
                  <span className="detail-number">
                    04
                  </span>

                  <span>
                    Ghi chú
                  </span>
                </div>

                <div className="note-box">
                  {appointment.customerNote}
                </div>
              </div>
            )}

          </div>

          <aside className="appointment-summary">

            <div className="summary-top">
              <span>
                BOOKING SUMMARY
              </span>

              <h2>
                Tổng quan
              </h2>
            </div>

            <div className="summary-service">
              <div>
                <span>
                  Dịch vụ
                </span>

                <strong>
                  {serviceName}
                </strong>
              </div>

              <span>
                {formatMoney(
                  servicePrice,
                )}
              </span>
            </div>

            <div className="summary-line">
              <span>
                Phí dịch vụ
              </span>

              <strong>
                0đ
              </strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>
                Tổng cộng
              </span>

              <strong>
                {formatMoney(
                  totalAmount,
                )}
              </strong>
            </div>

            {/* ACTION */}

            <div className="summary-actions">

              {normalizedStatus ===
                "PENDING_PAYMENT" && (
                  <button
                    type="button"
                    className="payment-button"
                    onClick={
                      handleRetryPayment
                    }
                    disabled={
                      !canRetryPayment ||
                      paying
                    }
                  >
                    {paying
                      ? "ĐANG CHUYỂN ĐẾN THANH TOÁN..."
                      : canRetryPayment
                        ? "THANH TOÁN LẠI"
                        : "ĐÃ HẾT THỜI GIAN THANH TOÁN"}
                  </button>
                )}

              {!isCancelled && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    cancelling ||
                    paying
                  }
                >
                  {cancelling
                    ? "ĐANG HỦY..."
                    : "HỦY LỊCH HẸN"}
                </button>
              )}

              <button
                type="button"
                className="primary-action"
                onClick={() =>
                  navigate(
                    "/appointments/book",
                  )
                }
                disabled={paying}
              >
                ĐẶT LỊCH MỚI
              </button>

            </div>

            {/* HELP */}

            <div className="summary-help">
              <div className="help-symbol">
                ?
              </div>

              <div>
                <strong>
                  Cần hỗ trợ?
                </strong>

                <p>
                  Liên hệ salon nếu bạn
                  cần thay đổi lịch hẹn.
                </p>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetail;