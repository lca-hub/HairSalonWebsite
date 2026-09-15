import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./ServiceList.css";

function ServiceList() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loadServices = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "http://localhost:8080/api/services?page=0&size=50&isActive=true"
                );

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách dịch vụ.");
                }

                const data = await response.json();

                setServices(
                    Array.isArray(data)
                        ? data
                        : data?.content || data?.data || data?.result || []
                );
            } catch (err) {
                console.error("LOAD SERVICES ERROR:", err);

                setError(
                    err.message || "Không thể tải danh sách dịch vụ."
                );
            } finally {
                setLoading(false);
            }
        };

        loadServices();
    }, []);

    const formatMoney = (value) => {
        return Number(value || 0).toLocaleString("vi-VN") + "đ";
    };

    const handleBooking = (serviceId) => {
        navigate(`/appointments/book?serviceId=${serviceId}`);
    };

    if (loading) {
        return (
            <div className="service-page">
                <Header />

                <main className="service-container">
                    <div className="service-loading">
                        <div className="service-spinner"></div>
                        <p>Đang tải dịch vụ...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="service-page">
            <Header />

            <main className="service-container">
                <div className="service-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>/</span>
                    <span>Dịch vụ</span>
                </div>

                <div className="service-header">
                    <div>
                        <p className="service-eyebrow">
                            OUR SERVICES
                        </p>

                        <h1>
                            Dịch vụ của salon
                        </h1>

                    </div>

                    <Link
                        className="service-book-button"
                        to="/appointments/book"
                    >
                        ĐẶT LỊCH
                    </Link>
                </div>

                {error && (
                    <div className="service-alert">
                        {error}
                    </div>
                )}

                {services.length === 0 ? (
                    <div className="service-empty">
                        <h2>
                            Chưa có dịch vụ
                        </h2>

                        <p>
                            Hiện tại salon chưa có dịch vụ nào đang hoạt động.
                        </p>
                    </div>
                ) : (
                    <div className="service-grid">
                        {services.map((service) => (
                            <div
                                className="service-card"
                                key={service.id}
                            >
                                <div className="service-image-wrapper">
                                    <img
                                        src={
                                            service.imageUrl ||
                                            service.image ||
                                            "/images/service-default.jpg"
                                        }
                                        alt={service.name}
                                        className="service-image"
                                    />
                                </div>

                                <div className="service-card-content">
                                    <h3>
                                        {service.name}
                                    </h3>

                                    <p className="service-description">
                                        {service.description ||
                                            "Dịch vụ chăm sóc tóc chuyên nghiệp tại salon."}
                                    </p>

                                    <div className="service-meta">
                                        <span>
                                            {service.durationMinutes ||
                                                service.duration ||
                                                0}{" "}
                                            phút
                                        </span>

                                        <strong>
                                            {formatMoney(service.price)}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="service-card-button"
                                        onClick={() =>
                                            handleBooking(service.id)
                                        }
                                    >
                                        ĐẶT LỊCH
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ServiceList;