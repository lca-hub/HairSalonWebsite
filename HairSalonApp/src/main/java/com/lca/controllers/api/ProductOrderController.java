package com.lca.controllers.api;

import com.lca.dtos.request.ProductOrderRequestDTO;
import com.lca.dtos.response.ProductOrderResponseDTO;
import com.lca.enums.ProductOrderStatus;
import com.lca.service.ProductOrderService;
import com.lca.utils.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class ProductOrderController {

    private final ProductOrderService productOrderService;

    @PostMapping
    public ResponseEntity<ProductOrderResponseDTO> create(
            Authentication authentication,
            @Valid @RequestBody ProductOrderRequestDTO request) {

        return ResponseEntity.ok(productOrderService.create(authentication.getName(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ProductOrderResponseDTO>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(productOrderService.getMyOrders(authentication.getName(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductOrderResponseDTO> getMyOrderById(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(productOrderService.getMyOrderById(authentication.getName(), id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(Authentication authentication, @PathVariable Long id) {
        productOrderService.cancel(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductOrderResponseDTO> updateStatus(@PathVariable Long id, @RequestParam ProductOrderStatus status) {
        return ResponseEntity.ok(productOrderService.updateStatus(id, status));
    }
}
