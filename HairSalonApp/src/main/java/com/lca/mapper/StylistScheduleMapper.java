package com.lca.mapper;

import com.lca.dtos.request.StylistScheduleRequestDTO;
import com.lca.dtos.response.StylistScheduleResponseDTO;
import com.lca.entity.StylistSchedule;

public class StylistScheduleMapper {

    private StylistScheduleMapper() {
    }

    public static StylistScheduleResponseDTO toResponse(StylistSchedule schedule) {

        StylistScheduleResponseDTO dto = new StylistScheduleResponseDTO();

        dto.setId(schedule.getId());

        if (schedule.getStylist() != null) {
            dto.setStylistId(schedule.getStylist().getId());

            if (schedule.getStylist().getUser() != null) {
                dto.setStylistName(schedule.getStylist().getUser().getFullname());
            }
        }

        dto.setWorkDate(schedule.getWorkDate());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setIsOff(schedule.getIsOff());

        return dto;
    }

    public static void updateEntity(StylistSchedule schedule, StylistScheduleRequestDTO dto) {

        schedule.setWorkDate(dto.getWorkDate());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setIsOff(dto.getIsOff() != null ? dto.getIsOff() : false);
    }
}