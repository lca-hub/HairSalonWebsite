package com.lca.service;

import com.lca.dtos.request.ServiceRequestDTO;
import com.lca.dtos.response.ServiceResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ServiceService {

    ServiceResponseDTO create(ServiceRequestDTO request);

    ServiceResponseDTO getById(Long id);

    Page<ServiceResponseDTO> getAll(Pageable pageable);

    Page<ServiceResponseDTO> getActiveServices(Pageable pageable);

    Page<ServiceResponseDTO> getByCategory(Long categoryId, Pageable pageable);

    ServiceResponseDTO update(Long id, ServiceRequestDTO request);

    void delete(Long id);

    ServiceResponseDTO updateStatus(Long id, Boolean isActive);

    Page<ServiceResponseDTO> search(String keyword,Long categoryId, Boolean isActive, Pageable pageable);
}