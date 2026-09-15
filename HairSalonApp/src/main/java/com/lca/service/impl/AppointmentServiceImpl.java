package com.lca.service.impl;

import com.lca.dtos.request.AppointmentRequestDTO;
import com.lca.dtos.response.AppointmentResponseDTO;
import com.lca.entity.*;
import com.lca.enums.AppointmentStatus;
import com.lca.enums.PaymentStatus;
import com.lca.mapper.AppointmentMapper;
import com.lca.repository.*;
import com.lca.service.AppointmentService;
import com.lca.service.NotificationService;
import com.lca.specification.AppointmentSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final AppointmentSlotRepository appointmentSlotRepo;
    private final CustomerRepository customerRepo;
    private final StylistRepository stylistRepo;
    private final ServiceRepository serviceRepo;
    private final StylistScheduleRepository scheduleRepo;
    private final InvoiceRepository invoiceRepo;
    private final PaymentTransactionRepository paymentTransactionRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    private AppointmentResponseDTO createInternal(Customer customer, AppointmentRequestDTO request) {
        Stylist stylist = stylistRepo.findById(request.getStylistId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + request.getStylistId()));

        Service service = serviceRepo.findById(request.getServiceId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy service với ID: " + request.getServiceId()));

        if (!Boolean.TRUE.equals(service.getIsActive())) {
            throw new RuntimeException("Dịch vụ hiện không hoạt động");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể đặt lịch trong quá khứ");
        }

        LocalTime startTime = request.getStartTime();
        LocalTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        checkSchedule(stylist.getId(), request.getAppointmentDate(), startTime, endTime);

        checkConflict(stylist.getId(), request.getAppointmentDate(), startTime, endTime, null);

        Appointment appointment = AppointmentMapper.toEntity(request);

        appointment.setCustomer(customer);
        appointment.setStylist(stylist);
        appointment.setService(service);
        appointment.setEndTime(endTime);
        appointment.setBookingAmount(service.getPrice());
        appointment.setStatus(AppointmentStatus.PENDING_PAYMENT);
        appointment.setRefundAmount(BigDecimal.ZERO);
        appointment.setAppointmentCode(generateAppointmentCode());

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime now = LocalDateTime.now(vietnamZone);

        appointment.setCreatedAt(now);
        appointment.setPaymentDeadline(now.plusMinutes(10));

        try {
            Appointment saved = appointmentRepo.saveAndFlush(appointment);

            List<LocalTime> slots = generateSlots(startTime, endTime);

            for (LocalTime slotTime : slots) {
                AppointmentSlot slot = new AppointmentSlot();

                slot.setAppointment(saved);
                slot.setStylist(stylist);
                slot.setSlotDate(request.getAppointmentDate());
                slot.setSlotTime(slotTime);

                appointmentSlotRepo.saveAndFlush(slot);
            }

            AppointmentResponseDTO response = AppointmentMapper.toResponse(saved);

            notificationService.create(customer.getUser().getId(), "Đặt lịch thành công", "Lịch hẹn " + saved.getAppointmentCode() + " đã được tạo và đang chờ thanh toán tại salon.");

            return response;

        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Khung giờ này vừa được người khác đặt. Vui lòng chọn giờ khác.");
        }
    }

    @Override
    public AppointmentResponseDTO create(String email, AppointmentRequestDTO request) {
        Customer customer = getCustomerByEmail(email);

        return createInternal(customer, request);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getMyAppointmentById(String email, Long appointmentId) {
        Customer customer = getCustomerByEmail(email);

        Appointment appointment = getCustomerAppointment(customer.getId(), appointmentId);

        return AppointmentMapper.toResponse(appointment);
    }

    @Override
    public void cancel(String email, Long appointmentId) {
        Customer customer = getCustomerByEmail(email);

        Appointment appointment = getCustomerAppointment(customer.getId(), appointmentId);

        AppointmentStatus status = appointment.getStatus();

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");

        LocalDateTime now = LocalDateTime.now(vietnamZone);

        if (status == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment đã bị hủy");
        }

        if (status == AppointmentStatus.EXPIRED) {
            throw new RuntimeException(
                    "Appointment đã hết hạn thanh toán"
            );
        }

        if (status == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Appointment đã hoàn thành");
        }

        if (status == AppointmentStatus.IN_SERVICE) {
            throw new RuntimeException("Appointment đang được thực hiện");
        }

        if (status == AppointmentStatus.PENDING_PAYMENT) {
            releaseSlots(appointment.getId());

            appointment.setRefundAmount(BigDecimal.ZERO);

            appointment.setStatus(AppointmentStatus.CANCELLED);

            appointmentRepo.save(appointment);

            notificationService.create(customer.getUser().getId(), "Hủy lịch hẹn", "Lịch hẹn " + appointment.getAppointmentCode() + " đã được hủy.");

            return;
        }

        LocalDateTime appointmentTime =
                LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());

        Duration remaining = Duration.between(now, appointmentTime);

        boolean canRefund = !remaining.isNegative() && remaining.compareTo(Duration.ofHours(24)) >= 0;

        Invoice invoice = invoiceRepo.findByAppointmentId(appointment.getId()).orElse(null);

        if (canRefund && invoice != null && invoice.getPaymentStatus() == PaymentStatus.PAID) {
            BigDecimal refundAmount = invoice.getTotalAmount();
            appointment.setRefundAmount(refundAmount);
            invoice.setRefundAmount(refundAmount);

            invoice.setRefundTime(now);

            invoice.setPaymentStatus(PaymentStatus.REFUNDED);

            invoiceRepo.save(invoice);

            paymentTransactionRepo.findByInvoiceId(invoice.getId())
                    .stream()
                    .filter(transaction -> transaction.getPaymentStatus() == PaymentStatus.PAID)
                    .findFirst()
                    .ifPresent(transaction -> {
                        transaction.setPaymentStatus(PaymentStatus.REFUNDED);

                        paymentTransactionRepo.save(transaction);
                    });

        } else {
            appointment.setRefundAmount(BigDecimal.ZERO);
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        releaseSlots(appointment.getId());

        appointmentRepo.save(appointment);

        notificationService.create(customer.getUser().getId(),
                "Hủy lịch hẹn", "Lịch hẹn "
                        + appointment.getAppointmentCode()
                        + " đã được hủy."
                        + (
                        appointment.getRefundAmount()
                                .signum() > 0
                                ? " Số tiền hoàn: "
                                  + appointment.getRefundAmount()
                                : " Không có hoàn tiền."
                )
        );
    }

    @Override
    public AppointmentResponseDTO reschedule(String email, Long appointmentId, AppointmentRequestDTO request) {
        Customer customer = getCustomerByEmail(email);

        Appointment appointment = getCustomerAppointment(customer.getId(), appointmentId);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Appointment đã hoàn thành");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Không thể đổi lịch đã hủy");
        }

        if (appointment.getStatus() == AppointmentStatus.EXPIRED) {
            throw new RuntimeException("Appointment đã hết hạn");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể đổi lịch sang ngày trong quá khứ");
        }

        Stylist stylist = stylistRepo.findById(request.getStylistId()).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy stylist"));

        Service service = serviceRepo.findById(request.getServiceId()).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy service"));

        if (!Boolean.TRUE.equals(service.getIsActive())) {
            throw new RuntimeException("Dịch vụ hiện không hoạt động");
        }

        LocalTime startTime = request.getStartTime();

        LocalTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        checkSchedule(stylist.getId(), request.getAppointmentDate(), startTime, endTime);

        checkConflict(stylist.getId(), request.getAppointmentDate(), startTime, endTime, appointmentId);

        releaseSlots(appointment.getId());

        appointment.setStylist(stylist);
        appointment.setService(service);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setCustomerNote(request.getCustomerNote());

        Appointment updated = appointmentRepo.saveAndFlush(appointment);

        reserveSlots(updated, stylist, request.getAppointmentDate(), startTime, endTime);

        notificationService.create(
                customer.getUser().getId(),
                "Đổi lịch hẹn",
                "Lịch hẹn "
                        + updated.getAppointmentCode()
                        + " đã được đổi sang "
                        + updated.getAppointmentDate()
                        + " "
                        + updated.getStartTime()
                        + "."
        );

        return AppointmentMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> getAll(Pageable pageable) {
        return appointmentRepo.findAll(pageable).map(AppointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getById(Long id) {
        Appointment appointment = appointmentRepo.findById(id).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy appointment"));

        return AppointmentMapper.toResponse(appointment);
    }

    @Override
    public AppointmentResponseDTO adminCreate(AppointmentRequestDTO request) {
        Customer customer = customerRepo.findById(request.getCustomerId()).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy customer với ID: " + request.getCustomerId()));

        return createInternal(customer, request);
    }

    @Override
    public AppointmentResponseDTO update(Long id, AppointmentRequestDTO request) {
        Appointment appointment = appointmentRepo.findById(id).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy appointment"));

        Stylist stylist = stylistRepo.findById(request.getStylistId()).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy stylist"));

        Service service = serviceRepo.findById(request.getServiceId()).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy service"));

        if (!Boolean.TRUE.equals(service.getIsActive())) {
            throw new RuntimeException("Dịch vụ hiện không hoạt động");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể cập nhật lịch trong quá khứ");
        }

        LocalTime startTime = request.getStartTime();

        LocalTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        checkSchedule(stylist.getId(), request.getAppointmentDate(), startTime, endTime);

        checkConflict(stylist.getId(), request.getAppointmentDate(), startTime, endTime, id);

        releaseSlots(appointment.getId());

        appointment.setCustomerNote(request.getCustomerNote());

        appointment.setStylist(stylist);
        appointment.setService(service);

        appointment.setAppointmentDate(request.getAppointmentDate());

        appointment.setStartTime(startTime);

        appointment.setEndTime(endTime);

        Appointment updated = appointmentRepo.saveAndFlush(appointment);

        reserveSlots(updated, stylist, request.getAppointmentDate(), startTime, endTime);

        return AppointmentMapper.toResponse(updated);
    }

    @Override
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AppointmentResponseDTO confirm(Long id) {
        Appointment appointment = appointmentRepo.findById(id).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy appointment"));

        if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ lịch hẹn ở trạng thái CHỜ THANH TOÁN mới được xác nhận.");
        }

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");

        LocalDateTime now = LocalDateTime.now(vietnamZone);

        if (appointment.getPaymentDeadline() != null && now.isAfter(appointment.getPaymentDeadline())) {
            releaseSlots(appointment.getId());

            appointment.setStatus(AppointmentStatus.CANCELLED);

            appointment.setRefundAmount(BigDecimal.ZERO);

            appointmentRepo.saveAndFlush(appointment);

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian thanh toán đã hết. Lịch hẹn đã tự động hủy, vui lòng tạo lịch mới.");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);

        appointment.setPaymentDeadline(null);

        return AppointmentMapper.toResponse(appointmentRepo.saveAndFlush(appointment));
    }

    @Override
    public void adminCancel(Long id) {
        Appointment appointment = appointmentRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy appointment"));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Appointment đã hoàn thành");
        }

        releaseSlots(appointment.getId());

        appointment.setStatus(AppointmentStatus.CANCELLED);

        appointment.setRefundAmount(appointment.getBookingAmount());

        appointmentRepo.save(appointment);
    }

    @Override
    public AppointmentResponseDTO adminReschedule(Long id, AppointmentRequestDTO request) {
        return update(id, request);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> getMyAppointments(String email, Pageable pageable) {
        Customer customer = getCustomerByEmail(email);

        return appointmentRepo.findByCustomerId(customer.getId(), pageable).map(AppointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getStylistAppointment(String email, Long appointmentId) {
        Stylist stylist = getStylistByEmail(email);

        Appointment appointment = getAppointmentForStylist(stylist.getId(), appointmentId);

        return AppointmentMapper.toResponse(appointment);
    }

    private Appointment getCustomerAppointment(Long customerId, Long appointmentId) {
        Appointment appointment = appointmentRepo.findById(appointmentId).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy appointment"));
        if (!appointment.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Appointment không thuộc customer này");
        }

        return appointment;
    }

    private Appointment getAppointmentForStylist(Long stylistId, Long appointmentId) {
        Appointment appointment = appointmentRepo.findById(appointmentId).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy appointment"));

        if (!appointment.getStylist().getId().equals(stylistId)) {
            throw new RuntimeException("Appointment không thuộc stylist này");
        }

        return appointment;
    }

    private void checkConflict(Long stylistId, LocalDate appointmentDate, LocalTime startTime, LocalTime endTime, Long ignoredAppointmentId) {
        Page<Appointment> page = appointmentRepo.findByStylistIdAndAppointmentDate(stylistId, appointmentDate, Pageable.unpaged());

        boolean conflict = page.getContent()
                .stream().filter(appointment -> ignoredAppointmentId == null || !appointment.getId().equals(ignoredAppointmentId))
                        .filter(this::occupiesSlot)
                        .anyMatch(appointment -> isOverlapping(startTime, endTime, appointment.getStartTime(), appointment.getEndTime()));
        if (conflict) {
            throw new RuntimeException("Khung giờ này đã có người đặt");
        }
    }

    private boolean occupiesSlot(Appointment appointment) {
        AppointmentStatus status = appointment.getStatus();

        return status != AppointmentStatus.CANCELLED && status != AppointmentStatus.NO_SHOW && status != AppointmentStatus.EXPIRED;
    }

    private boolean isOverlapping(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    private void checkSchedule(Long stylistId, LocalDate workDate, LocalTime startTime, LocalTime endTime) {
        StylistSchedule schedule = scheduleRepo.findFirstByStylistIdAndWorkDate(stylistId, workDate).orElseThrow(
                                () -> new RuntimeException("Stylist không có lịch làm việc trong ngày này"));

        if (Boolean.TRUE.equals(schedule.getIsOff())) {
            throw new RuntimeException("Stylist nghỉ trong ngày này");
        }

        if (startTime.isBefore(schedule.getStartTime()) || endTime.isAfter(schedule.getEndTime())) {
            throw new RuntimeException("Khung giờ đặt lịch nằm ngoài giờ làm việc của stylist");
        }
    }

    private List<LocalTime> generateSlots(LocalTime startTime, LocalTime endTime) {
        List<LocalTime> slots = new ArrayList<>();

        LocalTime cursor = startTime;

        while (cursor.isBefore(endTime)) {
            slots.add(cursor);

            cursor = cursor.plusMinutes(30);
        }

        return slots;
    }

    private void reserveSlots(Appointment appointment, Stylist stylist, LocalDate slotDate, LocalTime startTime, LocalTime endTime) {
        List<LocalTime> slots = generateSlots(startTime, endTime);

        for (LocalTime slotTime : slots) {
            AppointmentSlot slot = new AppointmentSlot();

            slot.setAppointment(appointment);

            slot.setStylist(stylist);

            slot.setSlotDate(slotDate);

            slot.setSlotTime(slotTime);

            appointmentSlotRepo.save(slot);
        }

        appointmentSlotRepo.flush();
    }

    private void releaseSlots(Long appointmentId) {
        appointmentSlotRepo.deleteByAppointmentId(appointmentId);
    }

    private String generateAppointmentCode() {
        return "APM-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    @Scheduled(fixedRate = 60000)
    public void autoCancelExpiredPaymentAppointments() {
        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");

        LocalDateTime now = LocalDateTime.now(vietnamZone);

        List<Appointment> expiredAppointments = appointmentRepo.findByStatusAndPaymentDeadlineBefore(AppointmentStatus.PENDING_PAYMENT, now);

        for (Appointment appointment : expiredAppointments) {

            releaseSlots(appointment.getId());

            appointment.setStatus(AppointmentStatus.CANCELLED);

            appointment.setRefundAmount(BigDecimal.ZERO);

            appointmentRepo.save(appointment);

            try {
                notificationService.create(
                        appointment.getCustomer().getUser().getId(), "Lịch hẹn đã bị hủy", "Lịch hẹn "
                                + appointment.getAppointmentCode()
                                + " đã tự động hủy vì quá thời gian thanh toán."
                );
            } catch (Exception e) {
                System.err.println("Không thể tạo notification cho appointment " + appointment.getId());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> search(Long customerId, Long stylistId, AppointmentStatus status, LocalDate date, LocalDate from, LocalDate to, Pageable pageable) {
        Specification<Appointment> specification = Specification.where(AppointmentSpecification.customerId(customerId))
                        .and(AppointmentSpecification.stylistId(stylistId))
                        .and(AppointmentSpecification.status(status))
                        .and(AppointmentSpecification.appointmentDate(date))
                        .and(AppointmentSpecification.dateFrom(from))
                        .and(AppointmentSpecification.dateTo(to));

        return appointmentRepo.findAll(specification, pageable).map(AppointmentMapper::toResponse);
    }

    private Customer getCustomerByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user"));

        return customerRepo.findByUserId(user.getId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy customer"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> getStylistAppointments(String email, boolean todayOnly, Pageable pageable) {
        Stylist stylist = getStylistByEmail(email);

        if (todayOnly) {
            return appointmentRepo.findByStylistIdAndAppointmentDate(stylist.getId(), LocalDate.now(), pageable)
                    .map(AppointmentMapper::toResponse);
        }

        return appointmentRepo.findByStylistId(stylist.getId(), pageable)
                .map(AppointmentMapper::toResponse);
    }

    private Stylist getStylistByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user"));

        return stylistRepo.findByUserId(user.getId()).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy stylist"));
    }

    @Override
    public AppointmentResponseDTO start(String email, Long appointmentId) {
        Stylist stylist = getStylistByEmail(email);

        Appointment appointment = getAppointmentForStylist(stylist.getId(), appointmentId);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ appointment CONFIRMED mới được bắt đầu");
        }

        appointment.setStatus(AppointmentStatus.IN_SERVICE);

        return AppointmentMapper.toResponse(appointmentRepo.save(appointment));
    }

    @Override
    public AppointmentResponseDTO complete(String email, Long appointmentId) {
        Stylist stylist = getStylistByEmail(email);

        Appointment appointment = getAppointmentForStylist(stylist.getId(), appointmentId);

        if (appointment.getStatus() != AppointmentStatus.IN_SERVICE) {
            throw new RuntimeException("Appointment chưa ở trạng thái IN_SERVICE");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);

        return AppointmentMapper.toResponse(appointmentRepo.save(appointment));
    }

    @Override
    public AppointmentResponseDTO updateNote(String email, Long appointmentId, String stylistNote) {
        Stylist stylist = getStylistByEmail(email);

        Appointment appointment = getAppointmentForStylist(stylist.getId(), appointmentId);

        appointment.setStylistNote(stylistNote);

        return AppointmentMapper.toResponse(appointmentRepo.save(appointment));
    }
}