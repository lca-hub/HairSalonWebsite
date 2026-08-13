package com.lca.dtos.response;

import com.lca.enums.Gender;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CustomerResponseDTO {

    private Long id;

    private Long userId;

    private String fullname;

    private String email;

    private String phoneNumber;

    private String avatar;

    private LocalDate dob;

    private Gender gender;

    private Integer totalVisits;

    private BigDecimal totalSpent;
}
