import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cookies from "react-cookies";
import "./CustomerAccountPage.css";
const roleLabels = {
    ADMIN: "Quản lý salon",
    RECEPTIONIST: "Lễ tân",
    STYLIST: "Stylist",
    CUSTOMER: "Khách hàng",
};

function CustomerAccountPage() {
    const navigate = useNavigate();
    const role = cookies.load("role") || "CUSTOMER";
    const email = cookies.load("email") || "";
    const savedProfile = JSON.parse(localStorage.getItem("hairSalonProfile") || "null");

    const [avatar, setAvatar] = useState(savedProfile?.avatar || cookies.load("avatar") || "");
    const [form, setForm] = useState({
        fullname: savedProfile?.fullname || "",
        email: savedProfile?.email || email,
        phoneNumber: savedProfile?.phoneNumber || "",
        dob: savedProfile?.dob || "",
        gender: savedProfile?.gender || "",
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const name = cookies.load("fullname");
        if (!form.fullname && name) {
            setForm((current) => ({ ...current, fullname: name }));
        }
    }, [form.fullname]);

    const roleHome = useMemo(() => {
        if (role === "ADMIN") return "/admin";
        if (role === "RECEPTIONIST") return "/receptionist";
        if (role === "STYLIST") return "/stylist";
        return "/customer";
    }, [role]);

    const handleChange = (event) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
        setSaved(false);
    };

    const handleAvatar = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const value = String(reader.result || "");
            setAvatar(value);
            cookies.save("avatar", value, { path: "/" });
            setSaved(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = (event) => {
        event.preventDefault();

        localStorage.setItem(
            "hairSalonProfile",
            JSON.stringify({
                ...form,
                avatar,
            })
        );

        if (form.fullname) {
            cookies.save("fullname", form.fullname, { path: "/" });
        }
        if (avatar) {
            cookies.save("avatar", avatar, { path: "/" });
        }

        setSaved(true);
    };

    const logout = () => {
        ["accessToken", "refreshToken", "userId", "email", "role", "avatar", "fullname"].forEach((key) =>
            cookies.remove(key, { path: "/" })
        );
        localStorage.removeItem("hairSalonProfile");
        navigate("/login", { replace: true });
    };

    return (
        <div className="account-page">
            <main className="account-main">
                <div className="account-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>/</span>
                    <span>Tài khoản</span>
                </div>

                <div className="account-layout">
                    <aside className="account-sidebar">
                        <div className="account-sidebar-title">TÀI KHOẢN</div>

                        <Link to={roleHome}>Tổng quan</Link>
                        <Link className="active" to={`/${role.toLowerCase()}/profile`}>Thông tin cá nhân</Link>

                        {role === "CUSTOMER" && (
                            <>
                                <Link to="/customer/appointments">Lịch hẹn của tôi</Link>
                                <Link to="/customer/orders">Đơn hàng</Link>
                                <Link to="/customer/invoices">Hóa đơn</Link>
                                <Link to="/customer/notifications">Thông báo</Link>
                            </>
                        )}

                        <button type="button" onClick={logout}>Đăng xuất</button>
                    </aside>

                    <section className="account-content">
                        <div className="account-heading">
                            <div>
                                <p>MY ACCOUNT</p>
                                <h1>Thông tin cá nhân</h1>
                            </div>
                            <span>{roleLabels[role]}</span>
                        </div>

                        <form className="profile-form" onSubmit={handleSave}>
                            <section className="profile-section profile-photo-section">
                                <div>
                                    <h2>Ảnh đại diện</h2>
                                    <p>Chọn một ảnh rõ nét để sử dụng cho tài khoản của bạn.</p>
                                </div>

                                <div className="profile-photo-area">
                                    <div className="profile-photo">
                                        {avatar ? (
                                            <img src={avatar} alt="Avatar" />
                                        ) : (
                                            <span>{form.fullname ? form.fullname.charAt(0).toUpperCase() : "U"}</span>
                                        )}
                                    </div>
                                    <div className="photo-actions">
                                        <label className="outline-button">
                                            CHỌN ẢNH
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatar}
                                            />
                                        </label>
                                        <small>JPG, PNG hoặc WEBP</small>
                                    </div>
                                </div>
                            </section>

                            <section className="profile-section">
                                <div className="profile-section-title">
                                    <h2>Thông tin tài khoản</h2>
                                </div>

                                <div className="profile-fields">
                                    <label>
                                        Họ và tên
                                        <input name="fullname" value={form.fullname} onChange={handleChange} placeholder="Nhập họ và tên" />
                                    </label>

                                    <label>
                                        Email
                                        <input value={form.email} disabled />
                                    </label>

                                    <label>
                                        Số điện thoại
                                        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Nhập số điện thoại" />
                                    </label>

                                    <label>
                                        Ngày sinh
                                        <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                                    </label>

                                    <label>
                                        Giới tính
                                        <select name="gender" value={form.gender} onChange={handleChange}>
                                            <option value="">Chọn giới tính</option>
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </label>

                                    <label>
                                        Vai trò
                                        <input value={roleLabels[role]} disabled />
                                    </label>
                                </div>
                            </section>

                            <div className="profile-footer">
                                <div>
                                    {saved && <span className="save-message">Đã lưu thông tin trên trình duyệt.</span>}
                                </div>
                                <button className="save-button" type="submit">LƯU THAY ĐỔI</button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default CustomerAccountPage;
