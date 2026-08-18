package com.lca.repository;

import com.lca.entity.Appointment;
import com.lca.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentCode(String appointmentCode);

    boolean existsByAppointmentCode(String appointmentCode);

    List<Appointment> findByCustomerId(Long customerId);

    List<Appointment> findByStylistId(Long stylistId);

    List<Appointment> findByStylistIdAndAppointmentDate(Long stylistId, LocalDate appointmentDate);

    List<Appointment> findByCustomerIdAndAppointmentDate(Long customerId, LocalDate appointmentDate);

    List<Appointment> findByStatusAndPaymentDeadlineBefore(AppointmentStatus status, LocalDateTime paymentDeadline);
}