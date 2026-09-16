package com.lca.service;

import com.lca.dtos.request.InvoiceRequestDTO;
import com.lca.dtos.response.InvoiceResponseDTO;
import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface InvoiceService {

    Page<InvoiceResponseDTO> getAll(Pageable pageable);

    Page<InvoiceResponseDTO> getByCustomer(Long customerId, Pageable pageable);

    InvoiceResponseDTO getById(Long id);

    Page<InvoiceResponseDTO> search(String keyword, Long customerId, PaymentStatus paymentStatus, PaymentMethod paymentMethod, LocalDateTime from, LocalDateTime to, Pageable pageable);

    InvoiceResponseDTO createAndPayAtStore(InvoiceRequestDTO request);

    Page<InvoiceResponseDTO> getMyInvoices(String email, Pageable pageable);

    InvoiceResponseDTO getMyInvoiceById(String email, Long id);

    InvoiceResponseDTO createProductSaleInvoice(Long orderId);
}