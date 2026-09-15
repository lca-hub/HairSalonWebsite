package com.lca.mapper;

import com.lca.dtos.request.AppointmentRequestDTO;
import com.lca.dtos.response.AppointmentResponseDTO;
import com.lca.entity.Appointment;

public class AppointmentMapper {

    public static Appointment toEntity(AppointmentRequestDTO dto) {

        Appointment appointment = new Appointment();

        appointment.setAppointmentDate(dto.getAppointmentDate());

        appointment.setStartTime(dto.getStartTime());

        appointment.setCustomerNote(dto.getCustomerNote());

        return appointment;
    }


    public static AppointmentResponseDTO toResponse(Appointment appointment) {

        AppointmentResponseDTO dto = new AppointmentResponseDTO();

        dto.setId(appointment.getId());
        dto.setAppointmentCode(appointment.getAppointmentCode());

        dto.setAppointmentDate(appointment.getAppointmentDate());

        dto.setStartTime(appointment.getStartTime());

        dto.setEndTime(appointment.getEndTime());

        dto.setBookingAmount(appointment.getBookingAmount());

        dto.setStatus(appointment.getStatus());

        dto.setPaymentDeadline(appointment.getPaymentDeadline());

        dto.setCustomerNote(appointment.getCustomerNote());

        dto.setStylistNote(appointment.getStylistNote());

        if (appointment.getCustomer() != null) {
            dto.setCustomerId(appointment.getCustomer().getId());

            if (appointment.getCustomer().getUser() != null) {
                var user = appointment.getCustomer().getUser();

                dto.setCustomerName((user.getFirstName() + " " + user.getLastName()).trim());
            }
        }

        if (appointment.getStylist() != null) {
            dto.setStylistId(appointment.getStylist().getId());

            if (appointment.getStylist().getUser() != null) {
                var user = appointment.getStylist().getUser();

                dto.setStylistName((user.getFirstName() + " " + user.getLastName()).trim());
            }
        }

        if (appointment.getService() != null) {
            dto.setServiceId(appointment.getService().getId());

            dto.setServiceName(appointment.getService().getName());
        }

        return dto;
    }
}