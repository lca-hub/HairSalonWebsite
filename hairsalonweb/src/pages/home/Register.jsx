import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../../configs/api/Apis";
import "../home/Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      await api.post(endpoints.register, form);

      setSuccess("Đăng ký thành công. Đang chuyển sang đăng nhập...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Đăng ký thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-brand">
          <h1>HAIR SALON</h1>
          <span>CREATE YOUR EXPERIENCE</span>
        </div>

        <div className="register-card">
          <h2>Tạo tài khoản</h2>

          <p className="register-description">
            Đăng ký tài khoản Customer để đặt lịch và sử dụng dịch vụ.
          </p>

          {error && <div className="register-error">{error}</div>}

          {success && <div className="register-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="register-row">
              <div className="form-group">
                <label>Họ</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tên</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "ĐANG TẠO TÀI KHOẢN..." : "ĐĂNG KÝ"}
            </button>
          </form>

          <div className="register-footer">
            <span>Đã có tài khoản?</span>

            <button type="button" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
