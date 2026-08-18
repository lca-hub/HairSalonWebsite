package com.lca.repository;

import com.lca.entity.ProductOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductOrderItemRepository extends JpaRepository<ProductOrderItem, Long> {

    List<ProductOrderItem> findByOrderId(Long orderId);

    List<ProductOrderItem> findByProductId(Long productId);
}