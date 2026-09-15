package com.lca.service.impl;

import com.lca.dtos.request.StylistScheduleRequestDTO;
import com.lca.dtos.response.StylistScheduleResponseDTO;
import com.lca.entity.Appointment;
import com.lca.entity.Service;
import com.lca.entity.Stylist;
import com.lca.entity.StylistSchedule;
import com.lca.enums.AppointmentStatus;
import com.lca.mapper.StylistScheduleMapper;
import com.lca.repository.AppointmentRepository;
import com.lca.repository.ServiceRepository;
import com.lca.repository.StylistRepository;
import com.lca.repository.StylistScheduleRepository;
import com.lca.service.StylistScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class StylistScheduleServiceImpl implements StylistScheduleService {

    private final StylistScheduleRepository scheduleRepository;
    private final StylistRepository stylistRepository;
    private final ServiceRepository serviceRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StylistScheduleResponseDTO> getByStylist(Long stylistId) {

        stylistRepository.findById(stylistId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + stylistId));

        return scheduleRepository.findByStylistId(stylistId).stream()
                .sorted(Comparator.comparing(StylistSchedule::getWorkDate))
                .map(StylistScheduleMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StylistScheduleResponseDTO> getByStylistAndDate(Long stylistId, LocalDate workDate) {

        stylistRepository.findById(stylistId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + stylistId));

        return scheduleRepository.findByStylistIdAndWorkDate(stylistId, workDate).stream()
                .map(StylistScheduleMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailableSlots(Long stylistId, LocalDate workDate, Long serviceId) {

        Stylist stylist = stylistRepository.findById(stylistId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + stylistId));

        Service service = serviceRepository.findById(serviceId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + serviceId));

        if (!Boolean.TRUE.equals(service.getIsActive())) {
            throw new RuntimeException("Dịch vụ hiện không hoạt động");
        }

        List<StylistSchedule> schedules = scheduleRepository.findByStylistIdAndWorkDate(stylist.getId(), workDate);

        if (schedules.isEmpty()) {
            return List.of();
        }

        StylistSchedule schedule = schedules.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsOff())).findFirst().orElse(null);

        if (schedule == null) {
            return List.of();
        }

        List<Appointment> appointments = appointmentRepository.findByStylistIdAndAppointmentDate(stylistId, workDate, Pageable.unpaged()).getContent();

        List<String> availableSlots = new ArrayList<>();

        LocalTime cursor = schedule.getStartTime();

        int duration = service.getDurationMinutes();

        while (!cursor.plusMinutes(duration).isAfter(schedule.getEndTime())) {

            LocalTime slotStart = cursor;

            LocalTime slotEnd = cursor.plusMinutes(duration);

            boolean conflicted = appointments.stream()
                    .anyMatch(appointment -> isOverlapping(slotStart, slotEnd, appointment));
            if (!conflicted) {
                availableSlots.add(slotStart.toString());
            }

            cursor = cursor.plusMinutes(30);
        }

        return availableSlots;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StylistScheduleResponseDTO> getMySchedule(String email) {

        Stylist stylist = stylistRepository.findAll().stream()
                .filter(item -> item.getUser() != null && item.getUser().getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy stylist với email: " + email));

        return scheduleRepository.findByStylistId(stylist.getId()).stream()
                .sorted(Comparator.comparing(StylistSchedule::getWorkDate))
                .map(StylistScheduleMapper::toResponse)
                .toList();
    }


    private boolean isOverlapping(LocalTime slotStart, LocalTime slotEnd, Appointment appointment) {

        AppointmentStatus status = appointment.getStatus();

        if (status == AppointmentStatus.CANCELLED || status == AppointmentStatus.NO_SHOW) {
            return false;
        }

        LocalTime appointmentStart = appointment.getStartTime();

        LocalTime appointmentEnd = appointment.getEndTime();

        return slotStart.isBefore(appointmentEnd) && slotEnd.isAfter(appointmentStart);
    }

    @Override
    public StylistScheduleResponseDTO create(StylistScheduleRequestDTO request) {

        Stylist stylist = stylistRepository.findById(request.getStylistId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + request.getStylistId()));

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
        }

        List<StylistSchedule> existing = scheduleRepository.findByStylistIdAndWorkDate(request.getStylistId(), request.getWorkDate());

        if (!existing.isEmpty()) {
            throw new RuntimeException("Stylist đã có lịch làm việc trong ngày này");
        }

        StylistSchedule schedule = StylistScheduleMapper.toEntity(request);

        schedule.setStylist(stylist);

        if (schedule.getIsOff() == null) {
            schedule.setIsOff(false);
        }

        StylistSchedule saved = scheduleRepository.save(schedule);

        return StylistScheduleMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StylistScheduleResponseDTO> getAll() {

        return scheduleRepository.findAll().stream().sorted(Comparator.comparing(StylistSchedule::getWorkDate))
                .map(StylistScheduleMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StylistScheduleResponseDTO getById(Long id) {

        StylistSchedule schedule = scheduleRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy lịch làm việc với ID: " + id));

        return StylistScheduleMapper.toResponse(schedule);
    }

    @Override
    public StylistScheduleResponseDTO update(Long id, StylistScheduleRequestDTO request) {

        StylistSchedule schedule = scheduleRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy lịch làm việc với ID: " + id));

        Stylist stylist = stylistRepository.findById(request.getStylistId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + request.getStylistId()));

        if (!request.getStartTime().isBefore(request.getEndTime())) {

            throw new RuntimeException("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
        }


        List<StylistSchedule> existing = scheduleRepository.findByStylistIdAndWorkDate(request.getStylistId(), request.getWorkDate());

        boolean duplicate = existing.stream().anyMatch(item -> !item.getId().equals(id));

        if (duplicate) {
            throw new RuntimeException("Stylist đã có lịch trong ngày này");
        }

        StylistScheduleMapper.updateEntity(schedule, request);

        schedule.setStylist(stylist);

        StylistSchedule updated = scheduleRepository.save(schedule);

        return StylistScheduleMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {

        StylistSchedule schedule = scheduleRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy lịch làm việc với ID: " + id));

        List<Appointment> appointments = appointmentRepository.findByStylistIdAndAppointmentDate(schedule.getStylist().getId(), schedule.getWorkDate(), Pageable.unpaged()).getContent();

        boolean hasAppointment = appointments.stream()
                .anyMatch(appointment -> appointment.getStatus() != AppointmentStatus.CANCELLED);

        if (hasAppointment) {
            throw new RuntimeException("Không thể xóa lịch làm việc đã có lịch hẹn");
        }

        scheduleRepository.delete(schedule);
    }
}