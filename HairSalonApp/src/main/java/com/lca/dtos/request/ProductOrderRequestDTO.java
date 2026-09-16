package com.lca.dtos.request;

import com.lca.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ProductOrderRequestDTO {

    private Long customerId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Tên người nhận không được để trống")
    private String receiverName;

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    private String receiverPhone;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    private String note;

    private BigDecimal discountAmount = BigDecimal.ZERO;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<ProductOrderItemRequestDTO> items = new ArrayList<>();

    @Getter
    @Setter
    public static class ProductOrderItemRequestDTO {

        @NotNull(message = "Sản phẩm không được để trống")
        private Long productId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer quantity;
    }
}