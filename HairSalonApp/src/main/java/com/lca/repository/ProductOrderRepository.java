package com.lca.repository;

import com.lca.entity.ProductOrder;
import com.lca.enums.ProductOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductOrderRepository extends JpaRepository<ProductOrder, Long> {
    Page<ProductOrder> findByCustomerId(Long customerId, Pageable pageable);

    Optional<ProductOrder> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    Page<ProductOrder> findByOrderStatus(ProductOrderStatus orderStatus, Pageable pageable);

}
