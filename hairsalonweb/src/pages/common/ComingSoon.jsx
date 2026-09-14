import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import cookies from "react-cookies";
import "../dashboard/Dashboard.css";

function ComingSoon({ title, description, role }) {
  const navigate = useNavigate();
  return (
    <div className="dashboard-page">
      <Header role={role || cookies.load("role")} title={title} />
      <main className="dashboard-main">
        <div className="dashboard-heading">
          <div className="eyebrow">HAIR SALON</div>
          <h1>{title}</h1>
          <p>{description || "Chức năng đang được hoàn thiện."}</p>
        </div>
        <div className="dashboard-note">
          <p>
            Đây là màn hình khung. API đã được chuẩn bị và giao diện sẽ được nối
            tiếp.
          </p>
          <button className="logout-btn" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <span style={{ marginLeft: 12 }}>
            <Link
              className="dashboard-link"
              to={
                role === "CUSTOMER"
                  ? "/customer"
                  : `/${String(role || "").toLowerCase()}`
              }
            >
              Dashboard
            </Link>
          </span>
        </div>
      </main>
    </div>
  );
}

export default ComingSoon;
