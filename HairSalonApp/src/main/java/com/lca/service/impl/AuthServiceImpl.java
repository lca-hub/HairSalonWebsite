package com.lca.service.impl;

import com.lca.dtos.request.LoginRequestDTO;
import com.lca.dtos.response.LoginResponseDTO;
import com.lca.entity.User;
import com.lca.jwt.JwtService;
import com.lca.repository.UserRepository;
import com.lca.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new RuntimeException("Email hoặc mật khẩu không đúng"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {

            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        LoginResponseDTO response = new LoginResponseDTO();

        response.setUserId(user.getId());

        String fullname = user.getFirstName() + " " + user.getLastName();

        response.setFullname(fullname.trim());

        response.setEmail(user.getEmail());

        response.setRole(user.getRole());

        response.setAccessToken(accessToken);

        response.setRefreshToken(null);

        return response;
    }
}