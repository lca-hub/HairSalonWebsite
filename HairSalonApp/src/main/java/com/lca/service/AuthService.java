package com.lca.service;

import com.lca.dtos.request.ForgotPasswordRequestDTO;
import com.lca.dtos.request.LoginRequestDTO;
import com.lca.dtos.request.ResetPasswordRequestDTO;
import com.lca.dtos.request.VerifyOtpRequestDTO;
import com.lca.dtos.response.LoginResponseDTO;

public interface AuthService {

    LoginResponseDTO login(LoginRequestDTO request);

    void forgotPassword(ForgotPasswordRequestDTO request);

    void verifyOtp(VerifyOtpRequestDTO request);

    void resetPassword(ResetPasswordRequestDTO request);
}