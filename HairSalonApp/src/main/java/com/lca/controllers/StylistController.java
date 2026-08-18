package com.lca.controllers;

import com.lca.dtos.response.StylistResponseDTO;
import com.lca.service.StylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stylists")
@RequiredArgsConstructor
public class StylistController {

    private final StylistService stylistService;

    @GetMapping
    public ResponseEntity<List<StylistResponseDTO>> getAll() {
        return ResponseEntity.ok(stylistService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StylistResponseDTO> getById(@PathVariable Long id){
        return ResponseEntity.ok(stylistService.getById(id));
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<?> getServices(@PathVariable Long id) {
        return ResponseEntity.ok(stylistService.getServices(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<?> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(stylistService.getReviews(id));
    }
}