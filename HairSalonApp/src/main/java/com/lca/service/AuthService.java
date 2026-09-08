package com.lca.service;

import com.lca.dtos.request.*;
import com.lca.dtos.response.LoginResponseDTO;
import com.lca.dtos.response.UserResponseDTO;

public interface AuthService {

    LoginResponseDTO login(LoginRequestDTO request);

    void forgotPassword(ForgotPasswordRequestDTO request);

    void verifyOtp(VerifyOtpRequestDTO request);

    void resetPassword(ResetPasswordRequestDTO request);

    UserResponseDTO register(RegisterRequestDTO request);
}