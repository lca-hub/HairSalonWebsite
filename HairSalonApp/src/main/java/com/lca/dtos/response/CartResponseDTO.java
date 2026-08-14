package com.lca.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CartResponseDTO {

    private Long id;

    private Long customerId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<Item> items;

    private BigDecimal totalAmount;

    @Getter
    @Setter
    public static class Item {

        private Long id;

        private Long productId;

        private String productName;

        private String imageUrl;

        private BigDecimal unitPrice;

        private Integer quantity;

        private BigDecimal totalPrice;
    }
}