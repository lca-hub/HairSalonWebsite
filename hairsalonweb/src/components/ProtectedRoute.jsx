import { Navigate, Outlet, useLocation } from "react-router-dom";
import cookies from "react-cookies";

export function decodeToken(token) {
    try {
        const payload = token?.split(".")[1];
        if (!payload) return null;

        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(
            decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((char) => `%${("00" + char.charCodeAt(0).toString(16)).slice(-2)}`)
                    .join("")
            )
        );
    } catch {
        return null;
    }
}

export function getRoleFromToken(payload) {
    return (
        payload?.role ||
        payload?.roles?.[0] ||
        payload?.authorities?.[0]?.replace("ROLE_", "") ||
        null
    );
}

export function clearSession() {
    ["accessToken", "refreshToken", "userId", "email", "role", "fullname", "avatar"].forEach(
        (key) => cookies.remove(key, { path: "/" })
    );
}

function ProtectedRoute({ roles }) {
    const location = useLocation();
    const token = cookies.load("accessToken");

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    const payload = decodeToken(token);
    const role = getRoleFromToken(payload);

    if (!payload || (payload.exp && payload.exp * 1000 <= Date.now()) || !role) {
        const isExpired = Boolean(payload?.exp && payload.exp * 1000 <= Date.now());

        clearSession();

        if (isExpired) {
            sessionStorage.setItem("authSessionExpired", "true");
        }

        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (roles && !roles.includes(role)) {
        return <Navigate to={getHomeByRole(role)} replace />;
    }

    return <Outlet />;
}

export function getHomeByRole(role) {
    switch (role) {
        case "ADMIN":
            return "/admin";
        case "RECEPTIONIST":
            return "/receptionist";
        case "STYLIST":
            return "/stylist";
        case "CUSTOMER":
            return "/customer";
        default:
            return "/login";
    }
}

export default ProtectedRoute;
