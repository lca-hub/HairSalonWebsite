package com.lca.repository;

import com.lca.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByScheduleId(Long scheduleId);

    List<Attendance> findByStylistId(Long stylistId);
}