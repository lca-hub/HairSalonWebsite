package com.lca.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class StylistScheduleRequestDTO {

    @NotNull(message = "Stylist ID không được để trống")
    private Long stylistId;

    @NotNull(message = "Ngày làm việc không được để trống")
    private LocalDate workDate;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    private LocalTime endTime;

    private Boolean isOff = false;
}