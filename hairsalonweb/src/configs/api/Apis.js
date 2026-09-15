import axios from 'axios';
import cookies from 'react-cookies';

const BASE_URL = 'http://localhost:8080/api';

export const endpoints = {
    register: `/auth/register`,
    login: `/auth/login`,
    refreshToken: `/auth/refresh-token`,
    forgotPassword: `/auth/forgot-password`,
    verifyOtp: `/auth/verify-otp`,
    resetPassword: `/auth/reset-password`,
    changePassword: `/auth/change-password`,
    currentCustomer: `/customers/me`,
    updateCustomer: `/customers/me`,
    services: `/services`, serviceDetail: (id) => `/services/${id}`,
    serviceCategories: `/services/categories`,
    serviceCategoryDetail: (id) => `/services/categories/${id}`,
    adminServices: `/admin/services`,
    adminServiceDetail: (id) => `/admin/services/${id}`,
    adminServiceStatus: (id) => `/admin/services/${id}/status`,
    adminCategories: `/admin/categories`,
    adminCategoryDetail: (id) => `/admin/categories/${id}`,
    stylists: `/stylists`,
    stylistDetail: (id) => `/stylists/${id}`,
    stylistServices: (stylistId) => `/stylists/${stylistId}/services`,
    stylistReviews: (stylistId) => `/stylists/${stylistId}/reviews`,
    followStylist: (stylistId) => `/stylists/${stylistId}/follow`,
    unfollowStylist: (stylistId) => `/stylists/${stylistId}/unfollow`,
    stylistSchedule: (stylistId) => `/stylists/${stylistId}/schedule`,
    availableSlots: (stylistId) => `/stylists/${stylistId}/available-slots`,
    adminStylists: `/admin/stylists`,
    adminStylistDetail: (id) => `/admin/stylists/${id}`,
    adminStylistStatus: (id) => `/admin/stylists/${id}/status`,
    adminSchedules: `/admin/schedules`,
    adminScheduleDetail: (id) => `/admin/schedules/${id}`,
    appointments: `/appointments`, myAppointments: `/appointments/my`,
    myAppointmentDetail: (id) => `/appointments/my/${id}`,
    cancelAppointment: (id) => `/appointments/${id}/cancel`,
    rescheduleAppointment: (id) => `/appointments/${id}/reschedule`,
    adminAppointments: `/admin/appointments`,
    adminAppointmentDetail: (id) => `/admin/appointments/${id}`,
    adminAppointmentConfirm: (id) => `/admin/appointments/${id}/confirm`,
    adminAppointmentCancel: (id) => `/admin/appointments/${id}/cancel`,
    adminAppointmentReschedule: (id) => `/admin/appointments/${id}/reschedule`,
    stylistAppointments: `/stylists/me/appointments`,
    stylistTodayAppointments: `/stylists/me/appointments/today`,
    stylistAppointmentDetail: (id) => `/stylists/me/appointments/${id}`,
    stylistStartAppointment: (id) => `/stylists/me/appointments/${id}/start`,
    stylistCompleteAppointment: (id) => `/stylists/me/appointments/${id}/complete`,
    stylistAppointmentNote: (id) => `/stylists/me/appointments/${id}/note`,
    stylistMySchedule: `/stylists/me/schedule`,
    stylistRevenue: `/stylists/me/statistics/revenue`,
    payments: `/payments`, payAtStore: `/admin/invoices/pay-at-store`,
    vnpayCreate: "/payments/vnpay/create",
    vnpayCreateOrder: "/payments/vnpay/create-order",
    cart: `/cart`, cartItems: `/cart/items`,
    cartItem: (productId) => `/cart/items/${productId}`,
    orders: `/orders`, myOrders: `/orders/my`,
    myOrderDetail: (id) => `/orders/${id}`,
    cancelOrder: (id) => `/orders/${id}/cancel`, myInvoices: `/invoices/my`,
    invoiceDetail: (id) => `/invoices/${id}`, adminInvoices: `/admin/invoices`,
    adminInvoiceDetail: (id) => `/admin/invoices/${id}`,
    reviews: `/reviews`, reviewDetail: (id) => `/reviews/${id}`,
    notifications: `/notifications`,
    unreadNotifications: `/notifications/unread`,
    readNotification: (id) => `/notifications/${id}/read`,
    readAllNotifications: `/notifications/read-all`,
    websocket: `/ws`,
    products: `/products`,
    productDetail: (id) => `/products/${id}`,
    productCategories: `/products/categories`,
    adminProducts: `/admin/products`,
    adminProductDetail: (id) => `/admin/products/${id}`,
    adminProductStatus: (id) => `/admin/products/${id}/status`,
    adminSuppliers: `/admin/suppliers`,
    adminSupplierDetail: (id) => `/admin/suppliers/${id}`,
    adminPurchaseOrders: `/admin/purchase-orders`,
    adminPurchaseOrderDetail: (id) => `/admin/purchase-orders/${id}`,
    adminPurchaseOrderReceive: (id) => `/admin/purchase-orders/${id}/receive`,
    adminCustomers: `/admin/customers`,
    adminCustomerDetail: (id) => `/admin/customers/${id}`,
    adminCustomerAppointments: (id) => `/admin/customers/${id}/appointments`,
    adminCustomerInvoices: (id) => `/admin/customers/${id}/invoices`,
    adminCustomerReviews: (id) => `/admin/customers/${id}/reviews`,
    stylistCheckIn: `/stylists/me/attendance/check-in`,
    stylistCheckOut: `/stylists/me/attendance/check-out`,
    stylistAttendance: `/stylists/me/attendance`,
    stylistTodayAttendance: `/stylists/me/attendance/today`,
    adminAttendance: `/admin/attendance`,
    adminAttendanceDetail: (id) => `/admin/attendance/${id}`,
    adminAttendanceByStylist: (stylistId) => `/admin/attendance?stylistId=${stylistId}`,
    adminAttendanceByDate: (date) => `/admin/attendance?date=${date}`,
    adminUsers: `/admin/users`, adminUserDetail: (id) => `/admin/users/${id}`,
    adminUserStatus: (id) => `/admin/users/${id}/status`,
    adminUserRole: (id) => `/admin/users/${id}/role`,
    adminUserResetPassword: (id) => `/admin/users/${id}/reset-password`,
    adminOrders: "/orders", adminOrderDetail: (id) => `/orders/${id}`,
    adminOrderStatus: (id) => `/admin/invoices/order/${id}/status`,
    adminStatistics: '/admin/statistics',
    adminStatisticsStats: "/admin/statistics/stats",

};

