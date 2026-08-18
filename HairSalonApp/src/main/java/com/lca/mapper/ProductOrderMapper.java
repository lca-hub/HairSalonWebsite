package com.lca.mapper;

import com.lca.dtos.request.ProductOrderRequestDTO;
import com.lca.dtos.response.ProductOrderResponseDTO;
import com.lca.entity.ProductOrder;
import com.lca.entity.ProductOrderItem;

import java.util.Collections;
import java.util.List;

public class ProductOrderMapper {

    private ProductOrderMapper() {
    }


    public static ProductOrder toEntity(ProductOrderRequestDTO dto) {

        ProductOrder order = new ProductOrder();

        order.setPaymentMethod(dto.getPaymentMethod());

        order.setReceiverName(dto.getReceiverName());

        order.setReceiverPhone(dto.getReceiverPhone());

        order.setShippingAddress(dto.getShippingAddress());

        order.setNote(dto.getNote());

        return order;
    }

    public static void updateEntity(ProductOrder order, ProductOrderRequestDTO dto) {

        order.setReceiverName(dto.getReceiverName());

        order.setReceiverPhone(dto.getReceiverPhone());

        order.setShippingAddress(dto.getShippingAddress());

        order.setNote(dto.getNote());

        order.setPaymentMethod(dto.getPaymentMethod());
    }

    public static ProductOrderResponseDTO toResponse(ProductOrder order) {

        ProductOrderResponseDTO dto = new ProductOrderResponseDTO();

        dto.setId(order.getId());

        dto.setOrderCode(order.getOrderCode());

        if (order.getCustomer() != null) {

            dto.setCustomerId(order.getCustomer().getId());

            if (order.getCustomer().getUser() != null) {
                var user = order.getCustomer().getUser();

                dto.setCustomerName((user.getFirstName() + " " + user.getLastName()).trim());

            }
        }

        dto.setSubTotal(order.getSubTotal());

        dto.setDiscountAmount(order.getDiscountAmount());

        dto.setShippingFee(order.getShippingFee());

        dto.setTotalAmount(order.getTotalAmount());

        dto.setPaymentMethod(order.getPaymentMethod());

        dto.setPaymentStatus(order.getPaymentStatus());

        dto.setOrderStatus(order.getOrderStatus());

        dto.setReceiverName(order.getReceiverName());

        dto.setReceiverPhone(order.getReceiverPhone());

        dto.setShippingAddress(order.getShippingAddress());

        dto.setNote(order.getNote());

        dto.setCreatedAt(order.getCreatedAt());

        dto.setUpdatedAt(order.getUpdatedAt());

        if (order.getItems() != null) {

            List<ProductOrderResponseDTO.Item> items = order.getItems().stream().map(ProductOrderMapper::toItemResponse).toList();

            dto.setItems(items);

        } else {
            dto.setItems(Collections.emptyList());
        }

        return dto;
    }

    private static ProductOrderResponseDTO.Item toItemResponse(ProductOrderItem item) {

        ProductOrderResponseDTO.Item dto = new ProductOrderResponseDTO.Item();

        dto.setId(item.getId());

        if (item.getProduct() != null) {

            dto.setProductId(item.getProduct().getId());

            dto.setProductName(item.getProduct().getName());

            dto.setImageUrl(item.getProduct().getImageUrl());
        }

        dto.setQuantity(item.getQuantity());

        dto.setUnitPrice(item.getUnitPrice());

        dto.setTotalPrice(item.getTotalPrice());

        return dto;
    }
}
