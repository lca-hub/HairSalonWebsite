package com.lca.mapper;

import com.lca.dtos.response.AppointmentResponseDTO;
import com.lca.entity.Appointment;

public class AppointmentMapper {

    public static AppointmentResponseDTO toResponse(Appointment appointment) {

        AppointmentResponseDTO dto = new AppointmentResponseDTO();

        dto.setId(appointment.getId());
        dto.setAppointmentCode(appointment.getAppointmentCode());

        dto.setAppointmentDate(appointment.getAppointmentDate());

        dto.setStartTime(appointment.getStartTime());

        dto.setEndTime(appointment.getEndTime());

        dto.setBookingAmount(appointment.getBookingAmount());

        dto.setStatus(appointment.getStatus());

        dto.setCustomerNote(appointment.getCustomerNote());

        dto.setStylistNote(appointment.getStylistNote());

        if (appointment.getCustomer() != null) {
            dto.setCustomerId(appointment.getCustomer().getId());

            if (appointment.getCustomer().getUser() != null) {
                dto.setCustomerName(appointment.getCustomer().getUser().getFullname());
            }
        }

        if (appointment.getStylist() != null) {
            dto.setStylistId(appointment.getStylist().getId());

            if (appointment.getStylist().getUser() != null) {
                dto.setStylistName(appointment.getStylist().getUser().getFullname());
            }
        }

        if (appointment.getService() != null) {
            dto.setServiceId(appointment.getService().getId());

            dto.setServiceName(appointment.getService().getName());
        }

        return dto;
    }
}