export default axios.create({

    baseURL: BASE_URL,

    headers: {
        'Content-Type': 'application/json',
    },

});

let sessionExpiredShown = false;

function clearAuthCookies() {
    const cookieNames = [
        "accessToken",
        "refreshToken",
        "userId",
        "email",
        "role",
        "fullname",
        "avatar",
    ];

    cookieNames.forEach((name) => {
        cookies.remove(name, { path: "/" });
    });
}

function notifySessionExpired() {
    if (sessionExpiredShown) {
        return;
    }

    sessionExpiredShown = true;

    clearAuthCookies();

    window.dispatchEvent(
        new CustomEvent("auth:session-expired")
    );

    setTimeout(() => {
        sessionExpiredShown = false;
    }, 1500);
}

export const authApis = () => {
    const token = cookies.load("accessToken");

    const instance = axios.create({
        baseURL: BASE_URL,
        headers: {
            ...(token && {
                Authorization: `Bearer ${token}`,
            }),
        },
    });

    instance.interceptors.response.use(
        (response) => response,

        (error) => {
            const status = error?.response?.status;
            const requestUrl = error?.config?.url || "";

            const isAuthRequest = requestUrl.startsWith("/auth/");

            if (status === 401 && !isAuthRequest) {
                notifySessionExpired();
            }

            return Promise.reject(error);
        }
    );

    return instance;
};