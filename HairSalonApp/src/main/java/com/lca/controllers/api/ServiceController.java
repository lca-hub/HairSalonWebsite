package com.lca.controllers.api;

import com.lca.dtos.response.ServiceResponseDTO;
import com.lca.service.ServiceService;
import com.lca.utils.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public ResponseEntity<Page<ServiceResponseDTO>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.create(page, size);
        return ResponseEntity.ok(serviceService.search(keyword, categoryId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getById(id));
    }
}