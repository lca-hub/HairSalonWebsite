package com.lca.service.impl;

import com.lca.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Hair Salon - Mã OTP đặt lại mật khẩu");

        message.setText(
                "Xin chào,\n\n"
                        + "Mã OTP để đặt lại mật khẩu của bạn là: " + otp + "\n\n"
                        + "Mã OTP có hiệu lực trong 5 phút.\n"
                        + "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n"
                        + "Hair Salon"
        );

        mailSender.send(message);
    }

    @Override
    @Async
    public void sendSimpleEmail(String toEmail, String subject, String text) {

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(text);

            System.out.println("Đang gửi email qua Gmail SMTP...");

            mailSender.send(message);

            System.out.println("EMAIL SUCCESS: Đã gửi email tới " + toEmail);
        } catch (Exception e) {
            System.out.println("EMAIL ERROR: Không thể gửi email tới " + toEmail);
            e.printStackTrace();
        }

        System.out.println("========== EMAIL END ==========");
    }
}