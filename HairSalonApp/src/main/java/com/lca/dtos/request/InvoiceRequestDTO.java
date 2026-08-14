package com.lca.dtos.request;

import com.lca.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class InvoiceRequestDTO {

    private Long appointmentId;

    @NotNull(message = "Customer ID không được để trống")
    private Long customerId;

    private BigDecimal discountAmount = BigDecimal.ZERO;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    @Valid
    @NotEmpty(message = "Hóa đơn phải có ít nhất một item")
    private List<InvoiceItemRequestDTO> items;
}