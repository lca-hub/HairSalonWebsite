package com.lca.service;

import com.lca.dtos.request.UserCreateRequestDTO;
import com.lca.dtos.request.UserUpdateRequestDTO;
import com.lca.dtos.response.UserResponseDTO;
import com.lca.enums.Role;

import java.util.List;

public interface UserService {

    List<UserResponseDTO> getAll();

    UserResponseDTO getById(Long id);

    UserResponseDTO createByAdmin(UserCreateRequestDTO request);

    UserResponseDTO updateByAdmin(Long id, UserUpdateRequestDTO request);

    UserResponseDTO updateStatus(Long id, Boolean isActive);

    UserResponseDTO updateRole(Long id, Role role);

    void deleteByAdmin(Long id);

    void resetPassword(Long id);
}

