package com.lca.service;

import com.lca.dtos.request.UserCreateRequestDTO;
import com.lca.dtos.request.UserUpdateRequestDTO;
import com.lca.dtos.response.UserResponseDTO;
import com.lca.entity.User;
import com.lca.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    Page<UserResponseDTO> findAll(Pageable pageable);

    UserResponseDTO getById(Long id);

    UserResponseDTO createByAdmin(UserCreateRequestDTO request);

    UserResponseDTO createByAdmin(UserCreateRequestDTO request, MultipartFile avatar);

    UserResponseDTO updateByAdmin(Long id, UserUpdateRequestDTO request);

    UserResponseDTO updateByAdmin(Long id, UserUpdateRequestDTO request, MultipartFile avatar);

    UserResponseDTO updateStatus(Long id, Boolean isActive);

    UserResponseDTO updateRole(Long id, Role role);

    void deleteByAdmin(Long id);

    void resetPassword(Long id);

    Page<UserResponseDTO> search(String keyword, Role role, Boolean isActive, Pageable pageable);
}

