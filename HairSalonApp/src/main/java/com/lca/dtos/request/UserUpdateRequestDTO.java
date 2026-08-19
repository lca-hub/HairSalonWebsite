package com.lca.dtos.request;

import com.lca.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserUpdateRequestDTO {

    private String firstName;

    private String lastName;

    @Email(message = "Email không hợp lệ")
    private String email;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    private String avatar;

    private Role role;

    private Boolean isActive;
}