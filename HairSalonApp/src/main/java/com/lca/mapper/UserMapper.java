package com.lca.mapper;

import com.lca.dtos.request.UserCreateRequestDTO;
import com.lca.dtos.request.UserUpdateRequestDTO;
import com.lca.dtos.response.UserResponseDTO;
import com.lca.entity.User;

public class UserMapper {

    private UserMapper() {
    }

    public static User toEntity(UserCreateRequestDTO dto) {

        User user = new User();

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAvatar(dto.getAvatar());
        user.setRole(dto.getRole());
        user.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return user;
    }

    public static void updateEntity(User user, UserUpdateRequestDTO dto) {

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAvatar(dto.getAvatar());
        user.setRole(dto.getRole());

        if (dto.getIsActive() != null) {
            user.setIsActive(dto.getIsActive());
        }
    }

    public static UserResponseDTO toResponse(User user) {

        UserResponseDTO dto = new UserResponseDTO();

        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }
}