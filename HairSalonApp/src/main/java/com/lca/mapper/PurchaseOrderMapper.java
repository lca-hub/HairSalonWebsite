package com.lca.mapper;

import com.lca.dtos.request.PurchaseOrderRequestDTO;
import com.lca.dtos.response.PurchaseOrderResponseDTO;
import com.lca.entity.PurchaseOrder;
import com.lca.entity.PurchaseOrderItem;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

public class PurchaseOrderMapper {

    private PurchaseOrderMapper() {}

    public static PurchaseOrder toEntity(PurchaseOrderRequestDTO dto) {
        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setNote(dto.getNote());
        return purchaseOrder;
    }

    public static void updateEntity(PurchaseOrder purchaseOrder, PurchaseOrderRequestDTO dto) {
        purchaseOrder.setNote(dto.getNote());
    }

    public static PurchaseOrderResponseDTO toResponse(PurchaseOrder purchaseOrder) {
        PurchaseOrderResponseDTO dto = new PurchaseOrderResponseDTO();
        dto.setId(purchaseOrder.getId());

        if (purchaseOrder.getSupplier() != null) {
            dto.setSupplierId(purchaseOrder.getSupplier().getId());
            dto.setSupplierName(purchaseOrder.getSupplier().getName());
        }

        dto.setOrderDate(purchaseOrder.getOrderDate());
        dto.setTotalAmount(purchaseOrder.getTotalAmount());
        dto.setNote(purchaseOrder.getNote());
        dto.setIsReceived(purchaseOrder.getIsReceived());

        if (purchaseOrder.getItems() != null) {
            List<PurchaseOrderResponseDTO.Item> items = purchaseOrder.getItems().stream().map(PurchaseOrderMapper::toItemResponse).toList();
            dto.setItems(items);
        } else {
            dto.setItems(Collections.emptyList());
        }

        return dto;
    }

    private static PurchaseOrderResponseDTO.Item toItemResponse(PurchaseOrderItem item) {
        PurchaseOrderResponseDTO.Item dto = new PurchaseOrderResponseDTO.Item();
        dto.setId(item.getId());

        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
        }

        dto.setQuantity(item.getQuantity());
        dto.setImportPrice(item.getImportPrice());

        BigDecimal totalPrice = item.getImportPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        dto.setTotalPrice(totalPrice);

        return dto;
    }
}