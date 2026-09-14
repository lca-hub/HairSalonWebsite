package com.lca.controllers.api;

import com.lca.dtos.request.ReviewRequestDTO;
import com.lca.dtos.response.ReviewResponseDTO;
import com.lca.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> create(
            Authentication authentication,
            @Valid @RequestBody ReviewRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(authentication.getName(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponseDTO> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequestDTO request) {
        return ResponseEntity.ok(reviewService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        reviewService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}