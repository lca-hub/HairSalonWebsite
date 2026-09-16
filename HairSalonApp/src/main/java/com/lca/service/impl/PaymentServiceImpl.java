package com.lca.service.impl;

import com.lca.dtos.response.PaymentUrlResponseDTO;
import com.lca.entity.Appointment;
import com.lca.entity.Customer;
import com.lca.entity.Invoice;
import com.lca.entity.InvoiceItem;
import com.lca.entity.PaymentTransaction;
import com.lca.entity.ProductOrder;
import com.lca.entity.ProductOrderItem;
import com.lca.entity.User;
import com.lca.enums.AppointmentStatus;
import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import com.lca.enums.ProductOrderStatus;
import com.lca.repository.AppointmentRepository;
import com.lca.repository.AppointmentSlotRepository;
import com.lca.repository.CustomerRepository;
import com.lca.repository.InvoiceRepository;
import com.lca.repository.PaymentTransactionRepository;
import com.lca.repository.ProductOrderRepository;
import com.lca.repository.UserRepository;
import com.lca.service.EmailService;
import com.lca.service.NotificationService;
import com.lca.service.PaymentService;
import com.lca.service.ProductOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final AppointmentRepository appointmentRepo;
    private final AppointmentSlotRepository appointmentSlotRepo;
    private final InvoiceRepository invoiceRepo;
    private final PaymentTransactionRepository paymentTransactionRepo;
    private final ProductOrderRepository productOrderRepo;
    private final CustomerRepository customerRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final ProductOrderService productOrderService;
    private final EmailService emailService;

    @Value("${vnpay.pay-url}")
    private String vnpayPayUrl;

    @Value("${vnpay.tmn-code}")
    private String vnpayTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpayHashSecret;

    @Value("${vnpay.return-url}")
    private String vnpayReturnUrl;

    @Value("${vnpay.ipn-url}")
    private String vnpayIpnUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public PaymentUrlResponseDTO createVnpayPayment(String email, Long appointmentId, String clientIp) {
        Customer customer = getCustomerByEmail(email);

        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy appointment"));

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Appointment không thuộc customer này");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Appointment không ở trạng thái chờ thanh toán");
        }

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);

        if (appointment.getPaymentDeadline() == null) {
            throw new RuntimeException("Lịch hẹn không có thời gian thanh toán.");
        }

        if (now.isAfter(appointment.getPaymentDeadline())) {
            cancelExpiredPayment(appointment);
            throw new RuntimeException("Thời gian thanh toán đã hết. Lịch hẹn đã tự động hủy. Vui lòng đặt lịch mới.");
        }

        BigDecimal amount = appointment.getBookingAmount();

        if (amount == null || amount.signum() <= 0) {
            throw new RuntimeException("Số tiền thanh toán không hợp lệ");
        }

        Invoice invoice = invoiceRepo.findByAppointmentId(appointment.getId())
                .orElseGet(() -> createPendingInvoice(appointment, customer));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Appointment đã được thanh toán");
        }

        invoice.setPaymentMethod(PaymentMethod.VNPAY);
        invoice.setPaymentStatus(PaymentStatus.PENDING);

        if (invoice.getTotalAmount() == null || invoice.getTotalAmount().signum() <= 0) {
            invoice.setSubTotal(amount);
            invoice.setDiscountAmount(BigDecimal.ZERO);
            invoice.setTotalAmount(amount);
            invoice.setRefundAmount(BigDecimal.ZERO);
        }

        invoice.setCreatedAt(invoice.getCreatedAt() == null ? now : invoice.getCreatedAt());

        Invoice savedInvoice = invoiceRepo.saveAndFlush(invoice);

        PaymentTransaction transaction = getOrCreatePendingTransaction(savedInvoice, amount);

        String txnRef = transaction.getTransactionNo();
        LocalDateTime expireDate = appointment.getPaymentDeadline();

        SortedMap<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayTmnCode);
        params.put("vnp_Amount", amount.multiply(BigDecimal.valueOf(100)).longValueExact() + "");
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan lich hen " + appointment.getAppointmentCode());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpayReturnUrl);
        params.put("vnp_IpAddr", normalizeIp(clientIp));
        params.put("vnp_CreateDate", VNPAY_DATE_FORMAT.format(now));
        params.put("vnp_ExpireDate", VNPAY_DATE_FORMAT.format(expireDate));

        String hashData = buildHashData(params);
        String secureHash = hmacSHA512(vnpayHashSecret, hashData);
        String queryString = buildQueryString(params);

        String paymentUrl = vnpayPayUrl
                + "?"
                + queryString
                + "&vnp_SecureHash="
                + URLEncoder.encode(secureHash, StandardCharsets.UTF_8);

        return new PaymentUrlResponseDTO(
                appointment.getId(),
                null,
                savedInvoice.getId(),
                transaction.getTransactionNo(),
                paymentUrl
        );
    }

    public PaymentUrlResponseDTO createVnpayProductOrderPayment(String email, Long orderId, String clientIp) {
        Customer customer = getCustomerByEmail(email);

        ProductOrder order = productOrderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy product order"));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Đơn hàng không thuộc customer này");
        }

        if (order.getOrderStatus() == null) {
            throw new RuntimeException("Trạng thái đơn hàng không hợp lệ");
        }

        if (order.getOrderStatus().name().equals("CANCELLED")) {
            throw new RuntimeException("Đơn hàng đã bị hủy");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Đơn hàng đã được thanh toán");
        }

        if (order.getTotalAmount() == null || order.getTotalAmount().signum() <= 0) {
            throw new RuntimeException("Số tiền thanh toán không hợp lệ");
        }

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);
        LocalDateTime expireDate = now.plusMinutes(10);

        Invoice invoice = invoiceRepo.findByProductOrderId(order.getId())
                .orElseGet(() -> createPendingProductOrderInvoice(order, customer));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Đơn hàng đã được thanh toán");
        }

        invoice.setPaymentMethod(PaymentMethod.VNPAY);
        invoice.setPaymentStatus(PaymentStatus.PENDING);
        invoice.setSubTotal(order.getSubTotal());
        invoice.setDiscountAmount(order.getDiscountAmount());
        invoice.setTotalAmount(order.getTotalAmount());
        invoice.setRefundAmount(BigDecimal.ZERO);
        invoice.setCreatedAt(invoice.getCreatedAt() == null ? now : invoice.getCreatedAt());

        Invoice savedInvoice = invoiceRepo.saveAndFlush(invoice);

        PaymentTransaction transaction = getOrCreatePendingTransaction(savedInvoice, order.getTotalAmount());

        String txnRef = transaction.getTransactionNo();

        SortedMap<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayTmnCode);
        params.put("vnp_Amount", order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValueExact() + "");
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpayReturnUrl);
        params.put("vnp_IpAddr", normalizeIp(clientIp));
        params.put("vnp_CreateDate", VNPAY_DATE_FORMAT.format(now));
        params.put("vnp_ExpireDate", VNPAY_DATE_FORMAT.format(expireDate));

        String hashData = buildHashData(params);
        String secureHash = hmacSHA512(vnpayHashSecret, hashData);
        String queryString = buildQueryString(params);

        String paymentUrl = vnpayPayUrl
                + "?"
                + queryString
                + "&vnp_SecureHash="
                + URLEncoder.encode(secureHash, StandardCharsets.UTF_8);

        return new PaymentUrlResponseDTO(
                null,
                order.getId(),
                savedInvoice.getId(),
                transaction.getTransactionNo(),
                paymentUrl
        );
    }

    @Override
    public String handleVnpayReturn(Map<String, String> params) {
        boolean valid = verifySignature(params);

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");

        if (!valid) {
            return buildFrontendRedirect(false, "invalid_signature", txnRef);
        }

        boolean success = "00".equals(responseCode) && "00".equals(transactionStatus);

        if (success) {
            processSuccessfulPayment(params);
        } else {
            processFailedPayment(params);
        }

        return buildFrontendRedirect(success, success ? "success" : "failed", txnRef);
    }

    @Override
    public String handleVnpayIpn(Map<String, String> params) {
        if (!verifySignature(params)) {
            return "{\"RspCode\":\"97\",\"Message\":\"Invalid signature\"}";
        }

        String txnRef = params.get("vnp_TxnRef");

        PaymentTransaction transaction = paymentTransactionRepo.findByTransactionNo(txnRef)
                .orElse(null);

        if (transaction == null) {
            return "{\"RspCode\":\"01\",\"Message\":\"Transaction not found\"}";
        }

        BigDecimal receivedAmount = parseVnpayAmount(params.get("vnp_Amount"));

        if (receivedAmount == null) {
            return "{\"RspCode\":\"04\",\"Message\":\"Invalid amount\"}";
        }

        if (transaction.getAmount().compareTo(receivedAmount) != 0) {
            return "{\"RspCode\":\"04\",\"Message\":\"Invalid amount\"}";
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");

        boolean success = "00".equals(responseCode) && "00".equals(transactionStatus);

        if (success) {
            processSuccessfulPayment(params);
        } else {
            processFailedPayment(params);
        }

        return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
    }

    private Invoice createPendingInvoice(Appointment appointment, Customer customer) {
        Invoice invoice = new Invoice();

        invoice.setAppointment(appointment);
        invoice.setProductOrder(null);
        invoice.setCustomer(customer);
        invoice.setInvoiceCode("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        BigDecimal amount = appointment.getBookingAmount();

        invoice.setSubTotal(amount);
        invoice.setDiscountAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(amount);
        invoice.setRefundAmount(BigDecimal.ZERO);
        invoice.setPaymentMethod(PaymentMethod.VNPAY);
        invoice.setPaymentStatus(PaymentStatus.PENDING);
        invoice.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

        InvoiceItem item = new InvoiceItem();
        item.setInvoice(invoice);
        item.setService(appointment.getService());
        item.setQuantity(1);
        item.setUnitPrice(amount);
        item.setTotalPrice(amount);

        invoice.getItems().add(item);

        return invoice;
    }

    private Invoice createPendingProductOrderInvoice(ProductOrder order, Customer customer) {
        Invoice invoice = new Invoice();

        invoice.setAppointment(null);
        invoice.setProductOrder(order);
        invoice.setCustomer(customer);
        invoice.setInvoiceCode("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        invoice.setSubTotal(order.getSubTotal());
        invoice.setDiscountAmount(order.getDiscountAmount());
        invoice.setTotalAmount(order.getTotalAmount());
        invoice.setRefundAmount(BigDecimal.ZERO);
        invoice.setPaymentMethod(PaymentMethod.VNPAY);
        invoice.setPaymentStatus(PaymentStatus.PENDING);
        invoice.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

        if (order.getItems() != null) {
            for (ProductOrderItem orderItem : order.getItems()) {
                InvoiceItem invoiceItem = new InvoiceItem();

                invoiceItem.setInvoice(invoice);
                invoiceItem.setProduct(orderItem.getProduct());
                invoiceItem.setService(null);
                invoiceItem.setQuantity(orderItem.getQuantity());
                invoiceItem.setUnitPrice(orderItem.getUnitPrice());
                invoiceItem.setTotalPrice(orderItem.getTotalPrice());

                invoice.getItems().add(invoiceItem);
            }
        }

        return invoice;
    }

    private PaymentTransaction getOrCreatePendingTransaction(Invoice invoice, BigDecimal amount) {
        return paymentTransactionRepo.findByInvoiceId(invoice.getId())
                .stream()
                .filter(transaction -> transaction.getPaymentStatus() == PaymentStatus.PENDING)
                .findFirst()
                .orElseGet(() -> {
                    PaymentTransaction transaction = new PaymentTransaction();

                    transaction.setInvoice(invoice);
                    transaction.setTransactionNo("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    transaction.setAmount(amount);
                    transaction.setPaymentMethod(PaymentMethod.VNPAY);
                    transaction.setPaymentStatus(PaymentStatus.PENDING);
                    transaction.setTransactionTime(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

                    return paymentTransactionRepo.saveAndFlush(transaction);
                });
    }

    private void processSuccessfulPayment(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");

        PaymentTransaction transaction = paymentTransactionRepo.findByTransactionNo(txnRef)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment transaction"));

        Invoice invoice = transaction.getInvoice();

        BigDecimal receivedAmount = parseVnpayAmount(params.get("vnp_Amount"));

        if (receivedAmount == null || transaction.getAmount().compareTo(receivedAmount) != 0) {
            throw new RuntimeException("Số tiền giao dịch không hợp lệ");
        }

        if (transaction.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            transaction.setPaymentStatus(PaymentStatus.PAID);
            paymentTransactionRepo.save(transaction);
            return;
        }

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);

        if (invoice.getAppointment() != null) {
            processSuccessfulAppointmentPayment(transaction, invoice, now);
            return;
        }

        if (invoice.getProductOrder() != null) {
            processSuccessfulProductOrderPayment(transaction, invoice, now);
            return;
        }

        throw new RuntimeException("Invoice không liên kết với appointment hoặc product order");
    }

    private void processSuccessfulAppointmentPayment(
            PaymentTransaction transaction,
            Invoice invoice,
            LocalDateTime now
    ) {
        Appointment appointment = invoice.getAppointment();

        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.EXPIRED) {
            throw new RuntimeException("Appointment không còn hợp lệ để xác nhận thanh toán");
        }

        if (appointment.getPaymentDeadline() != null
                && now.isAfter(appointment.getPaymentDeadline())) {
            cancelExpiredPayment(appointment);
            throw new RuntimeException("Thời gian thanh toán đã hết. Lịch hẹn đã tự động hủy.");
        }

        transaction.setPaymentStatus(PaymentStatus.PAID);
        transaction.setTransactionTime(now);

        invoice.setPaymentMethod(PaymentMethod.VNPAY);
        invoice.setPaymentStatus(PaymentStatus.PAID);

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setPaymentDeadline(null);

        paymentTransactionRepo.save(transaction);
        invoiceRepo.save(invoice);
        appointmentRepo.save(appointment);

        notifyPaymentSuccess(appointment);
    }

    private void processSuccessfulProductOrderPayment(PaymentTransaction transaction, Invoice invoice, LocalDateTime now) {
        ProductOrder order = invoice.getProductOrder();

        if (order == null) {
            throw new RuntimeException("Invoice không có product order");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            transaction.setPaymentStatus(PaymentStatus.PAID);
            transaction.setTransactionTime(now);
            paymentTransactionRepo.save(transaction);

            if (invoice.getPaymentStatus() != PaymentStatus.PAID) {
                invoice.setPaymentStatus(PaymentStatus.PAID);
                invoiceRepo.save(invoice);
            }

            if (order.getOrderStatus() == ProductOrderStatus.PENDING) {
                order.setOrderStatus(ProductOrderStatus.CONFIRMED);
                order.setUpdatedAt(now);
                productOrderRepo.save(order);
            }

            return;
        }

        if (order.getOrderStatus() == ProductOrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã bị hủy");
        }

        productOrderService.deductStock(order.getId());

        transaction.setPaymentStatus(PaymentStatus.PAID);
        transaction.setTransactionTime(now);

        invoice.setPaymentMethod(PaymentMethod.VNPAY);
        invoice.setPaymentStatus(PaymentStatus.PAID);

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(ProductOrderStatus.CONFIRMED);
        order.setUpdatedAt(now);

        paymentTransactionRepo.save(transaction);
        invoiceRepo.save(invoice);
        productOrderRepo.save(order);

        notifyProductOrderPaymentSuccess(order);
    }

    private void processFailedPayment(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");

        PaymentTransaction transaction = paymentTransactionRepo.findByTransactionNo(txnRef).orElse(null);

        if (transaction == null) {
            return;
        }

        if (transaction.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);

        transaction.setPaymentStatus(PaymentStatus.FAILED);
        transaction.setTransactionTime(now);

        paymentTransactionRepo.save(transaction);

        Invoice invoice = transaction.getInvoice();

        if (invoice != null && invoice.getPaymentStatus() != PaymentStatus.PAID && invoice.getPaymentStatus() != PaymentStatus.REFUNDED) {
            invoice.setPaymentStatus(PaymentStatus.FAILED);
            invoiceRepo.save(invoice);
        }
    }

    private void cancelExpiredPayment(Appointment appointment) {
        appointmentSlotRepo.deleteByAppointmentId(appointment.getId());

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setRefundAmount(BigDecimal.ZERO);

        appointmentRepo.saveAndFlush(appointment);

        try {
            notificationService.create(
                    appointment.getCustomer().getUser().getId(),
                    "Lịch hẹn đã bị hủy",
                    "Lịch hẹn " + appointment.getAppointmentCode()
                            + " đã tự động hủy vì quá thời gian thanh toán."
            );
        } catch (Exception e) {
            System.err.println("Không thể tạo notification cho appointment " + appointment.getId());
        }
    }

    private void notifyPaymentSuccess(Appointment appointment) {
        try {
            User user = appointment.getCustomer().getUser();

            String title = "Đặt lịch thành công";
            String message = "Lịch hẹn " + appointment.getAppointmentCode()
                    + " đã được thanh toán và xác nhận.\n\n"
                    + "Dịch vụ: " + appointment.getService().getName() + "\n"
                    + "Ngày hẹn: " + appointment.getAppointmentDate() + "\n"
                    + "Thời gian: " + appointment.getStartTime() + " - " + appointment.getEndTime() + "\n"
                    + "Cảm ơn bạn đã sử dụng dịch vụ tại Hair Salon.";

            notificationService.create(user.getId(), title, message);

            emailService.sendSimpleEmail(user.getEmail(), title, message);
        } catch (Exception e) {
            System.err.println("Không thể gửi thông báo thanh toán thành công cho appointment " + appointment.getId());
            e.printStackTrace();
        }
    }

    private void notifyProductOrderPaymentSuccess(ProductOrder order) {
        try {
            User user = order.getCustomer().getUser();

            String title = "Thanh toán đơn hàng thành công";
            String message = "Đơn hàng " + order.getOrderCode()
                    + " đã được thanh toán thành công.\n\n"
                    + "Tổng tiền: " + order.getTotalAmount() + " VND\n"
                    + "Phương thức thanh toán: " + order.getPaymentMethod() + "\n\n"
                    + "Cảm ơn bạn đã mua sắm tại Hair Salon.";

            notificationService.create(user.getId(), title, message);

            emailService.sendSimpleEmail(user.getEmail(), title, message);
        } catch (Exception e) {
            System.err.println("Không thể gửi thông báo thanh toán cho product order " + order.getId());
            e.printStackTrace();
        }
    }

    private boolean verifySignature(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");

        if (secureHash == null || secureHash.isBlank()) {
            return false;
        }

        SortedMap<String, String> filtered = new TreeMap<>();

        params.forEach((key, value) -> {
            if (key.startsWith("vnp_")
                    && !key.equals("vnp_SecureHash")
                    && !key.equals("vnp_SecureHashType")
                    && value != null
                    && !value.isBlank()
            ) {
                filtered.put(key, value);
            }
        });

        String hashData = buildHashData(filtered);
        String calculatedHash = hmacSHA512(vnpayHashSecret, hashData);

        return calculatedHash.equalsIgnoreCase(secureHash);
    }

    private String buildHashData(SortedMap<String, String> params) {
        StringBuilder builder = new StringBuilder();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!builder.isEmpty()) {
                builder.append("&");
            }

            builder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            builder.append("=");
            builder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }

        return builder.toString();
    }

    private String buildQueryString(SortedMap<String, String> params) {
        StringBuilder builder = new StringBuilder();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!builder.isEmpty()) {
                builder.append("&");
            }

            builder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            builder.append("=");
            builder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }

        return builder.toString();
    }

    private String hmacSHA512(String secret, String data) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");

            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");

            mac.init(secretKey);

            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();

            for (byte value : bytes) {
                hash.append(String.format("%02x", value));
            }

            return hash.toString();

        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo VNPay checksum", e);
        }
    }

    private BigDecimal parseVnpayAmount(String value) {
        try {
            if (value == null || value.isBlank()) {
                return null;
            }

            return new BigDecimal(value).divide(BigDecimal.valueOf(100));
        } catch (Exception e) {
            return null;
        }
    }

    private String normalizeIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return "127.0.0.1";
        }

        if (ip.equalsIgnoreCase("0:0:0:0:0:0:0:1")) {
            return "127.0.0.1";
        }

        return ip;
    }

    private String buildFrontendRedirect(boolean success, String status, String txnRef) {
        Long appointmentId = null;
        Long productOrderId = null;

        if (txnRef != null && !txnRef.isBlank()) {
            PaymentTransaction transaction = paymentTransactionRepo.findByTransactionNo(txnRef).orElse(null);

            if (transaction != null && transaction.getInvoice() != null) {
                Invoice invoice = transaction.getInvoice();

                if (invoice.getAppointment() != null) {
                    appointmentId = invoice.getAppointment().getId();
                }

                if (invoice.getProductOrder() != null) {
                    productOrderId = invoice.getProductOrder().getId();
                }
            }
        }

        String redirectUrl = "redirect:"
                + frontendUrl
                + "/payment/vnpay/return"
                + "?status="
                + URLEncoder.encode(status, StandardCharsets.UTF_8)
                + "&txnRef="
                + URLEncoder.encode(txnRef == null ? "" : txnRef, StandardCharsets.UTF_8);

        if (appointmentId != null) {
            redirectUrl += "&appointmentId=" + appointmentId;
        }

        if (productOrderId != null) {
            redirectUrl += "&productOrderId=" + productOrderId;
        }

        return redirectUrl;
    }

    private Customer getCustomerByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        return customerRepo.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));
    }
}