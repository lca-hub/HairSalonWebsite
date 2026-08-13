package com.lca.dtos.request;

import com.lca.enums.Gender;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CustomerRequestDTO {

    @NotNull
    private Long userId;

    private LocalDate dob;

    private Gender gender;
}
