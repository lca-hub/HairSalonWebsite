import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import "./CustomerAppointments.css";

function CustomerAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // LOAD APPOINTMENTS
  // =========================================
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authApis().get(endpoints.myAppointments);

      console.log("MY APPOINTMENTS RESPONSE:", response.data);

      /*
       * Backend có thể trả về:
       *
       * 1. [ ... ]
       *
       * 2. { data: [ ... ] }
       *
       * 3. { result: [ ... ] }
       *
       * 4. { content: [ ... ] }
       *
       * nên xử lý tất cả.
       */

      let data = response.data;

      if (Array.isArray(data)) {
        // Trường hợp 1
        setAppointments(data);
      } else if (Array.isArray(data?.data)) {
        // Trường hợp 2
        setAppointments(data.data);
      } else if (Array.isArray(data?.result)) {
        // Trường hợp 3
        setAppointments(data.result);
      } else if (Array.isArray(data?.content)) {
        // Trường hợp 4 - thường gặp nếu Spring trả Page
        setAppointments(data.content);
      } else {
        console.error("API appointments không trả về Array:", response.data);

        setAppointments([]);
        setError("Dữ liệu lịch hẹn không đúng định dạng.");
      }
    } catch (err) {
      console.error("LOAD APPOINTMENTS ERROR:", err);

      setAppointments([]);

      setError(
        err.response?.data?.message || "Không thể tải danh sách lịch hẹn.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // STATUS LABEL
  // =========================================
  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "Chờ thanh toán";

      case "CONFIRMED":
        return "Đã xác nhận";

      case "IN_SERVICE":
        return "Đang phục vụ";

      case "COMPLETED":
        return "Hoàn thành";

      case "CANCELLED":
        return "Đã hủy";

      case "NO_SHOW":
        return "Không đến";

      case "EXPIRED":
        return "Đã hết hạn";

      default:
        return status || "Không xác định";
    }
  };

  // =========================================
  // STATUS CLASS
  // =========================================
  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "status-pending";

      case "CONFIRMED":
        return "status-confirmed";

      case "IN_SERVICE":
        return "status-in-service";

      case "COMPLETED":
        return "status-completed";

      case "CANCELLED":
        return "status-cancelled";

      case "NO_SHOW":
        return "status-no-show";

      case "EXPIRED":
        return "status-expired";

      default:
        return "";
    }
  };

  // =========================================
  // STYLIST NAME
  // =========================================
  const getStylistName = (appointment) => {
    if (appointment?.stylist) {
      const fullName = `${appointment.stylist.firstName || ""} ${
        appointment.stylist.lastName || ""
      }`.trim();

      return fullName || "Stylist";
    }

    return appointment?.stylistName || "Stylist";
  };

  // =========================================
  // SERVICE NAME
  // =========================================
  const getServiceName = (appointment) => {
    return (
      appointment?.service?.name ||
      appointment?.serviceName ||
      "Dịch vụ làm tóc"
    );
  };

  // =========================================
  // SERVICE PRICE
  // =========================================
  const getServicePrice = (appointment) => {
    return appointment?.service?.price || appointment?.servicePrice || 0;
  };

  // =========================================
  // FORMAT MONEY
  // =========================================
  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  };

  // =========================================
  // FORMAT DATE
  // =========================================
  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =========================================
  // LOADING
  // =========================================
  if (loading) {
    return (
      <div className="customer-appointments-page">
        <div className="appointments-container">
          <div className="appointments-loading">
            <div className="loading-spinner"></div>

            <p>Đang tải lịch hẹn...</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================
  if (error) {
    return (
      <div className="customer-appointments-page">
        <div className="appointments-container">
          <div className="appointments-error">
            <div className="error-icon">!</div>

            <h2>Không thể tải lịch hẹn</h2>

            <p>{error}</p>

            <button
              type="button"
              className="retry-button"
              onClick={loadAppointments}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // RENDER
  // =========================================
  return (
    <div className="customer-appointments-page">
      <div className="appointments-container">
        {/* =====================================
            HEADER
        ===================================== */}

        <div className="appointments-header">
          <div>
            <p className="appointments-label">MY APPOINTMENTS</p>

            <h1>Lịch hẹn của tôi</h1>

            <p className="appointments-description">
              Theo dõi và quản lý những lịch hẹn làm tóc của bạn.
            </p>
          </div>

          <Link to="/appointments/book" className="book-appointment-btn">
            + Đặt lịch mới
          </Link>
        </div>

        {/* =====================================
            EMPTY
        ===================================== */}

        {appointments.length === 0 ? (
          <div className="appointments-empty">
            <div className="empty-icon">♡</div>

            <h2>Chưa có lịch hẹn</h2>

            <p>
              Bạn chưa có lịch hẹn nào. Hãy đặt lịch để trải nghiệm dịch vụ của
              chúng tôi.
            </p>

            <Link to="/appointments/book" className="empty-book-btn">
              ĐẶT LỊCH NGAY
            </Link>
          </div>
        ) : (
          /* =====================================
              APPOINTMENT LIST
          ===================================== */

          <div className="appointments-list">
            {appointments.map((appointment) => {
              const serviceName = getServiceName(appointment);

              const stylistName = getStylistName(appointment);

              const servicePrice = getServicePrice(appointment);

              return (
                <Link
                  key={appointment.id}
                  to={`/appointments/${appointment.id}`}
                  className="appointment-card"
                >
                  {/* DATE */}

                  <div className="appointment-date">
                    <span className="date-day">
                      {appointment.appointmentDate
                        ? new Date(appointment.appointmentDate).getDate()
                        : "--"}
                    </span>

                    <span className="date-month">
                      {appointment.appointmentDate
                        ? new Date(
                            appointment.appointmentDate,
                          ).toLocaleDateString("vi-VN", {
                            month: "short",
                          })
                        : ""}
                    </span>
                  </div>

                  {/* INFO */}

                  <div className="appointment-info">
                    <div className="appointment-top">
                      <span className="appointment-code">
                        {appointment.appointmentCode
                          ? appointment.appointmentCode
                          : `#${appointment.id}`}
                      </span>

                      <span
                        className={`appointment-status ${getStatusClass(
                          appointment.status,
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>

                    <h2>{serviceName}</h2>

                    <p className="appointment-stylist">
                      Stylist: <strong>{stylistName}</strong>
                    </p>

                    <div className="appointment-time">
                      <span> {formatDate(appointment.appointmentDate)}</span>

                      <span> {appointment.startTime || "--:--"}</span>

                      <span>{formatMoney(servicePrice)}</span>
                    </div>
                  </div>

                  {/* ARROW */}

                  <div className="appointment-arrow">→</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerAppointments;
