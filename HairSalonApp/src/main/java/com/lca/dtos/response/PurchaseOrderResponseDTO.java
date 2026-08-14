package com.lca.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PurchaseOrderResponseDTO {

    private Long id;

    private Long supplierId;

    private String supplierName;

    private LocalDateTime orderDate;

    private BigDecimal totalAmount;

    private String note;

    private List<Item> items;

    @Getter
    @Setter
    public static class Item {

        private Long id;

        private Long productId;

        private String productName;

        private Integer quantity;

        private BigDecimal importPrice;

        private BigDecimal totalPrice;
    }
}