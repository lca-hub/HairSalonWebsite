package com.lca.repository;

import com.lca.entity.Stylist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;


public interface StylistRepository extends JpaRepository<Stylist, Long>, JpaSpecificationExecutor<Stylist> {

    Optional<Stylist> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    Page<Stylist> findByUserIsActiveTrue(Pageable pageable);
}