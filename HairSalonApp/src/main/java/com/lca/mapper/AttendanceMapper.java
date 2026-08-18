package com.lca.mapper;

import com.lca.dtos.response.AttendanceResponseDTO;
import com.lca.entity.Attendance;

public class AttendanceMapper {

    private AttendanceMapper() {
    }

    public static AttendanceResponseDTO toResponse(Attendance attendance) {

        AttendanceResponseDTO dto = new AttendanceResponseDTO();

        dto.setId(attendance.getId());

        if (attendance.getStylist() != null) {
            dto.setStylistId(attendance.getStylist().getId());

            if (attendance.getStylist().getUser() != null) {
                var user = attendance.getStylist().getUser();

                dto.setStylistName((user.getFirstName() + " " + user.getLastName()).trim());

            }
        }

        if (attendance.getSchedule() != null) {
            dto.setScheduleId(attendance.getSchedule().getId());
        }

        dto.setCheckInTime(attendance.getCheckInTime());

        dto.setCheckOutTime(attendance.getCheckOutTime());

        dto.setTotalHours(attendance.getTotalHours());

        dto.setAttendanceStatus(attendance.getAttendanceStatus());

        return dto;
    }
}
