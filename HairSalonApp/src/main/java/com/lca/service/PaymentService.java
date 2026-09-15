package com.lca.service;

import com.lca.dtos.response.PaymentUrlResponseDTO;

import java.util.Map;

public interface PaymentService {

    PaymentUrlResponseDTO createVnpayPayment(String email, Long appointmentId, String clientIp);

    String handleVnpayReturn(Map<String, String> params);

    String handleVnpayIpn(Map<String, String> params);
}