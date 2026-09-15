package com.lca.service.impl;

import com.lca.dtos.response.PaymentUrlResponseDTO;
import com.lca.entity.Appointment;
import com.lca.entity.Invoice;
import com.lca.entity.InvoiceItem;
import com.lca.entity.PaymentTransaction;
import com.lca.entity.Customer;
import com.lca.entity.User;
import com.lca.enums.AppointmentStatus;
import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import com.lca.repository.AppointmentRepository;
import com.lca.repository.CustomerRepository;
import com.lca.repository.InvoiceRepository;
import com.lca.repository.PaymentTransactionRepository;
import com.lca.repository.UserRepository;
import com.lca.service.NotificationService;
import com.lca.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    private final InvoiceRepository invoiceRepo;
    private final PaymentTransactionRepository paymentTransactionRepo;
    private final CustomerRepository customerRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

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

            appointment.setStatus(AppointmentStatus.EXPIRED);
            appointmentRepo.saveAndFlush(appointment);

            throw new RuntimeException("Thời gian thanh toán đã hết. Vui lòng đặt lịch mới.");
        }

        BigDecimal amount = appointment.getBookingAmount();

        if (amount == null || amount.signum() <= 0) {
            throw new RuntimeException("Số tiền thanh toán không hợp lệ");
        }

        Invoice invoice = invoiceRepo
                .findByAppointmentId(appointment.getId())
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

        String paymentUrl =
                vnpayPayUrl
                        + "?"
                        + queryString
                        + "&vnp_SecureHash="
                        + URLEncoder.encode(
                        secureHash,
                        StandardCharsets.UTF_8
                );

        return new PaymentUrlResponseDTO(appointment.getId(), savedInvoice.getId(), transaction.getTransactionNo(), paymentUrl);
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

        PaymentTransaction transaction = paymentTransactionRepo.findByTransactionNo(txnRef).orElse(null);

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

        boolean success =
                "00".equals(responseCode)
                        && "00".equals(transactionStatus);

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
        invoice.setCustomer(customer);

        invoice.setInvoiceCode(
                "INV-"
                        + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

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

    private PaymentTransaction getOrCreatePendingTransaction(Invoice invoice, BigDecimal amount) {

        return paymentTransactionRepo
                .findByInvoiceId(invoice.getId())
                .stream()
                .filter(transaction -> transaction.getPaymentStatus() == PaymentStatus.PENDING)
                .findFirst()
                .orElseGet(() -> {

                    PaymentTransaction transaction = new PaymentTransaction();

                    transaction.setInvoice(invoice);

                    transaction.setTransactionNo(
                            "TXN-"
                                    + UUID.randomUUID()
                                    .toString()
                                    .substring(0, 8)
                                    .toUpperCase()
                    );

                    transaction.setAmount(amount);

                    transaction.setPaymentMethod(PaymentMethod.VNPAY);

                    transaction.setPaymentStatus(PaymentStatus.PENDING);

                    transaction.setTransactionTime(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));

                    return paymentTransactionRepo.saveAndFlush(transaction);
                });
    }

    private void processSuccessfulPayment(Map<String, String> params) {

        String txnRef = params.get("vnp_TxnRef");

        PaymentTransaction transaction = paymentTransactionRepo
                        .findByTransactionNo(txnRef)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy payment transaction"));

        Invoice invoice = transaction.getInvoice();

        Appointment appointment = invoice.getAppointment();

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

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.EXPIRED) {

            throw new RuntimeException("Appointment không còn hợp lệ để xác nhận thanh toán");
        }

        if (appointment.getPaymentDeadline() != null && now.isAfter(appointment.getPaymentDeadline())) {

            appointment.setStatus(AppointmentStatus.EXPIRED);

            appointmentRepo.saveAndFlush(appointment);

            throw new RuntimeException("Thời gian thanh toán đã hết. Lịch hẹn không thể xác nhận.");
        }

        transaction.setPaymentStatus(PaymentStatus.PAID);
        transaction.setTransactionNo(txnRef);
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

    private void notifyPaymentSuccess(Appointment appointment) {

        try {
            User user = appointment.getCustomer().getUser();

            notificationService.create(user.getId(), "Thanh toán thành công", "Lịch hẹn " + appointment.getAppointmentCode() + " đã được thanh toán và xác nhận.");

        } catch (Exception ignored) {
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
                    && !value.isBlank()) {

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

            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");

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

        if (txnRef != null && !txnRef.isBlank()) {
            appointmentId = paymentTransactionRepo
                    .findByTransactionNo(txnRef)
                    .map(transaction -> transaction.getInvoice())
                    .map(invoice -> invoice.getAppointment())
                    .map(appointment -> appointment.getId())
                    .orElse(null);
        }

        return "redirect:"
                + frontendUrl
                + "/payment/vnpay/return"
                + "?status="
                + URLEncoder.encode(
                status,
                StandardCharsets.UTF_8
        )
                + "&txnRef="
                + URLEncoder.encode(
                txnRef == null ? "" : txnRef,
                StandardCharsets.UTF_8
        )
                + (appointmentId != null
                ? "&appointmentId=" + appointmentId
                : "");
    }

    private Customer getCustomerByEmail(String email) {

        User user = userRepo.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        return customerRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));
    }
}