package com.lca.controllers.api;

import com.lca.dtos.response.InvoiceResponseDTO;
import com.lca.service.InvoiceService;
import com.lca.utils.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/my")
    public ResponseEntity<Page<InvoiceResponseDTO>> getMyInvoices(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(invoiceService.getMyInvoices(authentication.getName(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> getMyInvoiceById(Authentication authentication,
                                                               @PathVariable Long id) {

        return ResponseEntity.ok(invoiceService.getMyInvoiceById(authentication.getName(), id));
    }
}