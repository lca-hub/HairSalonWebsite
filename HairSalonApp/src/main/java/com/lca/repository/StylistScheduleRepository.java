package com.lca.repository;

import com.lca.entity.StylistSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StylistScheduleRepository extends JpaRepository<StylistSchedule, Long> {

    List<StylistSchedule> findByStylistId(Long stylistId);

    List<StylistSchedule> findByStylistIdAndWorkDate(Long stylistId, LocalDate workDate);

    List<StylistSchedule> findByWorkDate(LocalDate workDate);

    Optional<StylistSchedule> findFirstByStylistIdAndWorkDate(Long stylistId, LocalDate workDate);

}