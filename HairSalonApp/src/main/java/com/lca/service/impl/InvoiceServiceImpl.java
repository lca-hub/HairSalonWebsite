package com.lca.service.impl;

import com.lca.dtos.request.InvoiceItemRequestDTO;
import com.lca.dtos.request.InvoiceRequestDTO;
import com.lca.dtos.response.InvoiceResponseDTO;
import com.lca.entity.*;
import com.lca.enums.AppointmentStatus;
import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import com.lca.mapper.InvoiceMapper;
import com.lca.repository.*;
import com.lca.service.InvoiceService;
import com.lca.specification.InvoiceSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepo;
    private final CustomerRepository customerRepo;
    private final AppointmentRepository appointmentRepo;
    private final ServiceRepository serviceRepo;
    private final ProductRepository productRepo;
    private final PaymentTransactionRepository paymentTransactionRepo;
    private final UserRepository userRepo;

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
        Invoice invoice = invoiceRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy invoice với ID: " + id));
        return InvoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceResponseDTO> search(String keyword, Long customerId, PaymentStatus paymentStatus,
                                           PaymentMethod paymentMethod, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Specification<Invoice> specification = Specification.where(InvoiceSpecification.keyword(keyword))
                .and(InvoiceSpecification.customerId(customerId))
                .and(InvoiceSpecification.paymentStatus(paymentStatus))
                .and(InvoiceSpecification.paymentMethod(paymentMethod))
                .and(InvoiceSpecification.createdFrom(from))
                .and(InvoiceSpecification.createdTo(to));
        return invoiceRepo.findAll(specification, pageable).map(InvoiceMapper::toResponse);
    }

    @Override
    public InvoiceResponseDTO createAndPayAtStore(InvoiceRequestDTO request) {

        if (request.getPaymentMethod() != PaymentMethod.CASH) {
            throw new RuntimeException("Thanh toán tại tiệm chỉ hỗ trợ CASH");
        }

        Customer customer = customerRepo.findById(request.getCustomerId()).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy customer với ID: " + request.getCustomerId()));

        Appointment appointment = appointmentRepo.findById(request.getAppointmentId()).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy appointment"));

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Appointment không thuộc customer này");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.EXPIRED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
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
        invoice.setCustomer(customer);
        invoice.setInvoiceCode("INV-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        BigDecimal subTotal = BigDecimal.ZERO;

        for (InvoiceItemRequestDTO itemRequest : request.getItems()) {

            InvoiceItem item = new InvoiceItem();

            item.setInvoice(invoice);
            item.setQuantity(itemRequest.getQuantity());

            BigDecimal unitPrice;

            if (itemRequest.getServiceId() != null) {

                Service service = serviceRepo.findById(itemRequest.getServiceId()).orElseThrow(() -> new RuntimeException("Không tìm thấy service với ID: " + itemRequest.getServiceId()));

                unitPrice = service.getPrice();

                item.setService(service);

            } else if (itemRequest.getProductId() != null) {

                Product product = productRepo.findById(itemRequest.getProductId()).orElseThrow(
                                () -> new RuntimeException("Không tìm thấy product với ID: " + itemRequest.getProductId()));

                if (!Boolean.TRUE.equals(product.getIsActive())) {
                    throw new RuntimeException("Sản phẩm không hoạt động");
                }

                if (product.getStockQuantity() < itemRequest.getQuantity()) {
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

        invoice.setSubTotal(subTotal);
        invoice.setDiscountAmount(discount);
        invoice.setTotalAmount(total);
        invoice.setRefundAmount(BigDecimal.ZERO);
        invoice.setPaymentMethod(PaymentMethod.CASH);
        invoice.setPaymentStatus(PaymentStatus.PAID);
        invoice.setCreatedAt(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepo.saveAndFlush(invoice);

        PaymentTransaction transaction = new PaymentTransaction();

        transaction.setInvoice(savedInvoice);
        transaction.setTransactionNo("TXN-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transaction.setAmount(total);
        transaction.setPaymentMethod(PaymentMethod.CASH);
        transaction.setPaymentStatus(PaymentStatus.PAID);
        transaction.setTransactionTime(LocalDateTime.now());

        paymentTransactionRepo.save(transaction);

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setPaymentDeadline(null);

        appointmentRepo.save(appointment);

        return InvoiceMapper.toResponse(savedInvoice);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceResponseDTO> getMyInvoices(String email, Pageable pageable) {
        User user = userRepo.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user"));

        Customer customer = customerRepo.findByUserId(user.getId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy customer"));

        return invoiceRepo.findByCustomerId(customer.getId(), pageable).map(InvoiceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponseDTO getMyInvoiceById(String email, Long id) {
        User user = userRepo.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user"));

        Customer customer = customerRepo.findByUserId(user.getId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy customer"));

        Invoice invoice = invoiceRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy invoice"));

        if (!invoice.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Invoice không thuộc customer này");
        }

        return InvoiceMapper.toResponse(invoice);
    }
}