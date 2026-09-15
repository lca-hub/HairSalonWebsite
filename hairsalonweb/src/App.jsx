import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/home/Login";
import Register from "./pages/home/Register";
import Home from "./pages/home/Home";

import StylistList from "./pages/customer/StylistList";
import StylistDetail from "./pages/customer/StylistDetail";
import BookingScreen from "./pages/customer/BookingScreen";
import CustomerHome from "./pages/customer/CustomerHome";

import ProtectedRoute from "./components/ProtectedRoute";
import ComingSoon from "./pages/common/ComingSoon";
import AccountPage from "./pages/common/AccountPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminAppointment from "./pages/admin/AdminAppointment";
import AdminServices from "./pages/admin/AdminServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import SessionExpiredModal from "./components/SessionExpiredModal";
import AdminPurchaseOrders from "./pages/admin/AdminPurchaseOrders";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminStatistics from "./pages/admin/AdminStatistics";
import PaymentVnpayReturn from "./pages/customer/PaymentVnpayReturn";
import ServiceList from "./pages/customer/ServiceList";

function App() {
  return (
    <BrowserRouter>
      <SessionExpiredModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stylists" element={<StylistList />} />
        <Route path="/stylists/:id" element={<StylistDetail />} />
        <Route path="/services" element={<ServiceList />} />
        <Route path="/payment/vnpay/return" element={<PaymentVnpayReturn />} />

        {/* =========================
            CUSTOMER
        ========================= */}
        <Route element={<ProtectedRoute roles={["CUSTOMER"]} />}>
          <Route path="/customer/profile" element={<CustomerHome />} />
          <Route path="/customer/appointments" element={<CustomerHome />} />
          <Route path="/customer/appointments/:id" element={<CustomerHome />} />
          <Route path="/appointments/book" element={<BookingScreen />} />
          <Route path="/products" element={<ComingSoon title="Sản phẩm & cửa hàng" role="CUSTOMER" />} />
          <Route path="/customer/cart" element={<ComingSoon title="Giỏ hàng" role="CUSTOMER" />} />
          <Route path="/customer/orders" element={<ComingSoon title="Đơn hàng" role="CUSTOMER" />} />
          <Route path="/customer/invoices" element={<ComingSoon title="Hóa đơn" role="CUSTOMER" />} />
          <Route path="/customer/notifications" element={<ComingSoon title="Thông báo" role="CUSTOMER" />} />
        </Route>


        {/* =========================
            ADMIN
        ========================= */}
        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/schedules" element={<AdminSchedules />} />
          <Route path="/admin/appointments" element={<AdminAppointment />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/purchase-orders" element={<AdminPurchaseOrders />} />
          <Route path="/admin/invoices" element={<AdminInvoices />} />
          <Route path="/admin/statistics" element={<AdminStatistics />} />

          {/* Admin profile */}
          <Route path="/admin/profile" element={<AccountPage />} />

        </Route>


        {/* =========================
            RECEPTIONIST
        ========================= */}
        <Route element={<ProtectedRoute roles={["RECEPTIONIST"]} />}>

          <Route path="/receptionist" element={<ComingSoon title="Khu vực lễ tân" role="RECEPTIONIST" />} />
          <Route path="/receptionist/profile" element={<AccountPage />} />
          <Route path="/receptionist/*" element={<ComingSoon title="Chức năng lễ tân" role="RECEPTIONIST" />} />

        </Route>


        {/* =========================
            STYLIST
        ========================= */}
        <Route element={<ProtectedRoute roles={["STYLIST"]} />}>

          <Route path="/stylist" element={<ComingSoon title="Khu vực stylist" role="STYLIST" />} />
          <Route path="/stylist/profile" element={<AccountPage />} />
          <Route path="/stylist/*" element={<ComingSoon title="Chức năng stylist" role="STYLIST" />} />

        </Route>


        {/* =========================
            404
        ========================= */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;