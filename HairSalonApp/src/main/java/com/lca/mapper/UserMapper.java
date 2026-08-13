package com.lca.mapper;

import com.lca.dtos.request.UserRequestDTO;
import com.lca.dtos.response.UserResponseDTO;
import com.lca.entity.User;

public class UserMapper {

    public static User toEntity(UserRequestDTO dto) {

        User user = new User();

        user.setFullname(dto.getFullname());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAvatar(dto.getAvatar());
        user.setRole(dto.getRole());
        user.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return user;
    }

    public static UserResponseDTO toResponse(User user) {

        UserResponseDTO dto = new UserResponseDTO();

        dto.setId(user.getId());
        dto.setFullname(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }
}