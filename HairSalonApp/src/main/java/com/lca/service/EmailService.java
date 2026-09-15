package com.lca.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otp);

    void sendSimpleEmail(String toEmail, String subject, String text);
}