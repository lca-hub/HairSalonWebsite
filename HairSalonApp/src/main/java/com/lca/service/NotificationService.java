package com.lca.service;

import com.lca.dtos.response.NotificationResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<NotificationResponseDTO> getMyNotifications(String email, Pageable pageable);

    Page<NotificationResponseDTO> getUnreadNotifications(String email, Pageable pageable);

    NotificationResponseDTO markAsRead(String email, Long notificationId);

    void markAllAsRead(String email);

    long countUnread(String email);

    Page<NotificationResponseDTO> getAll(Pageable pageable);

    NotificationResponseDTO getById(Long id);

    NotificationResponseDTO create(Long userId, String title, String message);
}