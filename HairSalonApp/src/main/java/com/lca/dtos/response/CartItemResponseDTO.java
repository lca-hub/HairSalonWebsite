package com.lca.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CartItemResponseDTO {

    private Long id;

    private Long cartId;

    private Long productId;

    private String productName;

    private String imageUrl;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal totalPrice;
}