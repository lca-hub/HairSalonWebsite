package com.lca.dtos.response;

import com.lca.enums.AppointmentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class AppointmentResponseDTO {

    private Long id;

    private String appointmentCode;

    private Long customerId;
    private String customerName;

    private Long stylistId;
    private String stylistName;

    private Long serviceId;
    private String serviceName;

    private LocalDate appointmentDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private BigDecimal bookingAmount;

    private AppointmentStatus status;

    private LocalDateTime paymentDeadline;

    private String customerNote;

    private String stylistNote;
}
