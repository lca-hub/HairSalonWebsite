package com.lca.mapper;

import com.lca.dtos.response.PaymentTransactionResponseDTO;
import com.lca.entity.PaymentTransaction;

public class PaymentTransactionMapper {

    private PaymentTransactionMapper() {
    }

    public static PaymentTransactionResponseDTO toResponse(PaymentTransaction transaction) {

        PaymentTransactionResponseDTO dto = new PaymentTransactionResponseDTO();

        dto.setId(transaction.getId());

        if (transaction.getInvoice() != null) {
            dto.setInvoiceId(transaction.getInvoice().getId());
        }

        dto.setTransactionNo(transaction.getTransactionNo());

        dto.setAmount(transaction.getAmount());

        dto.setPaymentMethod(transaction.getPaymentMethod());

        dto.setPaymentStatus(transaction.getPaymentStatus());

        dto.setTransactionTime(transaction.getTransactionTime());

        return dto;
    }
}