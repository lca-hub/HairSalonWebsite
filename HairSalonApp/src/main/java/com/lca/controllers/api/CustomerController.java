package com.lca.controllers.api;

import com.lca.dtos.request.CustomerRequestDTO;
import com.lca.dtos.response.CustomerResponseDTO;
import com.lca.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/me")
    public ResponseEntity<CustomerResponseDTO> getMe(
            Authentication authentication) {

        return ResponseEntity.ok(customerService.getByEmail(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<CustomerResponseDTO> updateMe(
            Authentication authentication,
            @Valid @RequestBody CustomerRequestDTO request) {

        return ResponseEntity.ok(customerService.updateMe(authentication.getName(), request));
    }
}
