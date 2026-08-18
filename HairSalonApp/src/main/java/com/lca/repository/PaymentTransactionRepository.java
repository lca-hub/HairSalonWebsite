package com.lca.repository;

import com.lca.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByTransactionNo(String transactionNo);

    List<PaymentTransaction> findByInvoiceId(Long invoiceId);

    boolean existsByTransactionNo(String transactionNo);
}