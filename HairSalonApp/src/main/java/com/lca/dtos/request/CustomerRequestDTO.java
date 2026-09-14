package com.lca.dtos.request;

import com.lca.enums.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CustomerRequestDTO {

    private Long userId;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private String avatar;

    private LocalDate dob;

    private Gender gender;
}