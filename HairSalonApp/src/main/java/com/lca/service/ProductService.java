package com.lca.service;

import com.lca.dtos.request.ProductRequestDTO;
import com.lca.dtos.response.ProductResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    ProductResponseDTO getById(Long id);

    Page<ProductResponseDTO> getAll(Pageable pageable);

    Page<ProductResponseDTO> getActiveProducts(Pageable pageable);

    Page<ProductResponseDTO> search(String keyword, Long categoryId, Long supplierId, Pageable pageable);

    Page<ProductResponseDTO> getBySupplier(Long supplierId, Pageable pageable);

    Page<ProductResponseDTO> getByCategory(Long categoryId, Pageable pageable);

    ProductResponseDTO create(ProductRequestDTO request, MultipartFile image);

    ProductResponseDTO update(Long id, ProductRequestDTO request, MultipartFile image);

    void delete(Long id);

    ProductResponseDTO updateStatus(Long id, Boolean isActive);

    Page<ProductResponseDTO> getLowStockProducts(Pageable pageable);
}