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

  // ==============================
  // LOAD DETAIL
  // ==============================
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
          err.response?.data?.message || "Không thể tải thông tin lịch hẹn.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [id]);

  // ==============================
  // CANCEL
  // ==============================
  const handleCancel = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn hủy lịch hẹn này?");

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError("");

      await authApis().post(endpoints.cancelAppointment(id));

      const response = await authApis().get(endpoints.myAppointmentDetail(id));

      setAppointment(response.data);
    } catch (err) {
      console.error("CANCEL APPOINTMENT ERROR:", err);

      setError(err.response?.data?.message || "Không thể hủy lịch hẹn.");
    } finally {
      setCancelling(false);
    }
  };

  // ==============================
  // FORMAT DATE
  // ==============================
  const formatDate = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ==============================
  // FORMAT MONEY
  // ==============================
  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  };

  // ==============================
  // STATUS
  // ==============================
  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
      case "PENDING_PAYMENT":
        return {
          label: "Chờ xác nhận",
          className: "pending",
        };

      case "CONFIRMED":
        return {
          label: "Đã xác nhận",
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

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="appointment-detail-page">
        <div className="appointment-detail-container">
          <div className="appointment-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin lịch hẹn...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================
  if (error && !appointment) {
    return (
      <div className="appointment-detail-page">
        <div className="appointment-detail-container">
          <div className="appointment-error">
            <div className="error-icon">!</div>

            <h2>Không thể tải lịch hẹn</h2>

            <p>{error}</p>

            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/customer/appointments")}
            >
              ← Quay lại lịch hẹn
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // DATA
  // ==============================

  const status = getStatusInfo(appointment?.status);

  const stylistName =
    `${appointment?.stylist?.firstName || ""} ${
      appointment?.stylist?.lastName || ""
    }`.trim() || "Stylist";

  const serviceName =
    appointment?.service?.name || appointment?.serviceName || "Dịch vụ làm tóc";

  const servicePrice =
    appointment?.service?.price || appointment?.servicePrice || 0;

  const totalAmount = appointment?.totalAmount || servicePrice;

  const isCancelled = ["CANCELLED", "COMPLETED", "NO_SHOW", "EXPIRED"].includes(
    appointment?.status,
  );

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="appointment-detail-page">
      <div className="appointment-detail-container">
        {/* ==============================
            BACK
        ============================== */}

        <button
          type="button"
          className="appointment-back"
          onClick={() => navigate("/customer/appointments")}
        >
          <span>←</span>
          <span>Lịch hẹn của tôi</span>
        </button>

        {/* ==============================
            PAGE HEADER
        ============================== */}

        <div className="appointment-page-header">
          <div className="header-left">
            <span className="appointment-eyebrow">APPOINTMENT</span>

            <h1>Chi tiết lịch hẹn</h1>

            <p>
              Mã lịch hẹn{" "}
              <strong>{appointment?.appointmentCode || `#${id}`}</strong>
            </p>
          </div>

          <div className={`appointment-status ${status.className}`}>
            <span className="status-dot"></span>
            {status.label}
          </div>
        </div>

        {/* ==============================
            ERROR ALERT
        ============================== */}

        {error && <div className="appointment-alert">{error}</div>}

        {/* ==============================
            CONTENT
        ============================== */}

        <div className="appointment-content">
          {/* =====================================
              MAIN CARD
          ===================================== */}

          <div className="appointment-main-card">
            {/* SERVICE */}

            <div className="detail-row service-row">
              <div className="detail-label">
                <span className="detail-number">01</span>

                <span>Dịch vụ</span>
              </div>

              <div className="service-content">
                <div className="service-symbol">✂</div>

                <div className="service-text">
                  <h2>{serviceName}</h2>

                  <p>Dịch vụ làm tóc</p>
                </div>

                <strong className="service-amount">
                  {formatMoney(servicePrice)}
                </strong>
              </div>
            </div>

            {/* STYLIST */}

            <div className="detail-row">
              <div className="detail-label">
                <span className="detail-number">02</span>

                <span>Stylist</span>
              </div>

              <div className="stylist-content">
                <div className="stylist-avatar-large">
                  {appointment?.stylist?.avatar ? (
                    <img src={appointment.stylist.avatar} alt={stylistName} />
                  ) : (
                    <span>{stylistName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="stylist-text">
                  <h2>{stylistName}</h2>

                  <p>
                    {appointment?.stylist?.specialization || "Hair Designer"}
                  </p>
                </div>
              </div>
            </div>

            {/* DATE TIME */}

            <div className="detail-row">
              <div className="detail-label">
                <span className="detail-number">03</span>

                <span>Thời gian</span>
              </div>

              <div className="appointment-datetime">
                <div className="datetime-box">
                  <span className="datetime-icon">◷</span>

                  <div>
                    <small>NGÀY HẸN</small>

                    <strong>{formatDate(appointment?.appointmentDate)}</strong>
                  </div>
                </div>

                <div className="datetime-box">
                  <span className="datetime-icon">◷</span>

                  <div>
                    <small>GIỜ HẸN</small>

                    <strong>{appointment?.startTime || "--:--"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTE */}

            {appointment?.customerNote && (
              <div className="detail-row">
                <div className="detail-label">
                  <span className="detail-number">04</span>

                  <span>Ghi chú</span>
                </div>

                <div className="note-box">{appointment.customerNote}</div>
              </div>
            )}
          </div>

          {/* =====================================
              RIGHT SUMMARY
          ===================================== */}

          <aside className="appointment-summary">
            <div className="summary-top">
              <span>BOOKING SUMMARY</span>

              <h2>Tổng quan</h2>
            </div>

            <div className="summary-service">
              <div>
                <span>Dịch vụ</span>
                <strong>{serviceName}</strong>
              </div>

              <span>{formatMoney(servicePrice)}</span>
            </div>

            <div className="summary-line">
              <span>Phí dịch vụ</span>
              <strong>0đ</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Tổng cộng</span>

              <strong>{formatMoney(totalAmount)}</strong>
            </div>

            {/* ACTION */}

            <div className="summary-actions">
              {!isCancelled && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "ĐANG HỦY..." : "HỦY LỊCH HẸN"}
                </button>
              )}

              <button
                type="button"
                className="primary-action"
                onClick={() => navigate("/appointments/book")}
              >
                ĐẶT LỊCH MỚI
              </button>
            </div>

            {/* HELP */}

            <div className="summary-help">
              <div className="help-symbol">?</div>

              <div>
                <strong>Cần hỗ trợ?</strong>

                <p>Liên hệ salon nếu bạn cần thay đổi lịch hẹn.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetail;
