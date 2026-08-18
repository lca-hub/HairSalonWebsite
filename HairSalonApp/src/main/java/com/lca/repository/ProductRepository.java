package com.lca.repository;

import com.lca.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByProductCode(String productCode);

    boolean existsByProductCode(String productCode);

    List<Product> findBySupplierId(Long supplierId);

    List<Product> findByIsActiveTrue();

    List<Product> findByStockQuantityLessThanEqual(Integer quantity);
}