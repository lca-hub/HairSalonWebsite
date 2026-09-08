package com.lca.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class PurchaseOrderRequestDTO {

    @NotNull(message = "Supplier ID không được để trống")
    private Long supplierId;

    private String note;

    @Valid
    @NotEmpty(message = "Phiếu nhập phải có ít nhất một sản phẩm")
    private List<Item> items;

    @Getter
    @Setter
    public static class Item {

        @NotNull(message = "Product ID không được để trống")
        private Long productId;

        @NotNull(message = "Số lượng không được để trống")
        @Positive(message = "Số lượng phải lớn hơn 0")
        private Integer quantity;

        @NotNull(message = "Giá nhập không được để trống")
        @DecimalMin(value = "0.0", inclusive = false, message = "Giá nhập phải lớn hơn 0")
        private BigDecimal importPrice;
    }
}