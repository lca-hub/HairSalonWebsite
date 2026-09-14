package com.lca.service;

import com.lca.dtos.request.CartItemRequestDTO;
import com.lca.dtos.response.CartResponseDTO;

public interface CartService {

    CartResponseDTO getCart(String email);

    CartResponseDTO addItem(String email, CartItemRequestDTO request);

    CartResponseDTO updateItem(String email, Long productId, CartItemRequestDTO request);

    void removeItem(String email, Long productId);

    void clearCart(String email);
}
