import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import "../home/Home.css";
import { authApis, endpoints } from "../../configs/api/Apis";

function Home() {
    const [services, setServices] = useState([]);
    const [stylists, setStylists] = useState([]);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const [servicesResponse, stylistsResponse] = await Promise.all([
                    authApis().get(endpoints.services, {
                        params: {
                            page: 0,
                            size: 3,
                            isActive: true,
                        },
                    }),
                    authApis().get(endpoints.stylists, {
                        params: {
                            page: 0,
                            size: 3,
                            isActive: true,
                        },
                    }),
                ]);
                if (servicesResponse.ok) {
                    const serviceData = await servicesResponse.json();
                    setServices(
                        Array.isArray(serviceData)
                            ? serviceData.slice(0, 3)
                            : serviceData?.content?.slice(0, 3) || []
                    );
                }

                if (stylistsResponse.ok) {
                    const stylistData = await stylistsResponse.json();
                    setStylists(
                        Array.isArray(stylistData)
                            ? stylistData.slice(0, 3)
                            : stylistData?.content?.slice(0, 3) || []
                    );
                }
            } catch (error) {
                console.error("LOAD HOME DATA ERROR:", error);
            }
        };

        loadHomeData();
    }, []);

    const formatMoney = (value) => {
        return Number(value || 0).toLocaleString("vi-VN") + "đ";
    };

    const getServiceImage = (service) => {
        return (
            service?.imageUrl ||
            service?.imageURL ||
            "/images/service-default.jpg"
        );
    };

    const getStylistImage = (stylist) => {
        return stylist?.avatar || "/images/stylist-default.jpg";
    };

    const getStylistName = (stylist) => {
        const fullName = `${stylist?.firstName || ""} ${stylist?.lastName || ""}`.trim();

        return fullName || "Stylist";
    };

    return (
        <div className="home-page">
            <Header />

            {/* ================= HERO ================= */}
            <section className="hero-section">
                <div className="hero-overlay"></div>

                <div className="hero-content">
                    <p className="hero-subtitle">
                        BEAUTY • STYLE • EXPERIENCE
                    </p>

                    <h1>
                        Find Your
                        <br />
                        <span>Perfect Style</span>
                    </h1>

                    <p className="hero-description">
                        Trải nghiệm dịch vụ chăm sóc tóc chuyên nghiệp
                        cùng đội ngũ stylist tận tâm.
                    </p>

                    <div className="hero-buttons">
                        <Link
                            to="/appointments/book"
                            className="hero-primary"
                        >
                            ĐẶT LỊCH NGAY
                        </Link>

                        <Link
                            to="/services"
                            className="hero-secondary"
                        >
                            XEM DỊCH VỤ
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= INTRO ================= */}
            <section className="intro-section">
                <div className="section-container">
                    <div className="section-heading">
                        <p className="section-label">
                            ABOUT US
                        </p>

                        <h2>
                            Nâng tầm phong cách
                            <br />
                            <span>của bạn</span>
                        </h2>

                        <p className="section-description">
                            Hair Salon mang đến trải nghiệm làm đẹp
                            chuyên nghiệp, hiện đại và phù hợp với
                            phong cách riêng của từng khách hàng.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= SERVICES ================= */}
            <section className="services-section">
                <div className="section-container">
                    <div className="section-top">
                        <div>
                            <p className="section-label">
                                OUR SERVICES
                            </p>

                            <h2>
                                Dịch vụ nổi bật
                            </h2>
                        </div>

                        <Link
                            to="/services"
                            className="view-all"
                        >
                            Xem tất cả →
                        </Link>
                    </div>

                    <div className="service-grid">
                        {services.map((service) => (
                            <div
                                className="service-card"
                                key={service.id}
                            >
                                <div className="service-image-placeholder">
                                    <img
                                        src={getServiceImage(service)}
                                        alt={service.name || "Dịch vụ salon"}
                                    />
                                </div>

                                <div className="service-info">
                                    <h3>
                                        {service.name}
                                    </h3>

                                    <p>
                                        {service.description ||
                                            "Dịch vụ chăm sóc tóc chuyên nghiệp tại salon."}
                                    </p>

                                    <span className="service-price">
                                        Từ {formatMoney(service.price)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {services.length === 0 && (
                            <>
                                <div className="service-card">
                                    <div className="service-image-placeholder">
                                        <img
                                            src="/images/service-default.jpg"
                                            alt="Dịch vụ salon"
                                        />
                                    </div>

                                    <div className="service-info">
                                        <h3>
                                            Dịch vụ salon
                                        </h3>

                                        <p>
                                            Khám phá các dịch vụ chăm sóc tóc
                                            chuyên nghiệp tại salon.
                                        </p>
                                    </div>
                                </div>

                                <div className="service-card">
                                    <div className="service-image-placeholder">
                                        <img
                                            src="/images/service-default.jpg"
                                            alt="Dịch vụ salon"
                                        />
                                    </div>

                                    <div className="service-info">
                                        <h3>
                                            Dịch vụ salon
                                        </h3>

                                        <p>
                                            Khám phá các dịch vụ chăm sóc tóc
                                            chuyên nghiệp tại salon.
                                        </p>
                                    </div>
                                </div>

                                <div className="service-card">
                                    <div className="service-image-placeholder">
                                        <img
                                            src="/images/service-default.jpg"
                                            alt="Dịch vụ salon"
                                        />
                                    </div>

                                    <div className="service-info">
                                        <h3>
                                            Dịch vụ salon
                                        </h3>

                                        <p>
                                            Khám phá các dịch vụ chăm sóc tóc
                                            chuyên nghiệp tại salon.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ================= STYLIST ================= */}
            <section className="stylist-section">
                <div className="section-container">
                    <div className="section-top">
                        <div>
                            <p className="section-label">
                                OUR STYLISTS
                            </p>

                            <h2>
                                Đội ngũ stylist
                            </h2>
                        </div>

                        <Link
                            to="/stylists"
                            className="view-all"
                        >
                            Xem tất cả →
                        </Link>
                    </div>

                    <div className="stylist-grid">
                        {stylists.map((stylist) => (
                            <div
                                className="stylist-card"
                                key={stylist.id}
                            >
                                <div className="stylist-image-placeholder">
                                    <img
                                        src={getStylistImage(stylist)}
                                        alt={getStylistName(stylist)}
                                    />
                                </div>

                                <h3>
                                    {getStylistName(stylist)}
                                </h3>

                                <p>
                                    {stylist.specialization ||
                                        "Hair Designer"}
                                </p>
                            </div>
                        ))}

                        {stylists.length === 0 && (
                            <>
                                <div className="stylist-card">
                                    <div className="stylist-image-placeholder">
                                        <img
                                            src="/images/stylist-default.jpg"
                                            alt="Stylist"
                                        />
                                    </div>

                                    <h3>
                                        Stylist
                                    </h3>

                                    <p>
                                        Hair Designer
                                    </p>
                                </div>

                                <div className="stylist-card">
                                    <div className="stylist-image-placeholder">
                                        <img
                                            src="/images/stylist-default.jpg"
                                            alt="Stylist"
                                        />
                                    </div>

                                    <h3>
                                        Stylist
                                    </h3>

                                    <p>
                                        Hair Designer
                                    </p>
                                </div>

                                <div className="stylist-card">
                                    <div className="stylist-image-placeholder">
                                        <img
                                            src="/images/stylist-default.jpg"
                                            alt="Stylist"
                                        />
                                    </div>

                                    <h3>
                                        Stylist
                                    </h3>

                                    <p>
                                        Hair Designer
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="booking-section">
                <div className="booking-content">
                    <p className="section-label">
                        BOOK YOUR APPOINTMENT
                    </p>

                    <h2>
                        Sẵn sàng cho diện mạo mới?
                    </h2>

                    <p>
                        Chọn stylist yêu thích và đặt lịch
                        ngay hôm nay.
                    </p>

                    <Link
                        to="/appointments/book"
                        className="booking-button"
                    >
                        ĐẶT LỊCH NGAY
                    </Link>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="home-footer">
                <div className="section-container">
                    <div className="footer-grid">
                        <div>
                            <h3>
                                HAIR SALON
                            </h3>

                            <p>
                                Beauty • Style • Experience
                            </p>
                        </div>

                        <div>
                            <h4>
                                Liên kết
                            </h4>

                            <Link to="/">
                                Trang chủ
                            </Link>

                            <Link to="/services">
                                Dịch vụ
                            </Link>

                            <Link to="/stylists">
                                Stylist
                            </Link>

                            <Link to="/products">
                                Sản phẩm
                            </Link>
                        </div>

                        <div>
                            <h4>
                                Hỗ trợ
                            </h4>

                            <Link to="/login">
                                Đăng nhập
                            </Link>

                            <Link to="/register">
                                Đăng ký
                            </Link>
                        </div>

                        <div>
                            <h4>
                                Liên hệ
                            </h4>

                            <p>
                                Hotline: 0900 000 000
                            </p>

                            <p>
                                Email: hairsalon@gmail.com
                            </p>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        © 2026 Hair Salon. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;