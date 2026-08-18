package com.lca.service;

import com.lca.dtos.request.AppointmentRequestDTO;
import com.lca.dtos.response.AppointmentResponseDTO;

import java.util.List;

public interface AppointmentService {

    AppointmentResponseDTO create(AppointmentRequestDTO request);

    List<AppointmentResponseDTO> getMyAppointments(Long customerId);

    AppointmentResponseDTO getMyAppointmentById(Long customerId, Long appointmentId);

    void cancel(Long customerId, Long appointmentId);

    AppointmentResponseDTO reschedule(Long customerId, Long appointmentId, AppointmentRequestDTO request);

    List<AppointmentResponseDTO> getAll();

    AppointmentResponseDTO getById(Long id);

    AppointmentResponseDTO adminCreate(AppointmentRequestDTO request);

    AppointmentResponseDTO update(Long id, AppointmentRequestDTO request);

    AppointmentResponseDTO confirm(Long id);

    void adminCancel(Long id);

    AppointmentResponseDTO adminReschedule(Long id, AppointmentRequestDTO request);

    List<AppointmentResponseDTO> getMyAppointments(Long stylistId, boolean todayOnly);

    AppointmentResponseDTO getStylistAppointment(Long stylistId, Long appointmentId);

    AppointmentResponseDTO start(Long stylistId, Long appointmentId);

    AppointmentResponseDTO complete(Long stylistId, Long appointmentId);

    AppointmentResponseDTO updateNote(Long stylistId, Long appointmentId, String stylistNote);
}