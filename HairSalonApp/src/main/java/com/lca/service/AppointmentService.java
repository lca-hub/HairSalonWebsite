package com.lca.service;

import com.lca.dtos.request.AppointmentRequestDTO;
import com.lca.dtos.response.AppointmentResponseDTO;
import com.lca.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AppointmentService {

    AppointmentResponseDTO create(String email, AppointmentRequestDTO request);

    Page<AppointmentResponseDTO> getMyAppointments(String email, Pageable pageable);

    AppointmentResponseDTO getMyAppointmentById(String email, Long appointmentId);

    void cancel(String email, Long appointmentId);

    AppointmentResponseDTO reschedule(String email, Long appointmentId, AppointmentRequestDTO request);

    AppointmentResponseDTO getById(Long id);

    AppointmentResponseDTO adminCreate(AppointmentRequestDTO request);

    AppointmentResponseDTO update(Long id, AppointmentRequestDTO request);

    AppointmentResponseDTO confirm(Long id);

    void adminCancel(Long id);

    AppointmentResponseDTO adminReschedule(Long id, AppointmentRequestDTO request);

    Page<AppointmentResponseDTO> getAll(Pageable pageable);

    Page<AppointmentResponseDTO> search(Long customerId, Long stylistId, AppointmentStatus status, LocalDate date, LocalDate from, LocalDate to, Pageable pageabl);

    Page<AppointmentResponseDTO> getStylistAppointments(String email, boolean todayOnly, Pageable pageable);

    AppointmentResponseDTO getStylistAppointment(String email, Long appointmentId);

    AppointmentResponseDTO start(String email, Long appointmentId);

    AppointmentResponseDTO complete(String email, Long appointmentId);

    AppointmentResponseDTO updateNote(String email, Long appointmentId, String stylistNote);
}