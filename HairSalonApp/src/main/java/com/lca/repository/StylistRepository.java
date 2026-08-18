package com.lca.repository;

import com.lca.entity.Stylist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StylistRepository extends JpaRepository<Stylist, Long> {

    Optional<Stylist> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}