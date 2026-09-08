package com.lca.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequestDTO {

    private Long customerId;

    @NotNull
    private Long stylistId;

    @NotNull
    private Long serviceId;

    @NotNull
    private LocalDate appointmentDate;

    @NotNull
    private LocalTime startTime;

    private String customerNote;
}