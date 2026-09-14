import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SessionExpiredModal.css";

function SessionExpiredModal() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleExpired = () => {
            setOpen(true);
        };

        if (sessionStorage.getItem("authSessionExpired") === "true") {
            sessionStorage.removeItem("authSessionExpired");
            setOpen(true);
        }

        window.addEventListener("auth:session-expired", handleExpired);

        return () => {
            window.removeEventListener("auth:session-expired", handleExpired);
        };
    }, []);

    const handleLogin = () => {
        setOpen(false);
        navigate("/login", { replace: true });
    };

    if (!open) return null;

    return (
        <div className="session-expired-backdrop" role="presentation">
            <div
                className="session-expired-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="session-expired-title"
            >
                <div className="session-expired-icon">!</div>

                <div className="session-expired-content">
                    <span className="session-expired-eyebrow">PHIÊN ĐĂNG NHẬP</span>
                    <h2 id="session-expired-title">Phiên đăng nhập đã hết hạn</h2>
                    <p>
                        Vì lý do bảo mật, phiên đăng nhập của bạn đã hết hạn.
                        Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.
                    </p>
                </div>

                <button
                    type="button"
                    className="session-expired-login"
                    onClick={handleLogin}
                >
                    Đăng nhập lại
                </button>
            </div>
        </div>
    );
}

export default SessionExpiredModal;
