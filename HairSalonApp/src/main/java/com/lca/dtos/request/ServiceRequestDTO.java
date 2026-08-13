package com.lca.dtos.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceRequestDTO {

    @NotNull
    private Long categoryId;

    @NotBlank
    private String serviceCode;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private BigDecimal price;

    @NotNull
    @Positive
    private Integer durationMinutes;

    private String imageUrl;

    private Boolean isActive;
}
