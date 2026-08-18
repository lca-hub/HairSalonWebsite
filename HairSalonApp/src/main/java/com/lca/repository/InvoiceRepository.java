package com.lca.repository;

import com.lca.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceCode(String invoiceCode);

    Optional<Invoice> findByAppointmentId(Long appointmentId);

    List<Invoice> findByCustomerId(Long customerId);

    boolean existsByInvoiceCode(String invoiceCode);
}