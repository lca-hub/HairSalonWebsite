import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { Link } from "react-router-dom";
import api, { endpoints } from "../../configs/api/Apis";
import "./StylistList.css";

function StylistList() {
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadStylists = async () => {
            try {
                const response = await api.get(endpoints.stylists, {
                    params: { page: 0, size: 20, isActive: true },
                });
                setStylists(response.data.content || []);
            } catch (err) {
                console.error("LOAD STYLIST ERROR:", err);
                setError(err.response?.data?.message || "Không thể tải danh sách stylist.");
            } finally {
                setLoading(false);
            }
        };

        loadStylists();
    }, []);

    if (loading) return <><Header /><div className="stylist-page"><p>Đang tải stylist...</p></div></>;
    if (error) return <><Header /><div className="stylist-page"><p className="page-error">{error}</p></div></>;

    return (
        <div className="stylist-page">
            <Header />
            <div className="page-container">
                <div className="page-heading">
                    <p className="page-label">OUR STYLISTS</p>
                    <h1>Đội ngũ stylist</h1>
                    <p>Chọn stylist phù hợp với phong cách của bạn.</p>
                </div>

                <div className="stylist-list-grid">
                    {stylists.map((stylist) => {
                        const name = `${stylist.firstName || ""} ${stylist.lastName || ""}`.trim() || "Stylist";
                        return (
                            <div className="stylist-item-card" key={stylist.id}>
                                <div className="stylist-avatar-wrap">
                                    {stylist.avatar ? (
                                        <img src={stylist.avatar} alt={name} className="stylist-avatar" />
                                    ) : (
                                        <div className="stylist-avatar placeholder">STYLIST</div>
                                    )}
                                </div>
                                <div className="stylist-card-body">
                                    <h2>{name}</h2>
                                    <p>{stylist.specialization || "Hair Designer"}</p>
                                    <span>{stylist.experienceYears || 0} năm kinh nghiệm</span>
                                    <div className="stylist-card-actions">
                                        <Link to={`/stylists/${stylist.id}`} className="text-button">XEM CHI TIẾT</Link>
                                        <Link to={`/appointments/book?stylistId=${stylist.id}`} className="gold-button">ĐẶT LỊCH</Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default StylistList;
