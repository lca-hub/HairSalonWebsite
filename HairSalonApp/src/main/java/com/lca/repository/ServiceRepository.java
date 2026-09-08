package com.lca.repository;

import com.lca.entity.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long>, JpaSpecificationExecutor<Service> {

    Optional<Service> findByServiceCode(String serviceCode);

    boolean existsByServiceCode(String serviceCode);

    Page<Service> findByIsActiveTrue(Pageable pageable);

    Page<Service> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
}