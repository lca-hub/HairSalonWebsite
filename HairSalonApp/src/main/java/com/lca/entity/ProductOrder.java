package com.lca.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "product_order")
public class ProductOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 50)
    @NotNull
    @Column(name = "order_code", nullable = false, length = 50)
    private String orderCode;

    @NotNull
    @ColumnDefault("0.00")
    @Column(name = "sub_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal subTotal;

    @NotNull
    @ColumnDefault("0.00")
    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @NotNull
    @ColumnDefault("0.00")
    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @NotNull
    @ColumnDefault("0.00")
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Size(max = 30)
    @NotNull
    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod;

    @Size(max = 30)
    @NotNull
    @ColumnDefault("'PENDING'")
    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus;

    @Size(max = 30)
    @NotNull
    @ColumnDefault("'PENDING'")
    @Column(name = "order_status", nullable = false, length = 30)
    private String orderStatus;

    @Size(max = 255)
    @NotNull
    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Size(max = 20)
    @NotNull
    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @Size(max = 500)
    @NotNull
    @Column(name = "shipping_address", nullable = false, length = 500)
    private String shippingAddress;

    @Size(max = 500)
    @Column(name = "note", length = 500)
    private String note;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


}