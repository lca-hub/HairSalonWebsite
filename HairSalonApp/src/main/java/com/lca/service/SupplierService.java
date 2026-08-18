package com.lca.service;

import com.lca.dtos.request.SupplierRequestDTO;
import com.lca.dtos.response.SupplierResponseDTO;

import java.util.List;

public interface SupplierService {

    SupplierResponseDTO create(SupplierRequestDTO request);

    SupplierResponseDTO getById(Long id);

    List<SupplierResponseDTO> getAll();

    SupplierResponseDTO update(Long id, SupplierRequestDTO request);

    void delete(Long id);
}