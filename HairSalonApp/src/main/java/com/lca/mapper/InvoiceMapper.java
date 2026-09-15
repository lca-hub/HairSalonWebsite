package com.lca.mapper;

import com.lca.dtos.response.InvoiceItemResponseDTO;
import com.lca.dtos.response.InvoiceResponseDTO;
import com.lca.entity.Invoice;
import com.lca.entity.InvoiceItem;

import java.util.Collections;

public class InvoiceMapper {

    private InvoiceMapper() {
    }

    public static InvoiceResponseDTO toResponse(Invoice invoice) {

        InvoiceResponseDTO dto = new InvoiceResponseDTO();

        dto.setId(invoice.getId());
        dto.setInvoiceCode(invoice.getInvoiceCode());

        if (invoice.getAppointment() != null) {
            dto.setAppointmentId(invoice.getAppointment().getId());
        }

        if (invoice.getCustomer() != null) {
            dto.setCustomerId(invoice.getCustomer().getId());

            if (invoice.getCustomer().getUser() != null) {
                var user = invoice.getCustomer().getUser();

                dto.setCustomerName((user.getFirstName() + " " + user.getLastName()).trim());

            }
        }

        dto.setSubTotal(invoice.getSubTotal());
        dto.setDiscountAmount(invoice.getDiscountAmount());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setRefundAmount(invoice.getRefundAmount());
        dto.setRefundTime(invoice.getRefundTime());

        dto.setPaymentMethod(invoice.getPaymentMethod());

        dto.setPaymentStatus(invoice.getPaymentStatus());

        dto.setCreatedAt(invoice.getCreatedAt());

        dto.setProductOrderId(invoice.getProductOrder() != null ? invoice.getProductOrder().getId() : null);

        dto.setOrderStatus(invoice.getProductOrder() != null && invoice.getProductOrder().getOrderStatus() != null ? invoice.getProductOrder().getOrderStatus().name() : null);

        if (invoice.getItems() != null) {
            dto.setItems(invoice.getItems().stream().map(InvoiceMapper::itemToResponse).toList());
        } else {
            dto.setItems(Collections.emptyList());
        }

        return dto;
    }

    private static InvoiceItemResponseDTO itemToResponse(InvoiceItem item) {

        InvoiceItemResponseDTO dto = new InvoiceItemResponseDTO();

        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());

        if (item.getService() != null) {
            dto.setServiceId(item.getService().getId());

            dto.setServiceName(item.getService().getName());
        }

        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());

            dto.setProductName(item.getProduct().getName());
        }

        return dto;
    }
}