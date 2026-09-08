package com.lca.mapper;

import com.lca.dtos.request.ProductRequestDTO;
import com.lca.dtos.response.ProductResponseDTO;
import com.lca.entity.Product;

public class ProductMapper {

    public static Product toEntity(ProductRequestDTO dto) {

        Product product = new Product();

        product.setProductCode(dto.getProductCode());
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());

        product.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);

        product.setMinStockAlert(dto.getMinStockAlert() != null ? dto.getMinStockAlert() : 5);

        product.setImageUrl(dto.getImageUrl());

        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return product;
    }

    public static ProductResponseDTO toResponse(Product product) {

        ProductResponseDTO dto = new ProductResponseDTO();

        dto.setId(product.getId());

        if (product.getSupplier() != null) {

            dto.setSupplierId(product.getSupplier().getId());

            dto.setSupplierName(product.getSupplier().getName());
        }

        if (product.getCategory() != null) {

            dto.setCategoryId(product.getCategory().getId());

            dto.setCategoryName(product.getCategory().getName());
        }

        dto.setProductCode(product.getProductCode());

        dto.setName(product.getName());

        dto.setPrice(product.getPrice());

        dto.setStockQuantity(product.getStockQuantity());

        dto.setMinStockAlert(product.getMinStockAlert());

        dto.setImageUrl(product.getImageUrl());

        dto.setIsActive(product.getIsActive());

        return dto;
    }

    public static void updateEntity(Product product, ProductRequestDTO dto) {

        product.setProductCode(dto.getProductCode());

        product.setName(dto.getName());

        product.setPrice(dto.getPrice());

        product.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : product.getStockQuantity());

        product.setMinStockAlert(dto.getMinStockAlert() != null ? dto.getMinStockAlert() : product.getMinStockAlert());

        product.setImageUrl(dto.getImageUrl());

        if (dto.getIsActive() != null) {
            product.setIsActive(dto.getIsActive());
        }
    }
}