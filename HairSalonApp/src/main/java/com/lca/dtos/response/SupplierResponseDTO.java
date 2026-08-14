package com.lca.dtos.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierResponseDTO {

    private Long id;

    private String name;

    private String phone;

    private String email;

    private String address;
}
