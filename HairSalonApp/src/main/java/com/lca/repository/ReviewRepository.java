package com.lca.repository;

import com.lca.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByAppointmentId(Long appointmentId);

    boolean existsByAppointmentId(Long appointmentId);

    Page<Review> findByAppointmentStylistId(Long stylistId, Pageable pageable);

    Page<Review> findByAppointmentCustomerId(Long customerId, Pageable pageable);
}