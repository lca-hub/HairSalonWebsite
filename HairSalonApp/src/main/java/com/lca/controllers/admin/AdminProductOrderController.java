package com.lca.controllers.admin;

import com.lca.dtos.response.ProductOrderResponseDTO;
import com.lca.enums.ProductOrderStatus;
import com.lca.service.ProductOrderService;
import com.lca.utils.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminProductOrderController {
    private final ProductOrderService productOrderService;

    @GetMapping
    public ResponseEntity<Page<ProductOrderResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(productOrderService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductOrderResponseDTO> getById(@PathVariable Long id) {

        return ResponseEntity.ok(productOrderService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductOrderResponseDTO> updateStatus(@PathVariable Long id, @RequestParam ProductOrderStatus status) {

        return ResponseEntity.ok(productOrderService.updateStatus(id, status));
    }

}
