package com.lca.service;

import com.lca.dtos.request.ServiceRequestDTO;
import com.lca.dtos.response.ServiceResponseDTO;

import java.util.List;

public interface ServiceService {

    ServiceResponseDTO create(ServiceRequestDTO request);

    ServiceResponseDTO getById(Long id);

    List<ServiceResponseDTO> getAll();

    List<ServiceResponseDTO> getActiveServices();

    List<ServiceResponseDTO> getByCategory(Long categoryId);

    ServiceResponseDTO update(Long id, ServiceRequestDTO request);

    void delete(Long id);

    ServiceResponseDTO updateStatus(Long id, Boolean isActive);
}