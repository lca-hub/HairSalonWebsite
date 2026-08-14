package com.lca.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponseDTO {

    private Long id;

    private Long userId;

    private String title;

    private String message;

    private Boolean isRead;

    private LocalDateTime createdAt;
}