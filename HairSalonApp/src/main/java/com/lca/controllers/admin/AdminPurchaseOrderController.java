package com.lca.controllers.admin;

import com.lca.dtos.request.PurchaseOrderRequestDTO;
import com.lca.dtos.response.PurchaseOrderResponseDTO;
import com.lca.service.PurchaseOrderService;
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
@RequestMapping("/api/admin/purchase-orders")
@RequiredArgsConstructor
public class AdminPurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponseDTO> create(@Valid @RequestBody PurchaseOrderRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseOrderService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderRequestDTO request) {
        return ResponseEntity.ok(purchaseOrderService.update(id, request));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrderResponseDTO> receive(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.receive(id));
    }

    @GetMapping
    public ResponseEntity<Page<PurchaseOrderResponseDTO>> search(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Boolean isReceived,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.create(page, size);
        return ResponseEntity.ok(purchaseOrderService.search(supplierId, isReceived, from, to, pageable));
    }
}