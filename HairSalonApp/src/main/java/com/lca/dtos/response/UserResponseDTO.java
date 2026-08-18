package com.lca.dtos.response;

import com.lca.enums.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDTO {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String avatar;

    private Role role;

    private Boolean isActive;

    private LocalDateTime createdAt;
}
