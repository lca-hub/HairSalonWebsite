import { Link } from "react-router-dom";
import Header from "../../components/Header";
import "../home/Home.css";

function Home() {
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

                            <h2>Dịch vụ nổi bật</h2>
                        </div>

                        <Link
                            to="/services"
                            className="view-all"
                        >
                            Xem tất cả →
                        </Link>

                    </div>


                    <div className="service-grid">

                        <div className="service-card">
                            <div className="service-image-placeholder">
                                SERVICE IMAGE
                            </div>

                            <div className="service-info">
                                <h3>Cắt & Tạo kiểu</h3>

                                <p>
                                    Tạo kiểu phù hợp với khuôn mặt
                                    và phong cách của bạn.
                                </p>

                                <span className="service-price">
                                    Từ 150.000đ
                                </span>
                            </div>
                        </div>


                        <div className="service-card">
                            <div className="service-image-placeholder">
                                SERVICE IMAGE
                            </div>

                            <div className="service-info">
                                <h3>Nhuộm tóc</h3>

                                <p>
                                    Màu tóc thời trang với sản phẩm
                                    chất lượng cao.
                                </p>

                                <span className="service-price">
                                    Từ 400.000đ
                                </span>
                            </div>
                        </div>


                        <div className="service-card">
                            <div className="service-image-placeholder">
                                SERVICE IMAGE
                            </div>

                            <div className="service-info">
                                <h3>Phục hồi tóc</h3>

                                <p>
                                    Chăm sóc chuyên sâu giúp mái tóc
                                    khỏe và bóng mượt.
                                </p>

                                <span className="service-price">
                                    Từ 300.000đ
                                </span>
                            </div>
                        </div>

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

                            <h2>Đội ngũ stylist</h2>
                        </div>

                        <Link
                            to="/stylists"
                            className="view-all"
                        >
                            Xem tất cả →
                        </Link>

                    </div>


                    <div className="stylist-grid">

                        <div className="stylist-card">
                            <div className="stylist-image-placeholder">
                                STYLIST IMAGE
                            </div>

                            <h3>Stylist</h3>
                            <p>Hair Designer</p>
                        </div>


                        <div className="stylist-card">
                            <div className="stylist-image-placeholder">
                                STYLIST IMAGE
                            </div>

                            <h3>Stylist</h3>
                            <p>Hair Designer</p>
                        </div>


                        <div className="stylist-card">
                            <div className="stylist-image-placeholder">
                                STYLIST IMAGE
                            </div>

                            <h3>Stylist</h3>
                            <p>Hair Designer</p>
                        </div>

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
                            <h3>HAIR SALON</h3>

                            <p>
                                Beauty • Style • Experience
                            </p>
                        </div>

                        <div>
                            <h4>Liên kết</h4>

                            <Link to="/">Trang chủ</Link>
                            <Link to="/services">Dịch vụ</Link>
                            <Link to="/stylists">Stylist</Link>
                            <Link to="/products">Sản phẩm</Link>
                        </div>

                        <div>
                            <h4>Hỗ trợ</h4>

                            <Link to="/login">Đăng nhập</Link>
                            <Link to="/register">Đăng ký</Link>
                        </div>

                        <div>
                            <h4>Liên hệ</h4>

                            <p>Hotline: 0900 000 000</p>
                            <p>Email: hairsalon@gmail.com</p>
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