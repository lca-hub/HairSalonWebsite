package com.lca.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lca.dtos.request.UserCreateRequestDTO;
import com.lca.dtos.request.UserUpdateRequestDTO;
import com.lca.dtos.response.UserResponseDTO;
import com.lca.entity.Customer;
import com.lca.entity.Stylist;
import com.lca.entity.User;
import com.lca.enums.Role;
import com.lca.mapper.UserMapper;
import com.lca.repository.CustomerRepository;
import com.lca.repository.StylistRepository;
import com.lca.repository.UserRepository;
import com.lca.service.UserService;
import com.lca.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final StylistRepository stylistRepository;
    private final PasswordEncoder passwordEncoder;
    private final Cloudinary cloudinary;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> search(String keyword, Role role, Boolean isActive, Pageable pageable) {
        Specification<User> specification = Specification.where(UserSpecification.keyword(keyword))
                .and(UserSpecification.role(role))
                .and(UserSpecification.isActive(isActive));
        return userRepository.findAll(specification, pageable).map(UserMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getById(Long id) {

        User user = userRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user với ID: " + id));

        return UserMapper.toResponse(user);
    }

    @Override
    public UserResponseDTO createByAdmin(UserCreateRequestDTO request) {
        return createByAdmin(request, null);
    }

    @Override
    public UserResponseDTO createByAdmin(
            UserCreateRequestDTO request,
            MultipartFile avatar) {

        if (request.getRole() == Role.ADMIN) {
            throw new RuntimeException("Không được tạo tài khoản ADMIN");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());

        user.setLastName(request.getLastName());

        user.setEmail(request.getEmail());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setPhoneNumber(request.getPhoneNumber());

        user.setAvatar(request.getAvatar());

        if (avatar != null && !avatar.isEmpty()) {
            user.setAvatar(uploadAvatar(avatar));
        }

        user.setRole(request.getRole());

        user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.CUSTOMER) {

            Customer customer = new Customer();

            customer.setUser(savedUser);
            customer.setTotalVisits(0);
            customer.setTotalSpent(BigDecimal.ZERO);

            customerRepository.save(customer);
        }

        if (savedUser.getRole() == Role.STYLIST) {

            Stylist stylist = new Stylist();

            stylist.setUser(savedUser);
            stylist.setExperienceYears(0);
            stylist.setAverageRating(BigDecimal.ZERO);

            stylistRepository.save(stylist);
        }

        return UserMapper.toResponse(savedUser);
    }

    @Override
    public UserResponseDTO updateByAdmin(Long id, UserUpdateRequestDTO request) {
        return updateByAdmin(id, request, null);
    }

    @Override
    public UserResponseDTO updateByAdmin(
            Long id,
            UserUpdateRequestDTO request,
            MultipartFile avatar) {

        User user = userRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user với ID: " + id));

        if (request.getRole() == Role.ADMIN) {
            throw new RuntimeException("Không được đổi role thành ADMIN");
        }

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException("Email đã tồn tại");
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber()) && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {

            throw new RuntimeException("Số điện thoại đã tồn tại");
        }

        Role oldRole = user.getRole();

        Role newRole = request.getRole();

        user.setFirstName(request.getFirstName());

        user.setLastName(request.getLastName());

        user.setEmail(request.getEmail());

        user.setPhoneNumber(request.getPhoneNumber());

        if (avatar != null && !avatar.isEmpty()) {
            user.setAvatar(uploadAvatar(avatar));
        } else if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        if (request.getIsActive() != null) {

            user.setIsActive(request.getIsActive());
        }

        user.setRole(newRole);

        if (oldRole != Role.CUSTOMER && newRole == Role.CUSTOMER && !customerRepository.existsByUserId(user.getId())) {

            Customer customer = new Customer();

            customer.setUser(user);
            customer.setTotalVisits(0);
            customer.setTotalSpent(BigDecimal.ZERO);

            customerRepository.save(customer);
        }

        if (oldRole != Role.STYLIST && newRole == Role.STYLIST && !stylistRepository.existsByUserId(user.getId())) {

            Stylist stylist = new Stylist();

            stylist.setUser(user);
            stylist.setExperienceYears(0);
            stylist.setAverageRating(BigDecimal.ZERO);

            stylistRepository.save(stylist);
        }

        User updated = userRepository.save(user);

        return UserMapper.toResponse(updated);
    }

    private String uploadAvatar(MultipartFile avatar) {
        String contentType = avatar.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Avatar phải là file hình ảnh");
        }

        if (avatar.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Avatar không được vượt quá 5MB");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(
                    avatar.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "hair-salon/avatars",
                            "resource_type", "image"
                    )
            );

            String secureUrl = (String) uploadResult.get("secure_url");
            if (secureUrl == null || secureUrl.isBlank()) {
                throw new RuntimeException("Cloudinary không trả về URL avatar");
            }

            return secureUrl;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Upload avatar lên Cloudinary thất bại", e);
        }
    }

    @Override
    public UserResponseDTO updateStatus(Long id, Boolean isActive) {

        User user = userRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user"));

        if (user.getRole() == Role.ADMIN) {

            throw new RuntimeException("Không thể khóa tài khoản ADMIN");
        }

        user.setIsActive(isActive);

        return UserMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponseDTO updateRole(Long id, Role role) {

        if (role == Role.ADMIN) {

            throw new RuntimeException("Không thể cấp role ADMIN");
        }

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        Role oldRole = user.getRole();

        user.setRole(role);

        if (role == Role.CUSTOMER && oldRole != Role.CUSTOMER && !customerRepository.existsByUserId(id)) {

            Customer customer = new Customer();

            customer.setUser(user);
            customer.setTotalVisits(0);
            customer.setTotalSpent(BigDecimal.ZERO);

            customerRepository.save(customer);
        }

        if (role == Role.STYLIST && oldRole != Role.STYLIST && !stylistRepository.existsByUserId(id)) {

            Stylist stylist = new Stylist();

            stylist.setUser(user);
            stylist.setExperienceYears(0);
            stylist.setAverageRating(BigDecimal.ZERO);

            stylistRepository.save(stylist);
        }

        return UserMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void deleteByAdmin(Long id) {

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        if (user.getRole() == Role.ADMIN) {

            throw new RuntimeException("Không thể xóa tài khoản ADMIN");
        }

        userRepository.delete(user);
    }

    @Override
    public void resetPassword(Long id) {

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        if (user.getRole() == Role.ADMIN) {

            throw new RuntimeException("Không thể reset password ADMIN");
        }

        String temporaryPassword = "Salon@123";

        user.setPassword(passwordEncoder.encode(temporaryPassword));

        userRepository.save(user);
    }
}
