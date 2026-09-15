package com.lca.controllers.api;

import com.lca.dtos.response.PaymentUrlResponseDTO;
import com.lca.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/vnpay/create")
    public ResponseEntity<PaymentUrlResponseDTO> createVnpayPayment(
            Authentication authentication,
            @RequestParam Long appointmentId,
            HttpServletRequest request
    ) {
        String clientIp = getClientIp(request);

        return ResponseEntity.ok(paymentService.createVnpayPayment(authentication.getName(), appointmentId, clientIp));
    }

    @PostMapping("/vnpay/create-order")
    public ResponseEntity<PaymentUrlResponseDTO> createVnpayProductOrderPayment(
            Authentication authentication,
            @RequestParam Long orderId,
            HttpServletRequest request
    ) {
        String clientIp = getClientIp(request);

        return ResponseEntity.ok(paymentService.createVnpayProductOrderPayment(authentication.getName(), orderId, clientIp));
    }

    @GetMapping("/vnpay/return")
    public void vnpayReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response
    ) throws IOException {
        String redirectUrl = paymentService.handleVnpayReturn(params);

        response.sendRedirect(redirectUrl.replaceFirst("^redirect:", ""));
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<String> vnpayIpn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(paymentService.handleVnpayIpn(params));
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");

        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }
}