package com.lca.dtos.response;

import com.lca.enums.AttendanceStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class AttendanceResponseDTO {

    private Long id;

    private Long stylistId;

    private String stylistName;

    private Long scheduleId;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private BigDecimal totalHours;

    private AttendanceStatus attendanceStatus;
}