package com.lca.dtos.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductResponseDTO {

    private Long id;

    private Long supplierId;

    private String supplierName;

    private String productCode;

    private String name;

    private BigDecimal price;

    private Integer stockQuantity;

    private Integer minStockAlert;

    private String imageUrl;

    private Boolean isActive;
}
