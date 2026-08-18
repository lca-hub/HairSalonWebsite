package com.lca.service;

import com.lca.dtos.request.LoginRequestDTO;
import com.lca.dtos.response.LoginResponseDTO;

public interface AuthService {

    LoginResponseDTO login(LoginRequestDTO request);
}