package com.lca.mapper;

import com.lca.dtos.response.CartResponseDTO;
import com.lca.entity.Cart;
import com.lca.entity.CartItem;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

public class CartMapper {

    private CartMapper() {
    }

    public static CartResponseDTO toResponse(Cart cart) {

        CartResponseDTO dto = new CartResponseDTO();

        dto.setId(cart.getId());

        if (cart.getCustomer() != null) {
            dto.setCustomerId(cart.getCustomer().getId());
        }

        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());

        if (cart.getItems() != null) {

            List<CartResponseDTO.Item> items =
                    cart.getItems()
                            .stream()
                            .map(CartMapper::toItemResponse)
                            .toList();

            dto.setItems(items);

            BigDecimal total = items.stream()
                    .map(CartResponseDTO.Item::getTotalPrice)
                    .filter(value -> value != null)
                    .reduce(
                            BigDecimal.ZERO,
                            BigDecimal::add
                    );

            dto.setTotalAmount(total);

        } else {

            dto.setItems(Collections.emptyList());
            dto.setTotalAmount(BigDecimal.ZERO);
        }

        return dto;
    }

    private static CartResponseDTO.Item toItemResponse(
            CartItem item) {

        CartResponseDTO.Item dto =
                new CartResponseDTO.Item();

        dto.setId(item.getId());

        if (item.getProduct() != null) {

            dto.setProductId(
                    item.getProduct().getId()
            );

            dto.setProductName(
                    item.getProduct().getName()
            );

            dto.setImageUrl(
                    item.getProduct().getImageUrl()
            );

            dto.setUnitPrice(
                    item.getProduct().getPrice()
            );
        }

        dto.setQuantity(item.getQuantity());

        if (dto.getUnitPrice() != null
                && dto.getQuantity() != null) {

            dto.setTotalPrice(
                    dto.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            dto.getQuantity()
                                    )
                            )
            );
        }

        return dto;
    }
}