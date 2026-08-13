package com.lca.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequestDTO {

    @NotNull
    private Long supplierId;

    @NotBlank
    private String productCode;

    @NotBlank
    private String name;

    @NotNull
    @PositiveOrZero
    private BigDecimal price;

    @PositiveOrZero
    private Integer stockQuantity;

    @PositiveOrZero
    private Integer minStockAlert;

    private String imageUrl;

    private Boolean isActive;
}
