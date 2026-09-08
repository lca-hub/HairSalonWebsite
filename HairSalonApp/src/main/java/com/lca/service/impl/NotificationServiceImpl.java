package com.lca.service.impl;

import com.lca.dtos.response.NotificationResponseDTO;
import com.lca.entity.Notification;
import com.lca.entity.User;
import com.lca.mapper.NotificationMapper;
import com.lca.repository.NotificationRepository;
import com.lca.repository.UserRepository;
import com.lca.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public Page<NotificationResponseDTO> getMyNotifications(String email, Pageable pageable) {
        User user = getUserByEmail(email);

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable).map(NotificationMapper::toResponse);
    }

    @Override
    public Page<NotificationResponseDTO> getUnreadNotifications(String email, Pageable pageable) {
        User user = getUserByEmail(email);

        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId(), pageable).map(NotificationMapper::toResponse);
    }

    @Override
    public NotificationResponseDTO markAsRead(String email, Long notificationId) {
        User user = getUserByEmail(email);

        Notification notification = notificationRepository.findById(notificationId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy thông báo"));

        if (notification.getUser() == null || !notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Thông báo không thuộc về người dùng");
        }

        notification.setIsRead(true);

        return NotificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead(String email) {
        User user = getUserByEmail(email);

        notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId(), Pageable.unpaged())
                .forEach(notification -> notification.setIsRead(true));

        notificationRepository.flush();
    }

    @Override
    public long countUnread(String email) {
        User user = getUserByEmail(email);

        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    public Page<NotificationResponseDTO> getAll(Pageable pageable) {
        return notificationRepository.findAll(pageable).map(NotificationMapper::toResponse);
    }

    @Override
    public NotificationResponseDTO getById(Long id) {
        return NotificationMapper.toResponse(notificationRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy thông báo")));
    }

    @Override
    public NotificationResponseDTO create(Long userId, String title, String message) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(java.time.LocalDateTime.now());

        return NotificationMapper.toResponse(notificationRepository.save(notification));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy người dùng")
                );
    }
}