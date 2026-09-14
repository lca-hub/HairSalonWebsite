import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import cookies from "react-cookies";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import { decodeToken } from "../../components/ProtectedRoute";
import "./CustomerHome.css";

const statusLabels = {
  PENDING_PAYMENT: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  IN_SERVICE: "Đang phục vụ",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến",
  EXPIRED: "Hết hạn",
};

function CustomerHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const token = cookies.load("accessToken");
  const payload = decodeToken(token);
  const email = payload?.email || payload?.sub || "";

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatar, setAvatar] = useState("");

  const profileKey = `hairSalonProfile_${email || "guest"}`;
  const isDetail = location.pathname.includes("/customer/appointments/") && id;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const appointmentResponse = await authApis().get(
          endpoints.myAppointments,
          { params: { page: 0, size: 10 } },
        );

        setAppointments(appointmentResponse.data?.content || []);

        const localProfile = JSON.parse(
          localStorage.getItem(profileKey) || "null",
        );

        setProfile({
          fullname: localProfile?.fullname || "",
          email,
          phoneNumber: localProfile?.phoneNumber || "",
          dob: localProfile?.dob || "",
          gender: localProfile?.gender || "",
        });

        setAvatar(localProfile?.avatar || "");
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError(err.response?.data?.message || "Không thể tải lịch hẹn.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, profileKey, email]);

  useEffect(() => {
    if (!isDetail) {
      setDetail(null);
      return;
    }

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        const response = await authApis().get(
          endpoints.myAppointmentDetail(id),
        );
        setDetail(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể tải chi tiết lịch hẹn.",
        );
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [id, isDetail]);

  const fullName = useMemo(() => {
    if (profile?.fullname) return profile.fullname;
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    }
    return "Khách hàng";
  }, [profile]);

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result || ""));
    reader.readAsDataURL(file);
    setSaved(false);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    localStorage.setItem(
      profileKey,
      JSON.stringify({
        fullname: profile?.fullname || fullName,
        email,
        phoneNumber: profile?.phoneNumber || "",
        dob: profile?.dob || "",
        gender: profile?.gender || "",
        avatar,
      }),
    );
    setSaved(true);
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Bạn có chắc muốn hủy lịch hẹn này không?")) return;
    try {
      await authApis().post(endpoints.cancelAppointment(appointmentId));
      const response = await authApis().get(endpoints.myAppointments, {
        params: { page: 0, size: 10 },
      });
      setAppointments(response.data?.content || []);
      if (detail?.id === appointmentId) {
        const detailResponse = await authApis().get(
          endpoints.myAppointmentDetail(appointmentId),
        );
        setDetail(detailResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể hủy lịch hẹn.");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="customer-account">
          <div className="customer-shell">Đang tải...</div>
        </main>
      </>
    );
  }

  return (
    <div className="customer-page">
      <Header />
      <main className="customer-account">
        <div className="customer-shell">
          <div className="customer-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Tài khoản</span>
          </div>

          <div className="customer-title-row">
            <div>
              <p className="eyebrow">MY ACCOUNT</p>
              <h1>Tài khoản của tôi</h1>
              <p>Quản lý thông tin cá nhân và lịch hẹn của bạn.</p>
            </div>
            <Link className="customer-book-button" to="/appointments/book">
              ĐẶT LỊCH
            </Link>
          </div>

          {error && <div className="customer-alert">{error}</div>}

          <div className="customer-layout">
            <aside className="customer-sidebar">
              <Link
                className={
                  !isDetail && location.pathname === "/customer/profile"
                    ? "active"
                    : ""
                }
                to="/customer/profile"
              >
                Thông tin cá nhân
              </Link>
              <Link
                className={
                  !isDetail && location.pathname === "/customer" ? "active" : ""
                }
                to="/customer"
              >
                Lịch hẹn của tôi
              </Link>
              <Link to="/customer/cart">Giỏ hàng</Link>
              <Link to="/customer/orders">Đơn hàng</Link>
              <Link to="/customer/invoices">Hóa đơn</Link>
              <Link to="/customer/notifications">Thông báo</Link>
            </aside>

            <section className="customer-content">
              {isDetail ? (
                <AppointmentDetail
                  detail={detail}
                  loading={detailLoading}
                  onCancel={handleCancel}
                />
              ) : (
                <>
                  <section className="account-section profile-overview">
                    <div className="section-heading-line">
                      <div>
                        <h2>Thông tin cá nhân</h2>
                        <p>Thông tin tài khoản của bạn.</p>
                      </div>
                    </div>

                    <form onSubmit={saveProfile} className="profile-grid">
                      <div className="profile-avatar-column">
                        <div className="profile-avatar-large">
                          {avatar ? (
                            <img src={avatar} alt="Avatar" />
                          ) : (
                            <span>{fullName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <label className="profile-upload">
                          CHỌN ẢNH
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatar}
                          />
                        </label>
                      </div>

                      <div className="profile-fields">
                        <label>
                          Họ và tên
                          <input
                            value={profile?.fullname || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                fullname: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Email
                          <input value={profile?.email || email} disabled />
                        </label>
                        <label>
                          Số điện thoại
                          <input
                            value={profile?.phoneNumber || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                phoneNumber: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Ngày sinh
                          <input
                            type="date"
                            value={profile?.dob || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, dob: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Giới tính
                          <select
                            value={profile?.gender || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, gender: e.target.value })
                            }
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </label>
                        <div className="profile-save-row">
                          <button type="submit">LƯU THAY ĐỔI</button>
                        </div>
                      </div>
                    </form>
                  </section>

                  <section className="account-section">
                    <div className="section-heading-line">
                      <div>
                        <h2>Lịch hẹn của tôi</h2>
                        <p>Danh sách các lịch hẹn gần đây.</p>
                      </div>
                      <Link to="/customer">Xem tất cả</Link>
                    </div>

                    {appointments.length === 0 ? (
                      <div className="empty-state">
                        Bạn chưa có lịch hẹn nào.
                      </div>
                    ) : (
                      <div className="appointment-list">
                        {appointments.map((appointment) => (
                          <div className="appointment-row" key={appointment.id}>
                            <div className="appointment-date">
                              <strong>{appointment.appointmentDate}</strong>
                              <span>
                                {appointment.startTime} - {appointment.endTime}
                              </span>
                            </div>
                            <div className="appointment-info">
                              <strong>
                                {appointment.serviceName || "Dịch vụ"}
                              </strong>
                              <span>
                                Stylist: {appointment.stylistName || "-"}
                              </span>
                              <small>{appointment.appointmentCode}</small>
                            </div>
                            <div
                              className={`appointment-status status-${String(appointment.status || "").toLowerCase()}`}
                            >
                              {statusLabels[appointment.status] ||
                                appointment.status}
                            </div>
                            <Link
                              className="appointment-detail-link"
                              to={`/customer/appointments/${appointment.id}`}
                            >
                              CHI TIẾT
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function AppointmentDetail({ detail, loading, onCancel }) {
  if (loading)
    return (
      <section className="account-section">
        Đang tải chi tiết lịch hẹn...
      </section>
    );
  if (!detail)
    return (
      <section className="account-section">Không tìm thấy lịch hẹn.</section>
    );

  return (
    <section className="account-section appointment-detail-section">
      <Link className="back-link" to="/customer">
        ← Lịch hẹn của tôi
      </Link>
      <div className="detail-header">
        <div>
          <p className="eyebrow">APPOINTMENT DETAIL</p>
          <h2>{detail.appointmentCode}</h2>
          <span
            className={`appointment-status status-${String(detail.status || "").toLowerCase()}`}
          >
            {statusLabels[detail.status] || detail.status}
          </span>
        </div>
        {detail.status !== "CANCELLED" && detail.status !== "COMPLETED" && (
          <button
            className="cancel-button"
            type="button"
            onClick={() => onCancel(detail.id)}
          >
            HỦY LỊCH
          </button>
        )}
      </div>

      <div className="detail-grid">
        <div>
          <span>Dịch vụ</span>
          <strong>{detail.serviceName || "-"}</strong>
        </div>
        <div>
          <span>Stylist</span>
          <strong>{detail.stylistName || "-"}</strong>
        </div>
        <div>
          <span>Ngày</span>
          <strong>{detail.appointmentDate || "-"}</strong>
        </div>
        <div>
          <span>Giờ</span>
          <strong>
            {detail.startTime} - {detail.endTime}
          </strong>
        </div>
        <div>
          <span>Giá</span>
          <strong>
            {Number(detail.bookingAmount || 0).toLocaleString("vi-VN")}đ
          </strong>
        </div>
        <div>
          <span>Ghi chú</span>
          <strong>{detail.customerNote || "Không có"}</strong>
        </div>
      </div>
    </section>
  );
}

export default CustomerHome;
