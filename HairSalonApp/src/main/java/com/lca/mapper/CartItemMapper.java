package com.lca.mapper;

import com.lca.dtos.request.CartItemRequestDTO;
import com.lca.dtos.response.CartItemResponseDTO;
import com.lca.entity.CartItem;

import java.math.BigDecimal;

public class CartItemMapper {

    private CartItemMapper() {
    }

    public static CartItem toEntity(CartItemRequestDTO dto) {

        CartItem item = new CartItem();

        item.setQuantity(dto.getQuantity());

        return item;
    }

    public static void updateEntity(CartItem item, CartItemRequestDTO dto) {
        item.setQuantity(dto.getQuantity());
    }

    public static CartItemResponseDTO toResponse(CartItem item) {

        CartItemResponseDTO dto = new CartItemResponseDTO();

        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());

        if (item.getCart() != null) {
            dto.setCartId(item.getCart().getId());
        }

        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());

            dto.setProductName(item.getProduct().getName());

            dto.setImageUrl(item.getProduct().getImageUrl());

            dto.setUnitPrice(item.getProduct().getPrice());
        }

        if (dto.getUnitPrice() != null && dto.getQuantity() != null) {

            dto.setTotalPrice(dto.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity())));
        }

        return dto;
    }
}
