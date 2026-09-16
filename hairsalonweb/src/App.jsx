import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/home/Login";
import Register from "./pages/home/Register";
import Home from "./pages/home/Home";

import StylistList from "./pages/dashboard/StylistList";
import StylistDetail from "./pages/dashboard/StylistDetail";
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
import ServiceList from "./pages/dashboard/ServiceList";
import CartPage from "./pages/customer/CartPage";
import ProductList from "./pages/dashboard/ProductList";
import OrderPaymentPage from "./pages/customer/OrderPaymentPage";
import OrderListPage from "./pages/customer/OrderListPage";
import OrderDetailPage from "./pages/customer/OrderDetailPage";
import NotificationPage from "./pages/customer/NotificationPage";
import StylistDashboard from "./pages/stylist/StylistDashboard";
import StylistAppointments from "./pages/stylist/StylistAppointments";
import StylistSchedule from "./pages/stylist/StylistSchedule";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import ReceptionistAppointments from "./pages/receptionist/ReceptionistAppointments";
import ReceptionistCustomers from "./pages/receptionist/ReceptionistCustomers";
import ReceptionistInvoices from "./pages/receptionist/ReceptionistInvoices";
import ReceptionistProductSale from "./pages/receptionist/ReceptionistProductSale";

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
        <Route path="/products" element={<ProductList />} />


        <Route element={<ProtectedRoute roles={["CUSTOMER"]} />}>
          <Route path="/customer/profile" element={<CustomerHome />} />
          <Route path="/customer/appointments" element={<CustomerHome />} />
          <Route path="/customer/appointments/:id" element={<CustomerHome />} />
          <Route path="/appointments/book" element={<BookingScreen />} />
          <Route path="/customer/cart" element={<CartPage />} />
          <Route path="/customer/order-payment" element={<OrderPaymentPage />} />
          <Route path="/customer/orders" element={<OrderListPage />} />
          <Route path="/customer/orders/:id" element={<OrderDetailPage />} />
          <Route path="/customer/invoices" element={<ComingSoon title="Hóa đơn" role="CUSTOMER" />} />
          <Route path="/customer/notifications" element={<NotificationPage />} />
        </Route>

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

          <Route path="/admin/profile" element={<AccountPage />} />

        </Route>


        <Route element={<ProtectedRoute roles={["RECEPTIONIST"]} />}>

          <Route path="/receptionist" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/profile" element={<AccountPage />} />
          <Route path="/receptionist/customers" element={<ReceptionistCustomers />} />
          <Route path="/receptionist/invoices" element={<ReceptionistInvoices />} />
          <Route path="/receptionist/sales" element={<ReceptionistProductSale />} />
          <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
        </Route>



        <Route element={<ProtectedRoute roles={["STYLIST"]} />}>

          <Route path="/stylist" element={<StylistDashboard />} />
          <Route path="/stylist/appointments" element={<StylistAppointments />} />
          <Route path="/stylist/schedule" element={<StylistSchedule />} />
          <Route path="/stylist/profile" element={<AccountPage />} />
          <Route path="/stylist/*" element={<ComingSoon title="Chức năng stylist" role="STYLIST" />} />

        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;