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
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final JavaMailSender mailSender;

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

        notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId(), Pageable.unpaged())
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
        return NotificationMapper.toResponse(
                notificationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"))
        );
    }

    @Override
    public NotificationResponseDTO create(Long userId, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now(vietnamZone));

        NotificationResponseDTO response = NotificationMapper.toResponse(
                notificationRepository.save(notification)
        );

        sendWebSocketNotification(user, response);
        sendEmailNotification(user, title, message);

        return response;
    }

    private void sendWebSocketNotification(User user, NotificationResponseDTO response) {
        try {
            messagingTemplate.convertAndSendToUser(
                    user.getEmail(),
                    "/queue/notifications",
                    response
            );
        } catch (Exception e) {
            System.err.println("Không thể gửi notification qua WebSocket cho user " + user.getId());
        }
    }

    @Async
    public void sendEmailNotification(User user, String title, String message) {
        try {
            if (user.getEmail() == null || user.getEmail().isBlank()) {
                return;
            }

            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(user.getEmail());
            mail.setSubject(title);
            mail.setText(message);

            mailSender.send(mail);
        } catch (Exception e) {
            System.err.println("Không thể gửi email notification cho user " + user.getId());
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}