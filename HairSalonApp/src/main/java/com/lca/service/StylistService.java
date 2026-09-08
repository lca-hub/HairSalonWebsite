package com.lca.service;

import com.lca.dtos.request.StylistRequestDTO;
import com.lca.dtos.response.ReviewResponseDTO;
import com.lca.dtos.response.ServiceResponseDTO;
import com.lca.dtos.response.StylistResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StylistService {

    Page<StylistResponseDTO> getAll(Pageable pageable);

    StylistResponseDTO getById(Long id);

    Page<ServiceResponseDTO> getServices(Long stylistId, Pageable pageable);

    Page<ReviewResponseDTO> getReviews(Long stylistId, Pageable pageable);

    StylistResponseDTO create(StylistRequestDTO request);

    Page<StylistResponseDTO> getAllForAdmin(Pageable pageable);

    StylistResponseDTO getByIdForAdmin(Long id);

    StylistResponseDTO update(Long id, StylistRequestDTO request);

    void delete(Long id);

    StylistResponseDTO updateStatus(Long id, Boolean isActive);

    Page<StylistResponseDTO> search(String keyword, String specialization, Integer minExperience, Integer maxExperience, Boolean isActive, Pageable pageable);
}