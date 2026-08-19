import axios from 'axios';
import cookies from 'react-cookies';

const BASE_URL = 'http://localhost:8080/api';

export const endpoints = {

    // =====================================================
    // AUTH
    // =====================================================

    register: '/auth/register',
    login: '/auth/login',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',

    forgotPassword: '/auth/forgot-password',
    verifyOtp: '/auth/verify-otp',
    resetPassword: '/auth/reset-password',

    changePassword: '/auth/change-password',


    // =====================================================
    // CUSTOMER
    // =====================================================

    currentCustomer: '/customers/me',
    updateCustomer: '/customers/me',


    // =====================================================
    // SERVICE - PUBLIC
    // =====================================================

    services: '/services',

    serviceDetail: (id) =>
        `/services/${id}`,

    serviceCategories: '/services/categories',

    serviceCategoryDetail: (id) =>
        `/services/categories/${id}`,


    // =====================================================
    // SERVICE - ADMIN
    // =====================================================

    adminServices: '/admin/services',

    adminServiceDetail: (id) =>
        `/admin/services/${id}`,

    adminServiceStatus: (id) =>
        `/admin/services/${id}/status`,


    // =====================================================
    // CATEGORY - ADMIN
    // =====================================================

    adminCategories: '/admin/categories',

    adminCategoryDetail: (id) =>
        `/admin/categories/${id}`,


    // =====================================================
    // STYLIST - PUBLIC
    // =====================================================

    stylists: '/stylists',

    stylistDetail: (id) =>
        `/stylists/${id}`,

    stylistServices: (stylistId) =>
        `/stylists/${stylistId}/services`,

    stylistReviews: (stylistId) =>
        `/stylists/${stylistId}/reviews`,


    // =====================================================
    // STYLIST - SCHEDULE PUBLIC
    // =====================================================

    stylistSchedule: (stylistId) =>
        `/stylists/${stylistId}/schedule`,

    availableSlots: (stylistId) =>
        `/stylists/${stylistId}/available-slots`,


    // =====================================================
    // STYLIST - ADMIN
    // =====================================================

    adminStylists: '/admin/stylists',

    adminStylistDetail: (id) =>
        `/admin/stylists/${id}`,

    adminStylistStatus: (id) =>
        `/admin/stylists/${id}/status`,

    adminSchedules: '/admin/schedules',

    adminScheduleDetail: (id) =>
        `/admin/schedules/${id}`,


    // =====================================================
    // APPOINTMENT - CUSTOMER
    // =====================================================

    appointments: '/appointments',

    myAppointments: '/appointments/my',

    myAppointmentDetail: (id) =>
        `/appointments/my/${id}`,

    cancelAppointment: (id) =>
        `/appointments/${id}/cancel`,

    rescheduleAppointment: (id) =>
        `/appointments/${id}/reschedule`,


    // =====================================================
    // APPOINTMENT - ADMIN / RECEPTIONIST
    // =====================================================

    adminAppointments: '/admin/appointments',

    adminAppointmentDetail: (id) =>
        `/admin/appointments/${id}`,

    adminAppointmentConfirm: (id) =>
        `/admin/appointments/${id}/confirm`,

    adminAppointmentCancel: (id) =>
        `/admin/appointments/${id}/cancel`,

    adminAppointmentReschedule: (id) =>
        `/admin/appointments/${id}/reschedule`,


    // =====================================================
    // APPOINTMENT - STYLIST
    // =====================================================

    stylistAppointments:
        '/stylists/me/appointments',

    stylistTodayAppointments:
        '/stylists/me/appointments/today',

    stylistAppointmentDetail: (id) =>
        `/stylists/me/appointments/${id}`,

    stylistStartAppointment: (id) =>
        `/stylists/me/appointments/${id}/start`,

    stylistCompleteAppointment: (id) =>
        `/stylists/me/appointments/${id}/complete`,

    stylistAppointmentNote: (id) =>
        `/stylists/me/appointments/${id}/note`,


    // =====================================================
    // PAYMENT
    // =====================================================

    payments: '/payments',

    vnpayCreate:
        '/payments/vnpay/create',

    momoCreate:
        '/payments/momo/create',

    zalopayCreate:
        '/payments/zalopay/create',

    mockPayment: (appointmentId) =>
        `/payments/mock/${appointmentId}`,

    paymentRefund: (paymentTransactionId) =>
        `/payments/${paymentTransactionId}/refund`,

    vnpayCallback:
        '/payments/vnpay/callback',

    momoCallback:
        '/payments/momo/callback',

    zalopayCallback:
        '/payments/zalopay/callback',


    // =====================================================
    // INVOICE - CUSTOMER
    // =====================================================

    myInvoices:
        '/invoices/my',

    invoiceDetail: (id) =>
        `/invoices/${id}`,

    invoicePdf: (id) =>
        `/invoices/${id}/pdf`,


    // =====================================================
    // INVOICE - ADMIN / RECEPTIONIST
    // =====================================================

    adminInvoices:
        '/admin/invoices',

    adminInvoiceDetail: (id) =>
        `/admin/invoices/${id}`,

    adminInvoicePdf: (id) =>
        `/admin/invoices/${id}/pdf`,


    // =====================================================
    // REVIEW
    // =====================================================

    reviews:
        '/reviews',

    reviewDetail: (id) =>
        `/reviews/${id}`,


    // =====================================================
    // NOTIFICATION
    // =====================================================

    notifications:
        '/notifications',

    unreadNotifications:
        '/notifications/unread',

    readNotification: (id) =>
        `/notifications/${id}/read`,

    readAllNotifications:
        '/notifications/read-all',

    websocket:
        '/ws',


    // =====================================================
    // PRODUCT - CUSTOMER
    // =====================================================

    products:
        '/products',

    productDetail: (id) =>
        `/products/${id}`,

    productCategories:
        '/products/categories',


    // =====================================================
    // PRODUCT - ADMIN
    // =====================================================

    adminProducts:
        '/admin/products',

    adminProductDetail: (id) =>
        `/admin/products/${id}`,

    adminProductStatus: (id) =>
        `/admin/products/${id}/status`,


    // =====================================================
    // SUPPLIER - ADMIN
    // =====================================================

    adminSuppliers:
        '/admin/suppliers',

    adminSupplierDetail: (id) =>
        `/admin/suppliers/${id}`,


    // =====================================================
    // PURCHASE ORDER
    // =====================================================

    adminPurchaseOrders:
        '/admin/purchase-orders',

    adminPurchaseOrderDetail: (id) =>
        `/admin/purchase-orders/${id}`,

    adminPurchaseOrderReceive: (id) =>
        `/admin/purchase-orders/${id}/receive`,


    // =====================================================
    // CUSTOMER MANAGEMENT - ADMIN
    // =====================================================

    adminCustomers:
        '/admin/customers',

    adminCustomerDetail: (id) =>
        `/admin/customers/${id}`,

    adminCustomerAppointments: (id) =>
        `/admin/customers/${id}/appointments`,

    adminCustomerInvoices: (id) =>
        `/admin/customers/${id}/invoices`,

    adminCustomerReviews: (id) =>
        `/admin/customers/${id}/reviews`,


    // =====================================================
    // ATTENDANCE - STYLIST
    // =====================================================

    stylistCheckIn:'/stylists/me/attendance/check-in',

    stylistCheckOut: '/stylists/me/attendance/check-out',

    stylistAttendance: '/stylists/me/attendance',

    stylistTodayAttendance: '/stylists/me/attendance/today',


    // =====================================================
    // ATTENDANCE - ADMIN
    // =====================================================

    adminAttendance: '/admin/attendance',

    adminAttendanceDetail: (id) => `/admin/attendance/${id}`,

    adminAttendanceByStylist: (stylistId) => `/admin/attendance?stylistId=${stylistId}`,

    adminAttendanceByDate: (date) => `/admin/attendance?date=${date}`,


    // =====================================================
    // USER MANAGEMENT - ADMIN
    // =====================================================

    adminUsers: '/admin/users',

    adminUserDetail: (id) => `/admin/users/${id}`,

    adminUserStatus: (id) => `/admin/users/${id}/status`,

    adminUserRole: (id) => `/admin/users/${id}/role`,

    adminUserResetPassword: (id) =>` /admin/users/${id}/reset-password`,


    // =====================================================
    // DASHBOARD
    // =====================================================

    adminDashboard: '/admin/dashboard',


    // =====================================================
    // STATISTICS - REVENUE
    // =====================================================

    revenueDaily: '/admin/statistics/revenue/daily',

    revenueMonthly: '/admin/statistics/revenue/monthly',

    revenueYearly: '/admin/statistics/revenue/yearly',


    // =====================================================
    // STATISTICS - APPOINTMENT
    // =====================================================

    appointmentStatistics: '/admin/statistics/appointments',

    appointmentStatusStatistics: '/admin/statistics/appointments/status',


    // =====================================================
    // STATISTICS - SERVICE
    // =====================================================

    topServices: '/admin/statistics/services/top',

    serviceRevenue: '/admin/statistics/services/revenue',


    // =====================================================
    // STATISTICS - STYLIST
    // =====================================================

    stylistPerformance: '/admin/statistics/stylists/performance',


    // =====================================================
    // STATISTICS - CUSTOMER
    // =====================================================

    customerStatistics:  '/admin/statistics/customers',


    // =====================================================
    // STATISTICS - PRODUCT
    // =====================================================

    topSellingProducts: '/admin/statistics/products/top-selling',

    lowStockProducts: '/admin/statistics/products/low-stock',
};


// =====================================================
// PUBLIC AXIOS
// =====================================================

export default axios.create({

    baseURL: BASE_URL,

    headers: {
        'Content-Type':   'application/json',
    },

});


// =====================================================
// AUTHENTICATED AXIOS
// =====================================================

export const authApis = () => {

    const token =
        cookies.load('accessToken');

    return axios.create({

        baseURL: BASE_URL,

        headers: {
            'Content-Type':'application/json',

            ...(token && { Authorization:  `Bearer ${token}`, }),
        },

    });
};