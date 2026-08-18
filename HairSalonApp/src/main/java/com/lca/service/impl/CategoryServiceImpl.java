package com.lca.service.impl;

import com.lca.dtos.request.CategoryRequestDTO;
import com.lca.dtos.response.CategoryResponseDTO;
import com.lca.entity.Category;
import com.lca.mapper.CategoryMapper;
import com.lca.repository.CategoryRepository;
import com.lca.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepo;

    @Override
    public CategoryResponseDTO create(CategoryRequestDTO request) {

        if (categoryRepo.existsByName(request.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại: " + request.getName());
        }

        Category category = CategoryMapper.toEntity(request);

        Category saved = categoryRepo.save(category);

        return CategoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getById(Long id) {

        Category category = categoryRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));

        return CategoryMapper.toResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAll() {
        return categoryRepo.findAll().stream().map(CategoryMapper::toResponse).toList();
    }

    @Override
    public CategoryResponseDTO update(Long id, CategoryRequestDTO request) {

        Category category = categoryRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));

        boolean nameChanged = !category.getName().equals(request.getName());

        if (nameChanged && categoryRepo.existsByName(request.getName())) {

            throw new RuntimeException("Tên danh mục đã tồn tại: " + request.getName());
        }

        CategoryMapper.updateEntity(category, request);

        Category updated = categoryRepo.save(category);

        return CategoryMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        Category category = categoryRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));

        categoryRepo.delete(category);
    }
}