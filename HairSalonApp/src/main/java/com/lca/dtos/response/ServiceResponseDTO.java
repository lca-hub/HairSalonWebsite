package com.lca.dtos.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceResponseDTO {

    private Long id;

    private Long categoryId;

    private String categoryName;

    private String serviceCode;

    private String name;

    private String description;

    private BigDecimal price;

    private Integer durationMinutes;

    private String imageUrl;

    private Boolean isActive;
}
