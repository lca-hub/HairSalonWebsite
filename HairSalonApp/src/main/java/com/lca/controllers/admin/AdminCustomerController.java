package com.lca.controllers.admin;

import com.lca.dtos.request.CustomerRequestDTO;
import com.lca.dtos.response.CustomerResponseDTO;
import com.lca.enums.Gender;
import com.lca.service.CustomerService;
import com.lca.utils.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<Page<CustomerResponseDTO>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.create(page, size);
        return ResponseEntity.ok(customerService.search(keyword, gender, isActive, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequestDTO request) {
        return ResponseEntity.ok(customerService.updateByAdmin(id, request));
    }
}