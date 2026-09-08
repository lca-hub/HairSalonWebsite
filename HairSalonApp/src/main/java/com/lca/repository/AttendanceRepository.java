package com.lca.repository;

import com.lca.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {
    Optional<Attendance> findByScheduleId(Long scheduleId);

    Page<Attendance> findByStylistId(Long stylistId, Pageable pageable);

    Page<Attendance> findByScheduleWorkDate(LocalDate date, Pageable pageable);

    Page<Attendance> findByStylistIdAndScheduleWorkDate(Long stylistId, LocalDate date, Pageable pageable);

    Optional<Attendance> findByStylistIdAndScheduleWorkDate(Long stylistId, LocalDate date);
}