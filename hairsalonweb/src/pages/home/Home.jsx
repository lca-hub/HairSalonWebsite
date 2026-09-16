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

                const serviceData = servicesResponse.data;
                const stylistData = stylistsResponse.data;

                setServices(
                    Array.isArray(serviceData)
                        ? serviceData.slice(0, 3)
                        : serviceData?.content?.slice(0, 3) || []
                );

                setStylists(
                    Array.isArray(stylistData)
                        ? stylistData.slice(0, 3)
                        : stylistData?.content?.slice(0, 3) || []
                );
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
        return service?.imageUrl || service?.imageURL || "";
    };

    const getStylistImage = (stylist) => {
        return stylist?.avatar || "";
    };

    const getStylistName = (stylist) => {
        const fullName = `${stylist?.firstName || ""} ${stylist?.lastName || ""}`.trim();
        return fullName || "Stylist";
    };

    return (
        <div className="home-page">
            <Header />

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
                                    {getServiceImage(service) ? (
                                        <img
                                            src={getServiceImage(service)}
                                            alt={service.name || "Dịch vụ salon"}
                                        />
                                    ) : (
                                        <div className="service-image-empty">
                                            Dịch vụ salon
                                        </div>
                                    )}
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
                            <div className="service-empty">
                                <h3>
                                    Chưa có dịch vụ
                                </h3>

                                <p>
                                    Hiện tại chưa có dịch vụ đang hoạt động.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>


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
                                    {getStylistImage(stylist) ? (
                                        <img
                                            src={getStylistImage(stylist)}
                                            alt={getStylistName(stylist)}
                                        />
                                    ) : (
                                        <div className="stylist-image-empty">
                                            {getStylistName(stylist).charAt(0).toUpperCase()}
                                        </div>
                                    )}
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
                            <div className="stylist-empty">
                                <h3>
                                    Chưa có stylist
                                </h3>

                                <p>
                                    Hiện tại chưa có stylist đang hoạt động.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>


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