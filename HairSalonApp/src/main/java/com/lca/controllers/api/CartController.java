package com.lca.controllers.api;

import com.lca.dtos.request.CartItemRequestDTO;
import com.lca.dtos.response.CartResponseDTO;
import com.lca.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCart(authentication.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addItem(Authentication authentication, @Valid @RequestBody CartItemRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addItem(authentication.getName(), request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponseDTO> updateItem(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody CartItemRequestDTO request) {

        return ResponseEntity.ok(cartService.updateItem(authentication.getName(), productId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItem(Authentication authentication, @PathVariable Long productId) {
        cartService.removeItem(authentication.getName(), productId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());

        return ResponseEntity.noContent().build();
    }
}