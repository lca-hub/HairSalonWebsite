package com.lca.repository;

import com.lca.entity.ProductOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductOrderRepository extends JpaRepository<ProductOrder, Long> {

    Optional<ProductOrder> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    List<ProductOrder> findByCustomerId(Long customerId);

    List<ProductOrder> findByCustomerIdAndOrderStatus(Long customerId, String orderStatus);
}