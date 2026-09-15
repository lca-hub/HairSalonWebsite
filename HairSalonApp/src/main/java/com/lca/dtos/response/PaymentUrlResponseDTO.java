package com.lca.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentUrlResponseDTO {

    private Long appointmentId;

    private Long orderId;

    private Long invoiceId;

    private String transactionNo;

    private String paymentUrl;
}