package com.lca.controllers.api;

import com.lca.dtos.response.CustomerResponseDTO;
import com.lca.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/me")
    public ResponseEntity<CustomerResponseDTO> getMe(
            @RequestParam Long userId) {

        return ResponseEntity.ok(customerService.getById(userId));
    }
}