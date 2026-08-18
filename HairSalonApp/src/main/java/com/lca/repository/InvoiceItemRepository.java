package com.lca.repository;

import com.lca.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    List<InvoiceItem> findByInvoiceId(Long invoiceId);

    List<InvoiceItem> findByServiceId(Long serviceId);

    List<InvoiceItem> findByProductId(Long productId);
}