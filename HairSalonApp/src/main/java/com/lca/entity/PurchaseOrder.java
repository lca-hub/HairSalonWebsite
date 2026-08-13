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
@Table(name = "purchase_order")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @ColumnDefault("0.00")
    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Size(max = 500)
    @Column(name = "note", length = 500)
    private String note;


}