package com.lca.service.impl;

import com.lca.dtos.request.*;
import com.lca.dtos.response.LoginResponseDTO;
import com.lca.dtos.response.UserResponseDTO;
import com.lca.entity.Customer;
import com.lca.entity.User;
import com.lca.enums.Role;
import com.lca.jwt.JwtService;
import com.lca.mapper.UserMapper;
import com.lca.repository.CustomerRepository;
import com.lca.repository.UserRepository;
import com.lca.service.AuthService;
import com.lca.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final CustomerRepository customerRepo;

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private final SecureRandom secureRandom = new SecureRandom();

    private static final int OTP_EXPIRATION_MINUTES = 5;

    @Override
    public UserResponseDTO register(RegisterRequestDTO request) {

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký");
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank() && userRepo.existsByPhoneNumber(request.getPhoneNumber())) {

            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại đã được đăng ký");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(Role.CUSTOMER);

        user.setIsActive(true);

        User savedUser = userRepo.save(user);

        Customer customer = new Customer();

        customer.setUser(savedUser);
        customer.setTotalVisits(0);
        customer.setTotalSpent(BigDecimal.ZERO);

        customerRepo.save(customer);

        return UserMapper.toResponse(savedUser);
    }

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepo.findByEmail(request.getEmail()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy tài khoản"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        LoginResponseDTO response = new LoginResponseDTO();

        response.setAccessToken(accessToken);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        return response;
    }

    @Override
    public void forgotPassword(ForgotPasswordRequestDTO request) {

        User user = userRepo.findByEmail(request.getEmail()).orElseThrow(
                () -> new RuntimeException("Email chưa được đăng ký"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        String otp = generateOtp();
        otpStorage.put(user.getEmail(), new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES), false));

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    public void verifyOtp(VerifyOtpRequestDTO request) {

        OtpData otpData = otpStorage.get(request.getEmail());

        validateOtp(request.getEmail(), request.getOtp(), otpData);

        otpData.setVerified(true);
    }

    @Override
    public void resetPassword(ResetPasswordRequestDTO request) {

        OtpData otpData = otpStorage.get(request.getEmail());

        validateOtp(request.getEmail(), request.getOtp(), otpData);

        if (!otpData.isVerified()) {
            throw new RuntimeException("Vui lòng xác thực OTP trước");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {

            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        User user = userRepo.findByEmail(request.getEmail()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy tài khoản"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepo.save(user);

        otpStorage.remove(request.getEmail());
    }

    private String generateOtp() {

        int number = secureRandom.nextInt(1_000_000);

        return String.format("%06d", number);
    }

    private void validateOtp(String email, String otp, OtpData otpData) {

        if (otpData == null) {
            throw new RuntimeException("OTP không tồn tại hoặc đã hết hạn");
        }

        if (LocalDateTime.now().isAfter(otpData.getExpiresAt())) {

            otpStorage.remove(email);

            throw new RuntimeException("OTP đã hết hạn");
        }

        if (!otpData.getOtp().equals(otp)) {
            throw new RuntimeException("OTP không chính xác");
        }
    }

    @Data
    private static class OtpData {

        private String otp;
        private LocalDateTime expiresAt;
        private boolean verified;

        public OtpData(String otp, LocalDateTime expiresAt, boolean verified) {
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.verified = verified;
        }
    }


}