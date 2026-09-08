package com.lca.service;

import com.lca.dtos.request.CartItemRequestDTO;
import com.lca.dtos.response.CartResponseDTO;

public interface CartService {

    CartResponseDTO getCart(Long customerId);

    CartResponseDTO addItem(Long customerId, CartItemRequestDTO request);

    CartResponseDTO updateItem(Long customerId, Long productId, CartItemRequestDTO request);

    void removeItem(Long customerId, Long productId);

    void clearCart(Long customerId);
}