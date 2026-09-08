package com.lca.service;

import com.lca.dtos.response.CustomerResponseDTO;
import com.lca.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    Page<CustomerResponseDTO> findAll(Pageable pageable);

    CustomerResponseDTO getById(Long id);

    Page<CustomerResponseDTO> search(String keyword, Gender gender, Boolean isActive, Pageable pageable);
}