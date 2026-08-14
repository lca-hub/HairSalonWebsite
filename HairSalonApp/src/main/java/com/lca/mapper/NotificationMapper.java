package com.lca.mapper;

import com.lca.dtos.response.NotificationResponseDTO;
import com.lca.entity.Notification;

public class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponseDTO toResponse(Notification notification) {

        NotificationResponseDTO dto = new NotificationResponseDTO();

        dto.setId(notification.getId());

        if (notification.getUser() != null) {
            dto.setUserId(notification.getUser().getId());
        }

        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());

        return dto;
    }
}
