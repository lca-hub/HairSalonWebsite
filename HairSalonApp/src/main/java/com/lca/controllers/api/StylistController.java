package com.lca.controllers.api;

import com.lca.dtos.response.ReviewResponseDTO;
import com.lca.dtos.response.ServiceResponseDTO;
import com.lca.dtos.response.StylistResponseDTO;
import com.lca.service.StylistService;
import com.lca.utils.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stylists")
@RequiredArgsConstructor
public class StylistController {

    private final StylistService stylistService;

    @GetMapping
    public ResponseEntity<Page<StylistResponseDTO>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(defaultValue = "true") Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.create(page, size);
        return ResponseEntity.ok(stylistService.search(keyword, specialization, minExperience, maxExperience, isActive, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StylistResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(stylistService.getById(id));
    }

    @GetMapping("/{stylistId}/services")
    public ResponseEntity<Page<ServiceResponseDTO>> getServices(
            @PathVariable Long stylistId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(stylistService.getServices(stylistId, pageable));
    }

    @GetMapping("/{stylistId}/reviews")
    public ResponseEntity<Page<ReviewResponseDTO>> getReviews(
            @PathVariable Long stylistId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(stylistService.getReviews(stylistId, pageable));
    }
}