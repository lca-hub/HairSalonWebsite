import { useState } from "react";
import { useNavigate } from "react-router-dom";
import cookies from "react-cookies";
import api, { endpoints } from "../../configs/api/Apis";
import "../home/Login.css";


function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
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
        setLoading(true);

        try {
            const response = await api.post(
                endpoints.login,
                form
            );

            const data = response.data;

            cookies.remove("accessToken", { path: "/" });
            cookies.remove("refreshToken", { path: "/" });
            cookies.remove("userId", { path: "/" });
            cookies.remove("email", { path: "/" });
            cookies.remove("role", { path: "/" });
            cookies.remove("fullname", { path: "/" });
            cookies.remove("avatar", { path: "/" });

            cookies.save("accessToken", data.accessToken, {
                path: "/",
            });

            switch (data.role) {
                case "ADMIN":
                    navigate("/admin");
                    break;

                case "STYLIST":
                    navigate("/stylist");
                    break;

                case "RECEPTIONIST":
                    navigate("/receptionist");
                    break;

                case "CUSTOMER":
                    navigate("/customer");
                    break;

                default:
                    setError("Tài khoản không có quyền hợp lệ.");
            }

        } catch (error) {
            console.error("LOGIN ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Email hoặc mật khẩu không đúng."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-container">

                <div className="auth-brand">
                    <h1>HAIR SALON</h1>
                    <span>BEAUTY • STYLE • EXPERIENCE</span>
                </div>

                <div className="auth-card">

                    <h2>Đăng nhập</h2>

                    <p className="auth-description">
                        Đăng nhập để tiếp tục sử dụng dịch vụ.
                    </p>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">

                            <label>Email</label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Nhập email của bạn"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>Mật khẩu</label>

                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                required
                            />

                        </div>

                        <div className="forgot-password">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/forgot-password")
                                }
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading
                                ? "ĐANG ĐĂNG NHẬP..."
                                : "ĐĂNG NHẬP"}
                        </button>

                    </form>

                    <div className="auth-footer">

                        <span>Chưa có tài khoản?</span>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Đăng ký
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;