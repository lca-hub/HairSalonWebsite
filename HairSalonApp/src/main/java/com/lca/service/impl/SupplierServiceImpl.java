package com.lca.service.impl;

import com.lca.dtos.request.SupplierRequestDTO;
import com.lca.dtos.response.SupplierResponseDTO;
import com.lca.entity.Supplier;
import com.lca.mapper.SupplierMapper;
import com.lca.repository.SupplierRepository;
import com.lca.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public SupplierResponseDTO create(SupplierRequestDTO request) {

        Supplier supplier = SupplierMapper.toEntity(request);

        Supplier saved = supplierRepository.save(supplier);

        return SupplierMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponseDTO getById(Long id) {

        Supplier supplier = supplierRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));

        return SupplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponseDTO> getAll() {

        return supplierRepository.findAll().stream().map(SupplierMapper::toResponse).toList();
    }

    @Override
    public SupplierResponseDTO update(Long id, SupplierRequestDTO request) {

        Supplier supplier = supplierRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));

        SupplierMapper.updateEntity(supplier, request);

        Supplier updated = supplierRepository.save(supplier);

        return SupplierMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {

        Supplier supplier = supplierRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));

        supplierRepository.delete(supplier);
    }
}