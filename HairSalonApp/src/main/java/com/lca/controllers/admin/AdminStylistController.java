package com.lca.controllers.admin;

import com.lca.dtos.request.StylistRequestDTO;
import com.lca.dtos.response.StylistResponseDTO;
import com.lca.service.StylistService;
import com.lca.utils.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/stylists")
@RequiredArgsConstructor
public class AdminStylistController {

    private final StylistService stylistService;

    @PostMapping
    public ResponseEntity<StylistResponseDTO> create(@Valid @RequestBody StylistRequestDTO request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(stylistService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<StylistResponseDTO>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.create(page, size);
        return ResponseEntity.ok(stylistService.search(keyword, specialization, minExperience, maxExperience, isActive, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StylistResponseDTO> getById(@PathVariable Long id) {

        return ResponseEntity.ok(stylistService.getByIdForAdmin(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StylistResponseDTO> update(@PathVariable Long id,
            @Valid @RequestBody StylistRequestDTO request) {

        return ResponseEntity.ok(stylistService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        stylistService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StylistResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {

        return ResponseEntity.ok(stylistService.updateStatus(id, isActive));
    }
}