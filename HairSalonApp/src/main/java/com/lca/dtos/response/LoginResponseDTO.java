package com.lca.dtos.response;

import com.lca.enums.Role;
import lombok.Data;

@Data
public class LoginResponseDTO {

    private Long userId;
    private String fullname;
    private String email;
    private Role role;
    private String accessToken;
    private String refreshToken;
}