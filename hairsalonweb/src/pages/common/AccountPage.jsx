import { useEffect, useMemo, useState } from "react";
import cookies from "react-cookies";
import Header from "../../components/Header";
import { decodeToken, getRoleFromToken } from "../../components/ProtectedRoute";
import "./AccountPage.css";

const roleLabels = {
  ADMIN: "Quản lý salon",
  RECEPTIONIST: "Lễ tân",
  STYLIST: "Stylist",
};

function AccountPage() {
  const token = cookies.load("accessToken");
  const payload = decodeToken(token);
  const role = getRoleFromToken(payload);
  const email = payload?.email || payload?.sub || "";
  const storageKey = `hairSalonProfile_${email || "guest"}`;

  const localProfile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      return null;
    }
  }, [storageKey]);

  const [avatar, setAvatar] = useState(localProfile?.avatar || "");
  const [form, setForm] = useState({
    fullname: localProfile?.fullname || "",
    email,
    phoneNumber: localProfile?.phoneNumber || "",
    dob: localProfile?.dob || "",
    gender: localProfile?.gender || "",
  });
  const [, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((current) => ({
      ...current,
      email,
    }));
  }, [email]);

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
      setAvatar(String(reader.result || ""));
      setSaved(false);
    };

    reader.readAsDataURL(file);
  };

  const saveProfile = (event) => {
    event.preventDefault();

    localStorage.setItem(storageKey, JSON.stringify({ ...form, avatar }));
    setSaved(true);
  };

  return (
    <div className="staff-account-page">
      <Header role={role} title={roleLabels[role] || "Tài khoản"} />

      <main className="staff-account-main">
        <div className="staff-account-shell">
          <div className="staff-account-title">
            <div>
              <p>MY ACCOUNT</p>
              <h1>Tài khoản của tôi</h1>
              <span>Quản lý thông tin cá nhân của bạn.</span>
            </div>
          </div>

          <section className="staff-account-panel">
            <div className="staff-account-panel-head">
              <h2>Thông tin cá nhân</h2>
              <p>Thông tin tài khoản của bạn.</p>
            </div>

            <form onSubmit={saveProfile} className="staff-profile-grid">
              <div className="staff-profile-avatar-column">
                <div className="staff-profile-avatar">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" />
                  ) : (
                    <span>
                      {(form.fullname || roleLabels[role] || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <label className="staff-profile-upload">
                  CHỌN ẢNH
                  <input type="file" accept="image/*" onChange={handleAvatar} />
                </label>
              </div>

              <div className="staff-profile-fields">
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
                  <input value={roleLabels[role] || role || ""} disabled />
                </label>

                <div className="staff-profile-actions">
                  <button type="submit">LƯU THAY ĐỔI</button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AccountPage;