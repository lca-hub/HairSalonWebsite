package com.lca.service;

import com.lca.dtos.request.StylistRequestDTO;
import com.lca.dtos.response.ReviewResponseDTO;
import com.lca.dtos.response.ServiceResponseDTO;
import com.lca.dtos.response.StylistResponseDTO;

import java.util.List;

public interface StylistService {

    List<StylistResponseDTO> getAll();

    StylistResponseDTO getById(Long id);

    List<ServiceResponseDTO> getServices(Long stylistId);

    List<ReviewResponseDTO> getReviews(Long stylistId);

    StylistResponseDTO create(StylistRequestDTO request);

    List<StylistResponseDTO> getAllForAdmin();

    StylistResponseDTO getByIdForAdmin(Long id);

    StylistResponseDTO update(Long id, StylistRequestDTO request);

    void delete(Long id);

    StylistResponseDTO updateStatus(Long id, Boolean isActive);
}