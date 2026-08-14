package com.lca.dtos.response;

import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import com.lca.enums.ProductOrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProductOrderResponseDTO {

    private Long id;

    private String orderCode;

    private Long customerId;

    private String customerName;

    private BigDecimal subTotal;

    private BigDecimal discountAmount;

    private BigDecimal shippingFee;

    private BigDecimal totalAmount;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private ProductOrderStatus orderStatus;

    private String receiverName;

    private String receiverPhone;

    private String shippingAddress;

    private String note;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<Item> items;

    @Getter
    @Setter
    public static class Item {

        private Long id;

        private Long productId;

        private String productName;

        private String imageUrl;

        private Integer quantity;

        private BigDecimal unitPrice;

        private BigDecimal totalPrice;
    }
}