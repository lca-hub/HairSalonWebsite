package com.lca.service.impl;

import com.lca.dtos.request.AppointmentRequestDTO;
import com.lca.dtos.response.AppointmentResponseDTO;
import com.lca.entity.Appointment;
import com.lca.entity.AppointmentSlot;
import com.lca.entity.Customer;
import com.lca.entity.Service;
import com.lca.entity.Stylist;
import com.lca.enums.AppointmentStatus;
import com.lca.mapper.AppointmentMapper;
import com.lca.repository.AppointmentRepository;
import com.lca.repository.AppointmentSlotRepository;
import com.lca.repository.CustomerRepository;
import com.lca.repository.ServiceRepository;
import com.lca.repository.StylistRepository;
import com.lca.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    @Override
    public AppointmentResponseDTO create(
            AppointmentRequestDTO request) {

        Customer customer = customerRepo.findById(request.getCustomerId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy customer với ID: " + request.getCustomerId()));

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

        LocalDateTime now = LocalDateTime.now();

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

            return AppointmentMapper.toResponse(saved);

        } catch (DataIntegrityViolationException e) {

            throw new RuntimeException("Khung giờ này vừa được người khác đặt. " + "Vui lòng chọn giờ khác.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getMyAppointments(Long customerId) {

        customerRepo.findById(customerId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy customer"));

        return appointmentRepo.findByCustomerId(customerId).stream().map(AppointmentMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getMyAppointmentById(Long customerId, Long appointmentId) {

        Appointment appointment = appointmentRepo.findById(appointmentId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy appointment"));

        if (!appointment.getCustomer().getId().equals(customerId)) {

            throw new RuntimeException("Bạn không có quyền xem appointment này");
        }

        return AppointmentMapper.toResponse(appointment);
    }

    @Override
    public void cancel(Long customerId, Long appointmentId) {

        Appointment appointment = getCustomerAppointment(customerId, appointmentId);

        AppointmentStatus status = appointment.getStatus();

        if (status == AppointmentStatus.CANCELLED) {

            throw new RuntimeException("Appointment đã bị hủy");
        }

        if (status == AppointmentStatus.EXPIRED) {

            throw new RuntimeException("Appointment đã hết hạn thanh toán");
        }

        if (status == AppointmentStatus.COMPLETED) {

            throw new RuntimeException("Appointment đã hoàn thành");
        }

        if (status == AppointmentStatus.IN_SERVICE) {

            throw new RuntimeException("Appointment đang được thực hiện");
        }

        if (status == AppointmentStatus.PENDING_PAYMENT) {

            releaseSlots(appointment.getId());

            appointment.setStatus(AppointmentStatus.CANCELLED
            );

            appointmentRepo.save(appointment);

            return;
        }

        LocalDateTime appointmentTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
        Duration remaining = Duration.between(LocalDateTime.now(), appointmentTime);

        if (!remaining.isNegative() && remaining.compareTo(Duration.ofHours(24)) >= 0) {

            appointment.setRefundAmount(appointment.getBookingAmount());

        } else {
            appointment.setRefundAmount(BigDecimal.ZERO);
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        releaseSlots(appointment.getId());

        appointmentRepo.save(appointment);
    }

    @Override
    public AppointmentResponseDTO reschedule(Long customerId, Long appointmentId, AppointmentRequestDTO request) {

        Appointment appointment = getCustomerAppointment(customerId, appointmentId);

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

        Service service = serviceRepo.findById(request.getServiceId()).orElseThrow(() -> new RuntimeException("Không tìm thấy service"));

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

        return AppointmentMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAll() {

        return appointmentRepo.findAll().stream().map(AppointmentMapper::toResponse).toList();
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
        return create(request);
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
    public AppointmentResponseDTO confirm(Long id) {

        Appointment appointment = appointmentRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy appointment"));

        if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {

            throw new RuntimeException("Appointment không ở trạng thái PENDING_PAYMENT");
        }

        if (appointment.getPaymentDeadline() != null && LocalDateTime.now().isAfter(appointment.getPaymentDeadline())) {

            releaseSlots(appointment.getId());

            appointment.setStatus(AppointmentStatus.EXPIRED);

            appointmentRepo.save(appointment);

            throw new RuntimeException("Thời gian thanh toán đã hết");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);

        appointment.setPaymentDeadline(null);

        return AppointmentMapper.toResponse(appointmentRepo.save(appointment));
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
    public List<AppointmentResponseDTO> getMyAppointments(Long stylistId, boolean todayOnly) {

        if (todayOnly) {
            return appointmentRepo.findByStylistIdAndAppointmentDate(stylistId, LocalDate.now()).stream().map(AppointmentMapper::toResponse).toList();
        }

        return appointmentRepo.findByStylistId(stylistId).stream().map(AppointmentMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getStylistAppointment(Long stylistId, Long appointmentId) {

        Appointment appointment = appointmentRepo.findById(appointmentId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy appointment"));

        if (!appointment.getStylist().getId().equals(stylistId)) {

            throw new RuntimeException("Appointment không thuộc stylist này");}

        return AppointmentMapper.toResponse(appointment);
    }

    @Override
    public AppointmentResponseDTO start(Long stylistId, Long appointmentId) {

        Appointment appointment = getAppointmentForStylist(stylistId, appointmentId);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ appointment CONFIRMED mới được bắt đầu");
        }

        appointment.setStatus(AppointmentStatus.IN_SERVICE);

        return AppointmentMapper.toResponse(appointmentRepo.save(appointment));
    }

    @Override
    public AppointmentResponseDTO complete(Long stylistId, Long appointmentId) {

        Appointment appointment = getAppointmentForStylist(stylistId, appointmentId);

        if (appointment.getStatus() != AppointmentStatus.IN_SERVICE) {

            throw new RuntimeException("Appointment chưa ở trạng thái IN_SERVICE");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);

        return AppointmentMapper.toResponse(appointmentRepo.save(appointment));
    }

    @Override
    public AppointmentResponseDTO updateNote(Long stylistId, Long appointmentId, String stylistNote) {

        Appointment appointment = getAppointmentForStylist(stylistId, appointmentId);

        appointment.setStylistNote(stylistNote);

        return AppointmentMapper.toResponse(appointmentRepo.save(appointment));
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

        List<Appointment> appointments = appointmentRepo.findByStylistIdAndAppointmentDate(stylistId, appointmentDate);

        boolean conflict = appointments.stream()
                .filter(appointment -> ignoredAppointmentId == null || !appointment.getId().equals(ignoredAppointmentId))
                .filter(this::occupiesSlot).anyMatch(appointment -> isOverlapping(startTime, endTime, appointment.getStartTime(), appointment.getEndTime()));

        if (conflict) {

            throw new RuntimeException("Khung giờ này đã có người đặt");
        }
    }
    private boolean occupiesSlot(Appointment appointment) {

        AppointmentStatus status = appointment.getStatus();
        return status != AppointmentStatus.CANCELLED && status != AppointmentStatus.NO_SHOW
                && status != AppointmentStatus.EXPIRED;
    }

    private boolean isOverlapping(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {

        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    private void checkSchedule(Long stylistId, LocalDate workDate, LocalTime startTime, LocalTime endTime) {

        boolean valid = stylistRepo.findById(stylistId).map(stylist -> true).orElse(false);

        if (!valid) {
            throw new RuntimeException("Không tìm thấy stylist");
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

        return "APM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}