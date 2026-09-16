package com.lca.service;

import com.lca.dtos.request.ProductOrderRequestDTO;
import com.lca.dtos.response.ProductOrderResponseDTO;
import com.lca.enums.ProductOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductOrderService {

    Page<ProductOrderResponseDTO> getAll(Pageable pageable);

    ProductOrderResponseDTO getById(Long id);

    ProductOrderResponseDTO updateStatus(Long id, ProductOrderStatus status);

    ProductOrderResponseDTO create(String email, ProductOrderRequestDTO request);

    ProductOrderResponseDTO createAtStore(ProductOrderRequestDTO request);

    Page<ProductOrderResponseDTO> getMyOrders(String email, Pageable pageable);

    ProductOrderResponseDTO getMyOrderById(String email, Long orderId);

    void cancel(String email, Long orderId);

    void deductStock(Long orderId);
}