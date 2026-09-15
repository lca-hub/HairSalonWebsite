package com.lca.dtos.response;

import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class InvoiceResponseDTO {

    private Long id;

    private String invoiceCode;

    private Long appointmentId;

    private Long customerId;

    private String customerName;

    private BigDecimal subTotal;

    private BigDecimal discountAmount;

    private BigDecimal totalAmount;

    private BigDecimal refundAmount;

    private LocalDateTime refundTime;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private LocalDateTime createdAt;

    private List<InvoiceItemResponseDTO> items;

    private Long productOrderId;

    private String orderStatus;
}
