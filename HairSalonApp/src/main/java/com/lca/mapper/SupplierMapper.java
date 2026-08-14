package com.lca.mapper;

import com.lca.dtos.request.SupplierRequestDTO;
import com.lca.dtos.response.SupplierResponseDTO;
import com.lca.entity.Supplier;

public class SupplierMapper {

    private SupplierMapper() {
    }

    public static Supplier toEntity(SupplierRequestDTO dto) {

        Supplier supplier = new Supplier();

        supplier.setName(dto.getName());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());

        return supplier;
    }

    public static void updateEntity(Supplier supplier, SupplierRequestDTO dto) {

        supplier.setName(dto.getName());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
    }

    public static SupplierResponseDTO toResponse(Supplier supplier) {

        SupplierResponseDTO dto = new SupplierResponseDTO();

        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setPhone(supplier.getPhone());
        dto.setEmail(supplier.getEmail());
        dto.setAddress(supplier.getAddress());

        return dto;
    }
}