package com.lca.repository;

import com.lca.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {
    Optional<Invoice> findByInvoiceCode(String invoiceCode);

    Optional<Invoice> findByAppointmentId(Long appointmentId);

    Page<Invoice> findByCustomerId(Long customerId, Pageable pageable);

    boolean existsByInvoiceCode(String invoiceCode);
}