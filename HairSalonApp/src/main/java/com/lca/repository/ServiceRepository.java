package com.lca.repository;

import com.lca.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    Optional<Service> findByServiceCode(String serviceCode);

    boolean existsByServiceCode(String serviceCode);

    List<Service> findByCategoryId(Long categoryId);

    List<Service> findByIsActiveTrue();
}