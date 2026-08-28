package com.lca.controllers.api;

import com.lca.dtos.request.ForgotPasswordRequestDTO;
import com.lca.dtos.request.LoginRequestDTO;
import com.lca.dtos.request.ResetPasswordRequestDTO;
import com.lca.dtos.request.VerifyOtpRequestDTO;
import com.lca.dtos.response.LoginResponseDTO;
import com.lca.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("OTP đã được gửi đến email");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok("OTP hợp lệ");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công");
    }
}