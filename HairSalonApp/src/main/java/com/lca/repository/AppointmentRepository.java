package com.lca.repository;

import com.lca.entity.Appointment;
import com.lca.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment> {
    Optional<Appointment> findByAppointmentCode(String appointmentCode);

    boolean existsByAppointmentCode(String appointmentCode);

    Page<Appointment> findByCustomerId(Long customerId, Pageable pageable);

    Page<Appointment> findByStylistId(Long stylistId, Pageable pageable);

    Page<Appointment> findByStylistIdAndAppointmentDate(Long stylistId, LocalDate appointmentDate, Pageable pageable);

    List<Appointment> findByCustomerIdAndAppointmentDate(Long customerId, LocalDate appointmentDate);

    List<Appointment> findByAppointmentDateBetween(LocalDate from, LocalDate to);

    long countByStatus(AppointmentStatus status);

    List<Appointment> findByStatusAndPaymentDeadlineBefore(AppointmentStatus status, LocalDateTime paymentDeadline);
}