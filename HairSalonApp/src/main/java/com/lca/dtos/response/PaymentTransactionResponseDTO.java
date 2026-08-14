package com.lca.dtos.response;

import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentTransactionResponseDTO {

    private Long id;

    private Long invoiceId;

    private String transactionNo;

    private BigDecimal amount;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private LocalDateTime transactionTime;
}
