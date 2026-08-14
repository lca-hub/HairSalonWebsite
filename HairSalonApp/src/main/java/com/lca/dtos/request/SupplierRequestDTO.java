package com.lca.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierRequestDTO {

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Size(max = 255)
    private String name;

    @Size(max = 20)
    private String phone;

    @Email(message = "Email không hợp lệ")
    @Size(max = 255)
    private String email;

    @Size(max = 255)
    private String address;
}