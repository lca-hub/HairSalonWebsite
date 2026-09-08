package com.lca.service.impl;

import com.lca.dtos.response.AttendanceResponseDTO;
import com.lca.entity.Attendance;
import com.lca.entity.Stylist;
import com.lca.entity.StylistSchedule;
import com.lca.enums.AttendanceStatus;
import com.lca.mapper.AttendanceMapper;
import com.lca.repository.AttendanceRepository;
import com.lca.repository.StylistRepository;
import com.lca.repository.StylistScheduleRepository;
import com.lca.service.AttendanceService;
import com.lca.specification.AttendanceSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StylistRepository stylistRepository;
    private final StylistScheduleRepository stylistScheduleRepository;

    @Override
    public AttendanceResponseDTO checkIn(Long userId) {
        Stylist stylist = stylistRepository.findByUserId(userId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist"));
        StylistSchedule schedule = stylistScheduleRepository.findFirstByStylistIdAndWorkDate(stylist.getId(), LocalDate.now()).orElseThrow(
                () -> new RuntimeException("Hôm nay stylist không có lịch làm việc"));
        if (Boolean.TRUE.equals(schedule.getIsOff()))
            throw new RuntimeException("Hôm nay là ngày nghỉ");
        if (attendanceRepository.findByScheduleId(schedule.getId()).isPresent())
            throw new RuntimeException("Stylist đã check-in hôm nay");

        Attendance attendance = new Attendance();
        attendance.setStylist(stylist);
        attendance.setSchedule(schedule);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setAttendanceStatus(LocalDateTime.now()
                .toLocalTime().isAfter(schedule.getStartTime()) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT);
        return AttendanceMapper.toResponse(attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceResponseDTO checkOut(Long userId) {
        Stylist stylist = stylistRepository.findByUserId(userId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist"));
        Attendance attendance = attendanceRepository.findByStylistIdAndScheduleWorkDate(stylist.getId(), LocalDate.now()).orElseThrow(
                () -> new RuntimeException("Stylist chưa check-in hôm nay"));
        if (attendance.getCheckOutTime() != null)
            throw new RuntimeException("Stylist đã check-out");

        LocalDateTime checkOutTime = LocalDateTime.now();
        attendance.setCheckOutTime(checkOutTime);

        long minutes = Duration.between(attendance.getCheckInTime(), checkOutTime).toMinutes();
        attendance.setTotalHours(BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP));
        attendance.setAttendanceStatus(AttendanceStatus.COMPLETED);

        return AttendanceMapper.toResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponseDTO> getMyAttendance(Long userId, Pageable pageable) {
        Stylist stylist = stylistRepository.findByUserId(userId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist"));
        return attendanceRepository.findByStylistId(stylist.getId(), pageable).map(AttendanceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponseDTO getToday(Long userId) {
        Stylist stylist = stylistRepository.findByUserId(userId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist"));
        Attendance attendance = attendanceRepository.findByStylistIdAndScheduleWorkDate(stylist.getId(), LocalDate.now()).orElseThrow(() -> new RuntimeException("Hôm nay chưa có dữ liệu điểm danh"));
        return AttendanceMapper.toResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponseDTO> getAll(Pageable pageable) {
        return attendanceRepository.findAll(pageable).map(AttendanceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponseDTO getById(Long id) {
        Attendance attendance = attendanceRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy bản ghi điểm danh với ID: " + id));
        return AttendanceMapper.toResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponseDTO> getByStylist(Long stylistId, Pageable pageable) {
        if (!stylistRepository.existsById(stylistId))
            throw new RuntimeException("Không tìm thấy stylist với ID: " + stylistId);
        return attendanceRepository.findByStylistId(stylistId, pageable).map(AttendanceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponseDTO> getByDate(LocalDate date, Pageable pageable) {
        return attendanceRepository.findByScheduleWorkDate(date, pageable).map(AttendanceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponseDTO> getByStylistAndDate(Long stylistId, LocalDate date, Pageable pageable) {
        if (!stylistRepository.existsById(stylistId))
            throw new RuntimeException("Không tìm thấy stylist với ID: " + stylistId);
        return attendanceRepository.findByStylistIdAndScheduleWorkDate(stylistId, date, pageable).map(AttendanceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponseDTO> search(Long stylistId, LocalDate date, AttendanceStatus status, Pageable pageable) {
        Specification<Attendance> specification = Specification.where(AttendanceSpecification.stylistId(stylistId))
                .and(AttendanceSpecification.date(date))
                .and(AttendanceSpecification.status(status));
        return attendanceRepository.findAll(specification, pageable).map(AttendanceMapper::toResponse);
    }
}