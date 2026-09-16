package com.lca.controllers.admin;

import com.lca.dtos.request.InvoiceRequestDTO;
import com.lca.dtos.request.ProductOrderRequestDTO;
import com.lca.dtos.response.InvoiceResponseDTO;
import com.lca.dtos.response.ProductOrderResponseDTO;
import com.lca.enums.PaymentMethod;
import com.lca.enums.PaymentStatus;
import com.lca.enums.ProductOrderStatus;
import com.lca.service.InvoiceService;
import com.lca.service.ProductOrderService;
import com.lca.utils.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/invoices")
@RequiredArgsConstructor
public class AdminInvoiceController {


    private final InvoiceService invoiceService;
    private final ProductOrderService productOrderService;

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceResponseDTO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(invoiceService.search(keyword, customerId, paymentStatus, paymentMethod, from, to, pageable));
    }

    @PostMapping("/pay-at-store")
    public ResponseEntity<InvoiceResponseDTO> payAtStore(@Valid @RequestBody InvoiceRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createAndPayAtStore(request));
    }

    @PutMapping("/order/{orderId}/status")
    public ResponseEntity<ProductOrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam ProductOrderStatus status) {

        return ResponseEntity.ok(productOrderService.updateStatus(orderId, status));
    }

    @PostMapping("/product-sale")
    public ResponseEntity<InvoiceResponseDTO> createProductSale(@Valid @RequestBody ProductOrderRequestDTO request) {
        ProductOrderResponseDTO order = productOrderService.createAtStore(request);
        InvoiceResponseDTO invoice = invoiceService.createProductSaleInvoice(order.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
    }
}