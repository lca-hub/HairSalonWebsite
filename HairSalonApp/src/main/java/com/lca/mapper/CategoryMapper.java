package com.lca.mapper;

import com.lca.dtos.request.CategoryRequestDTO;
import com.lca.dtos.response.CategoryResponseDTO;
import com.lca.entity.Category;

public class CategoryMapper {

    private CategoryMapper() {
    }

    public static Category toEntity(CategoryRequestDTO dto) {

        Category category = new Category();

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setType(dto.getType());

        return category;
    }

    public static void updateEntity(Category category,CategoryRequestDTO dto) {

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setType(dto.getType());
    }

    public static CategoryResponseDTO toResponse(Category category) {

        CategoryResponseDTO dto = new CategoryResponseDTO();

        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setType(category.getType());

        return dto;
    }
}