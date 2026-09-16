package com.lca.service.impl;

import com.lca.dtos.request.InvoiceItemRequestDTO;
import com.lca.dtos.request.InvoiceRequestDTO;
import com.lca.dtos.response.InvoiceResponseDTO;
import com.lca.entity.Appointment;
import com.lca.entity.Customer;
import com.lca.entity.Invoice;
import com.lca.entity.InvoiceItem;
import com.lca.entity.PaymentTransaction;
import com.lca.entity.Product;
import com.lca.entity.ProductOrder;
import com.lca.entity.ProductOrderItem;
import com.lca.entity.User;
import com.lca.enums.AppointmentStatus;
import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import com.lca.enums.ProductOrderStatus;
import com.lca.mapper.InvoiceMapper;
import com.lca.repository.AppointmentRepository;
import com.lca.repository.CustomerRepository;
import com.lca.repository.InvoiceRepository;
import com.lca.repository.PaymentTransactionRepository;
import com.lca.repository.ProductOrderRepository;
import com.lca.repository.ProductRepository;
import com.lca.repository.ServiceRepository;
import com.lca.repository.UserRepository;
import com.lca.service.EmailService;
import com.lca.service.InvoiceService;
import com.lca.service.NotificationService;
import com.lca.service.ProductOrderService;
import com.lca.specification.InvoiceSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepo;
    private final CustomerRepository customerRepo;
    private final AppointmentRepository appointmentRepo;
    private final ServiceRepository serviceRepo;
    private final ProductRepository productRepo;
    private final PaymentTransactionRepository paymentTransactionRepo;
    private final NotificationService notificationService;
    private final UserRepository userRepo;
    private final ProductOrderRepository productOrderRepo;
    private final ProductOrderService productOrderService;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceResponseDTO> getAll(Pageable pageable) {
        return invoiceRepo.findAll(pageable).map(InvoiceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceResponseDTO> getByCustomer(Long customerId, Pageable pageable) {
        return invoiceRepo.findByCustomerId(customerId, pageable).map(InvoiceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponseDTO getById(Long id) {
        Invoice invoice = invoiceRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy invoice với ID: " + id));

        return InvoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceResponseDTO> search(
            String keyword,
            Long customerId,
            PaymentStatus paymentStatus,
            PaymentMethod paymentMethod,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    ) {

        Specification<Invoice> specification = null;

        if (keyword != null && !keyword.isBlank()) {
            specification = InvoiceSpecification.keyword(keyword);
        }

        if (customerId != null) {
            specification = specification == null
                    ? InvoiceSpecification.customerId(customerId)
                    : specification.and(InvoiceSpecification.customerId(customerId));
        }

        if (paymentStatus != null) {
            specification = specification == null
                    ? InvoiceSpecification.paymentStatus(paymentStatus)
                    : specification.and(InvoiceSpecification.paymentStatus(paymentStatus));
        }

        if (paymentMethod != null) {
            specification = specification == null
                    ? InvoiceSpecification.paymentMethod(paymentMethod)
                    : specification.and(InvoiceSpecification.paymentMethod(paymentMethod));
        }

        if (from != null) {
            specification = specification == null
                    ? InvoiceSpecification.createdFrom(from)
                    : specification.and(InvoiceSpecification.createdFrom(from));
        }

        if (to != null) {
            specification = specification == null
                    ? InvoiceSpecification.createdTo(to)
                    : specification.and(InvoiceSpecification.createdTo(to));
        }

        if (specification == null) {
            return invoiceRepo.findAll(pageable).map(InvoiceMapper::toResponse);
        }

        return invoiceRepo.findAll(specification, pageable).map(InvoiceMapper::toResponse);
    }

    @Override
    public InvoiceResponseDTO createAndPayAtStore(InvoiceRequestDTO request) {

        if (request.getPaymentMethod() != PaymentMethod.CASH) {
            throw new RuntimeException("Thanh toán tại tiệm chỉ hỗ trợ CASH");
        }

        Customer customer = customerRepo.findById(request.getCustomerId()).orElseThrow(
                () -> new RuntimeException(
                        "Không tìm thấy customer với ID: " + request.getCustomerId())
        );

        Appointment appointment = appointmentRepo.findById(request.getAppointmentId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy appointment")
        );

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Appointment không thuộc customer này");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.EXPIRED
                || appointment.getStatus() == AppointmentStatus.COMPLETED) {

            throw new RuntimeException("Appointment không thể thanh toán");
        }

        if (invoiceRepo.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new RuntimeException("Appointment đã có invoice");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Hóa đơn phải có ít nhất một item");
        }

        Invoice invoice = new Invoice();

        invoice.setAppointment(appointment);
        invoice.setProductOrder(null);
        invoice.setCustomer(customer);
        invoice.setInvoiceCode("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        BigDecimal subTotal = BigDecimal.ZERO;

        for (InvoiceItemRequestDTO itemRequest : request.getItems()) {

            InvoiceItem item = new InvoiceItem();

            item.setInvoice(invoice);
            item.setQuantity(itemRequest.getQuantity());

            BigDecimal unitPrice;

            if (itemRequest.getServiceId() != null) {

                com.lca.entity.Service service = serviceRepo.findById(itemRequest.getServiceId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy service với ID: " + itemRequest.getServiceId()));

                unitPrice = service.getPrice();
                item.setService(service);

            } else if (itemRequest.getProductId() != null) {

                Product product = productRepo.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy product với ID: " + itemRequest.getProductId()));

                if (!Boolean.TRUE.equals(product.getIsActive())) {
                    throw new RuntimeException("Sản phẩm không hoạt động");
                }

                if (product.getStockQuantity() == null || product.getStockQuantity() < itemRequest.getQuantity()) {
                    throw new RuntimeException("Sản phẩm không đủ tồn kho");
                }

                unitPrice = product.getPrice();
                item.setProduct(product);

                product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());

            } else {
                throw new RuntimeException("Invoice item phải có serviceId hoặc productId");
            }

            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            item.setUnitPrice(unitPrice);
            item.setTotalPrice(totalPrice);

            invoice.getItems().add(item);

            subTotal = subTotal.add(totalPrice);
        }

        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;

        BigDecimal total = subTotal.subtract(discount);

        if (total.signum() < 0) {
            throw new RuntimeException("Số tiền thanh toán không hợp lệ");
        }

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);

        invoice.setSubTotal(subTotal);
        invoice.setDiscountAmount(discount);
        invoice.setTotalAmount(total);
        invoice.setRefundAmount(BigDecimal.ZERO);
        invoice.setPaymentMethod(PaymentMethod.CASH);
        invoice.setPaymentStatus(PaymentStatus.PAID);
        invoice.setCreatedAt(now);

        Invoice savedInvoice = invoiceRepo.saveAndFlush(invoice);

        PaymentTransaction transaction = new PaymentTransaction();

        transaction.setInvoice(savedInvoice);
        transaction.setTransactionNo("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transaction.setAmount(total);
        transaction.setPaymentMethod(PaymentMethod.CASH);
        transaction.setPaymentStatus(PaymentStatus.PAID);
        transaction.setTransactionTime(now);

        paymentTransactionRepo.save(transaction);

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setPaymentDeadline(null);

        appointmentRepo.save(appointment);

        notificationService.create(
                customer.getUser().getId(),
                "Thanh toán thành công",
                "Hóa đơn " + savedInvoice.getInvoiceCode()
                        + " đã được thanh toán tại salon. Lịch hẹn đã được xác nhận."
        );

        return InvoiceMapper.toResponse(savedInvoice);
    }

    @Override
    @Transactional
    public InvoiceResponseDTO createProductSaleInvoice(Long orderId) {

        ProductOrder order = productOrderRepo.findById(orderId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (order.getCustomer() == null) {
            throw new RuntimeException("Đơn hàng không có khách hàng");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Đơn hàng không có sản phẩm");
        }

        if (invoiceRepo.findByProductOrderId(orderId).isPresent()) {
            throw new RuntimeException("Đơn hàng đã có invoice");
        }

        BigDecimal subTotal = order.getSubTotal() != null ? order.getSubTotal() : BigDecimal.ZERO;

        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;

        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;

        BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount() : subTotal.subtract(discount).add(shippingFee);

        if (subTotal.compareTo(BigDecimal.ZERO) < 0
                || discount.compareTo(BigDecimal.ZERO) < 0
                || shippingFee.compareTo(BigDecimal.ZERO) < 0
                || total.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException("Thông tin tiền của đơn hàng không hợp lệ");
        }

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);

        Invoice invoice = new Invoice();

        invoice.setAppointment(null);
        invoice.setProductOrder(order);
        invoice.setCustomer(order.getCustomer());
        invoice.setInvoiceCode("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setSubTotal(subTotal);
        invoice.setDiscountAmount(discount);
        invoice.setTotalAmount(total);
        invoice.setRefundAmount(BigDecimal.ZERO);
        invoice.setPaymentMethod(order.getPaymentMethod());
        invoice.setPaymentStatus(PaymentStatus.PENDING);
        invoice.setCreatedAt(now);

        for (ProductOrderItem orderItem : order.getItems()) {

            if (orderItem.getProduct() == null) {
                throw new RuntimeException("Đơn hàng có sản phẩm không hợp lệ");
            }

            InvoiceItem invoiceItem = new InvoiceItem();

            invoiceItem.setInvoice(invoice);
            invoiceItem.setService(null);
            invoiceItem.setProduct(orderItem.getProduct());
            invoiceItem.setQuantity(orderItem.getQuantity());
            invoiceItem.setUnitPrice(orderItem.getUnitPrice());
            invoiceItem.setTotalPrice(orderItem.getTotalPrice());

            invoice.getItems().add(invoiceItem);
        }

        Invoice savedInvoice = invoiceRepo.saveAndFlush(invoice);

        if (order.getPaymentMethod() == PaymentMethod.CASH) {

            PaymentTransaction transaction = new PaymentTransaction();

            transaction.setInvoice(savedInvoice);
            transaction.setTransactionNo("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            transaction.setAmount(total);
            transaction.setPaymentMethod(PaymentMethod.CASH);
            transaction.setPaymentStatus(PaymentStatus.PAID);
            transaction.setTransactionTime(now);

            paymentTransactionRepo.save(transaction);

            savedInvoice.setPaymentStatus(PaymentStatus.PAID);
            invoiceRepo.save(savedInvoice);

            productOrderService.deductStock(order.getId());

            order.setOrderStatus(ProductOrderStatus.CONFIRMED);
            order.setUpdatedAt(now);

            productOrderRepo.save(order);

            notifyProductSaleSuccess(order);
        }

        return InvoiceMapper.toResponse(savedInvoice);
    }

    private void notifyProductSaleSuccess(ProductOrder order) {

        try {

            if (order.getCustomer() == null || order.getCustomer().getUser() == null) {
                return;
            }

            User user = order.getCustomer().getUser();

            String title = "Mua sản phẩm thành công";

            String message = "Đơn hàng " + order.getOrderCode()
                    + " đã được thanh toán thành công tại Hair Salon.\n\n"
                    + "Tổng tiền: " + order.getTotalAmount() + " VND\n"
                    + "Phương thức thanh toán: " + order.getPaymentMethod()
                    + "\n\nCảm ơn bạn đã mua sắm tại Hair Salon.";

            notificationService.create(user.getId(), title, message);

            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendSimpleEmail(user.getEmail(), title, message);
            }

        } catch (Exception e) {
            System.err.println("Không thể gửi thông báo product sale " + order.getId());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceResponseDTO> getMyInvoices(String email, Pageable pageable) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        Customer customer = customerRepo.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));

        return invoiceRepo.findByCustomerId(customer.getId(), pageable).map(InvoiceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponseDTO getMyInvoiceById(String email, Long id) {

        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        Customer customer = customerRepo.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));

        Invoice invoice = invoiceRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy invoice"));

        if (!invoice.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Invoice không thuộc customer này");
        }

        return InvoiceMapper.toResponse(invoice);
    }
}