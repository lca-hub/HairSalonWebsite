import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { Link, useParams } from "react-router-dom";
import api, { endpoints } from "../../configs/api/Apis";
import "./Stylist.css";

function StylistDetail() {
    const { id } = useParams();
    const [stylist, setStylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get(endpoints.stylistDetail(id));
                setStylist(response.data);
            } catch (err) {
                console.error("LOAD STYLIST DETAIL ERROR:", err);
                setError(err.response?.data?.message || "Không thể tải thông tin stylist.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <><Header /><div className="stylist-page"><p>Đang tải...</p></div></>;
    if (error || !stylist) return <><Header /><div className="stylist-page"><p className="page-error">{error || "Không tìm thấy stylist."}</p></div></>;

    const name = `${stylist.firstName || ""} ${stylist.lastName || ""}`.trim() || "Stylist";

    return (
        <div className="stylist-page">
            <Header />
            <div className="page-container detail-container">
                <Link to="/stylists" className="back-link">← Quay lại stylist</Link>

                <div className="stylist-detail-card">
                    <div className="stylist-detail-image">
                        {stylist.avatar ? (
                            <img src={stylist.avatar} alt={name} />
                        ) : (
                            <div className="detail-placeholder">STYLIST</div>
                        )}
                    </div>

                    <div className="stylist-detail-content">
                        <p className="page-label">STYLIST PROFILE</p>
                        <h1>{name}</h1>
                        <h3>{stylist.specialization || "Hair Designer"}</h3>
                        <p>{stylist.bio || "Stylist chuyên nghiệp, tận tâm và luôn tư vấn kiểu tóc phù hợp cho khách hàng."}</p>

                        <div className="detail-meta">
                            <span>{stylist.experienceYears || 0} năm kinh nghiệm</span>
                            <span>★ {stylist.averageRating || "0.00"}</span>
                        </div>

                        <Link to={`/appointments/book?stylistId=${stylist.id}`} className="gold-button">
                            ĐẶT LỊCH VỚI STYLIST NÀY
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StylistDetail;
