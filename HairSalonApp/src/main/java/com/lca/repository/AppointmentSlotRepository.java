package com.lca.repository;

import com.lca.entity.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {

    boolean existsByStylistIdAndSlotDateAndSlotTime(Long stylistId, LocalDate slotDate, LocalTime slotTime);
    void deleteByAppointmentId(Long appointmentId);
}