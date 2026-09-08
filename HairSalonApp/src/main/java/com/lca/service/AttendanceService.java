package com.lca.service;

import com.lca.dtos.response.AttendanceResponseDTO;
import com.lca.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AttendanceService {

    AttendanceResponseDTO checkIn(Long userId);

    AttendanceResponseDTO checkOut(Long userId);

    Page<AttendanceResponseDTO> getMyAttendance(Long userId, Pageable pageable);

    AttendanceResponseDTO getToday(Long userId);

    Page<AttendanceResponseDTO> getAll(Pageable pageable);

    AttendanceResponseDTO getById(Long id);

    Page<AttendanceResponseDTO> getByStylist(Long stylistId, Pageable pageable);

    Page<AttendanceResponseDTO> getByDate(LocalDate date, Pageable pageable);

    Page<AttendanceResponseDTO> getByStylistAndDate(Long stylistId, LocalDate date, Pageable pageable);

    Page<AttendanceResponseDTO> search(Long stylistId, LocalDate date, AttendanceStatus status, Pageable pageable);
}