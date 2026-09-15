import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import Header from "../../components/Header";
import "./NotificationPage.css";

function NotificationPage() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [markingId, setMarkingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(endpoints.notifications, {
                params: {
                    page: 0,
                    size: 50,
                },
            });

            setNotifications(response.data?.content || []);
        } catch (err) {
            console.error("LOAD NOTIFICATIONS ERROR:", err);

            if (err.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }

            setError(
                err.response?.data?.message ||
                "Không thể tải thông báo."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const response = await authApis().get("/notifications/unread/count");
            setUnreadCount(Number(response.data || 0));
        } catch (err) {
            console.error("LOAD NOTIFICATION COUNT ERROR:", err);
        }
    };

    useEffect(() => {
        loadNotifications();
        loadUnreadCount();
    }, []);

    const formatDateTime = (value) => {
        if (!value) {
            return "--";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const markAsRead = async (notification) => {
        if (notification.isRead) {
            return;
        }

        try {
            setMarkingId(notification.id);
            setError("");

            const response = await authApis().put(
                endpoints.readNotification(notification.id)
            );

            setNotifications((current) =>
                current.map((item) =>
                    item.id === notification.id
                        ? response.data
                        : item
                )
            );

            setUnreadCount((current) => Math.max(0, current - 1));
        } catch (err) {
            console.error("MARK NOTIFICATION READ ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Không thể cập nhật thông báo."
            );
        } finally {
            setMarkingId(null);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount <= 0) {
            return;
        }

        try {
            setMarkingAll(true);
            setError("");

            await authApis().put(endpoints.readAllNotifications);

            setNotifications((current) =>
                current.map((item) => ({
                    ...item,
                    isRead: true,
                }))
            );

            setUnreadCount(0);
        } catch (err) {
            console.error("MARK ALL NOTIFICATIONS READ ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Không thể đánh dấu tất cả thông báo."
            );
        } finally {
            setMarkingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="notification-page">
                <Header />

                <main className="notification-main">
                    <div className="notification-shell">
                        <div className="notification-loading">
                            <div className="notification-spinner"></div>
                            <p>Đang tải thông báo...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="notification-page">
            <Header />

            <main className="notification-main">
                <div className="notification-shell">

                    <div className="notification-breadcrumb">
                        <button type="button" onClick={() => navigate("/")}>Trang chủ</button>
                        <span>/</span>
                        <span>Thông báo</span>
                    </div>

                    <div className="notification-header">
                        <div>
                            <span className="notification-eyebrow">NOTIFICATIONS</span>
                            <h1>Thông báo</h1>
                            <p>Cập nhật mới nhất về lịch hẹn, thanh toán và đơn hàng của bạn.</p>
                        </div>

                        {unreadCount > 0 && (
                            <button type="button" className="notification-read-all" onClick={markAllAsRead} disabled={markingAll}>{markingAll ? "ĐANG XỬ LÝ..." : "ĐÁNH DẤU ĐÃ ĐỌC"}</button>
                        )}
                    </div>

                    {error && (
                        <div className="notification-alert">{error}</div>
                    )}

                    <div className="notification-summary">
                        <span>Tổng thông báo</span>
                        <strong>{notifications.length}</strong>
                        <span>Chưa đọc</span>
                        <strong className="notification-unread-number">{unreadCount}</strong>
                    </div>

                    {notifications.length === 0 ? (
                        <section className="notification-empty">
                            <div className="notification-empty-icon">♧</div>
                            <h2>Chưa có thông báo</h2>
                            <p>Khi có cập nhật mới, thông báo sẽ xuất hiện tại đây.</p>
                        </section>
                    ) : (
                        <section className="notification-list">

                            {notifications.map((notification) => {
                                const isUnread = !notification.isRead;
                                const isMarking = markingId === notification.id;

                                return (
                                    <article className={`notification-item ${isUnread ? "unread" : ""}`} key={notification.id}>

                                        <div className="notification-icon">
                                            {isUnread ? "!" : "✓"}
                                        </div>

                                        <div className="notification-content">
                                            <div className="notification-title-row">
                                                <h2>{notification.title}</h2>
                                                {isUnread && <span className="notification-new">MỚI</span>}
                                            </div>

                                            <p>{notification.message}</p>

                                            <span className="notification-time">{formatDateTime(notification.createdAt)}</span>
                                        </div>

                                        {isUnread && (
                                            <button type="button" className="notification-read-button" onClick={() => markAsRead(notification)} disabled={isMarking}>{isMarking ? "..." : "ĐÃ ĐỌC"}</button>
                                        )}

                                    </article>
                                );
                            })}

                        </section>
                    )}

                </div>
            </main>
        </div>
    );
}

export default NotificationPage;