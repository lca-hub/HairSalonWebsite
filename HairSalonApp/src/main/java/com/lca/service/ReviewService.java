package com.lca.service;

import com.lca.dtos.request.ReviewRequestDTO;
import com.lca.dtos.response.ReviewResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponseDTO create(String email, ReviewRequestDTO request);

    Page<ReviewResponseDTO> getByStylist(Long stylistId, Pageable pageable);

    ReviewResponseDTO getById(Long id);

    ReviewResponseDTO update(String email, Long id, ReviewRequestDTO request);

    void delete(String email, Long id);

    void adminDelete(Long id);

    Page<ReviewResponseDTO> findAll(Pageable pageable);
}