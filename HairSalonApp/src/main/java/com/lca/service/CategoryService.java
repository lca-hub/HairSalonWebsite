package com.lca.service;

import com.lca.dtos.request.CategoryRequestDTO;
import com.lca.dtos.response.CategoryResponseDTO;
import com.lca.enums.CategoryType;

import java.util.List;

public interface CategoryService {

    CategoryResponseDTO create(CategoryRequestDTO request);

    CategoryResponseDTO getById(Long id);

    List<CategoryResponseDTO> getAll();

    List<CategoryResponseDTO> getAllByType(CategoryType type);

    CategoryResponseDTO update(Long id, CategoryRequestDTO request);

    void delete(Long id);
}