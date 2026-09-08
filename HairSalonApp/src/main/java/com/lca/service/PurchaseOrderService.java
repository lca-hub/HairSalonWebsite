package com.lca.service;

import com.lca.dtos.request.PurchaseOrderRequestDTO;
import com.lca.dtos.response.PurchaseOrderResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface PurchaseOrderService {

    PurchaseOrderResponseDTO create(PurchaseOrderRequestDTO request);

    Page<PurchaseOrderResponseDTO> getAll(Pageable pageable);

    PurchaseOrderResponseDTO getById(Long id);

    Page<PurchaseOrderResponseDTO> getBySupplier(Long supplierId, Pageable pageable);

    Page<PurchaseOrderResponseDTO> getByReceived(Boolean received, Pageable pageable);

    PurchaseOrderResponseDTO update(Long id, PurchaseOrderRequestDTO request);

    PurchaseOrderResponseDTO receive(Long id);

    Page<PurchaseOrderResponseDTO> search(Long supplierId, Boolean isReceived, LocalDateTime from, LocalDateTime to, Pageable pageable);
}