package com.lca.service;

import com.lca.dtos.request.ReviewRequestDTO;
import com.lca.dtos.response.ReviewResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponseDTO create(ReviewRequestDTO request);

    Page<ReviewResponseDTO> getByStylist(Long stylistId, Pageable pageable);

    ReviewResponseDTO getById(Long id);

    ReviewResponseDTO update(Long id, ReviewRequestDTO request);

    void delete(Long id);

    Page<ReviewResponseDTO> findAll(Pageable pageable);
}