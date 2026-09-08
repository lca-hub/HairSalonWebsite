package com.lca.service;

import com.lca.dtos.request.SupplierRequestDTO;
import com.lca.dtos.response.SupplierResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SupplierService {

    SupplierResponseDTO create(SupplierRequestDTO request);

    SupplierResponseDTO getById(Long id);

    Page<SupplierResponseDTO> getAll(Pageable pageable);

    SupplierResponseDTO update(Long id, SupplierRequestDTO request);

    void delete(Long id);

    Page<SupplierResponseDTO> search(String keyword, Pageable pageable);
}