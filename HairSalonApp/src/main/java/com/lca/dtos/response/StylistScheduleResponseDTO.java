package com.lca.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class StylistScheduleResponseDTO {

    private Long id;

    private Long stylistId;

    private String stylistName;

    private LocalDate workDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Boolean isOff;
}