package com.lca.service.impl;

import com.lca.dtos.request.SupplierRequestDTO;
import com.lca.dtos.response.SupplierResponseDTO;
import com.lca.entity.Supplier;
import com.lca.mapper.SupplierMapper;
import com.lca.repository.ProductRepository;
import com.lca.repository.SupplierRepository;
import com.lca.service.SupplierService;
import com.lca.specification.SupplierSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @Override
    public SupplierResponseDTO create(SupplierRequestDTO request) {
        if (supplierRepository.existsByNameIgnoreCase(request.getName()))
            throw new RuntimeException("Tên nhà cung cấp đã tồn tại");

        if (request.getEmail() != null && !request.getEmail().isBlank() &&
                supplierRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email nhà cung cấp đã tồn tại");

        if (request.getPhone() != null && !request.getPhone().isBlank() &&
                supplierRepository.existsByPhone(request.getPhone()))
            throw new RuntimeException("Số điện thoại nhà cung cấp đã tồn tại");

        Supplier supplier = SupplierMapper.toEntity(request);
        return SupplierMapper.toResponse(supplierRepository.save(supplier));
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
    public Page<SupplierResponseDTO> getAll(Pageable pageable) {
        return supplierRepository.findAll(pageable).map(SupplierMapper::toResponse);
    }

    @Override
    public SupplierResponseDTO update(Long id, SupplierRequestDTO request) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));

        if (!supplier.getName().equalsIgnoreCase(request.getName()) &&
                supplierRepository.existsByNameIgnoreCase(request.getName()))
            throw new RuntimeException("Tên nhà cung cấp đã tồn tại");

        if (request.getEmail() != null &&
                !request.getEmail().isBlank() &&
                !request.getEmail().equalsIgnoreCase(supplier.getEmail()) &&
                supplierRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email nhà cung cấp đã tồn tại");

        if (request.getPhone() != null &&
                !request.getPhone().isBlank() &&
                !request.getPhone().equals(supplier.getPhone()) &&
                supplierRepository.existsByPhone(request.getPhone()))
            throw new RuntimeException("Số điện thoại nhà cung cấp đã tồn tại");

        SupplierMapper.updateEntity(supplier, request);
        return SupplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Override
    public void delete(Long id) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));
        if (productRepository.existsBySupplierId(id))
            throw new RuntimeException("Không thể xóa nhà cung cấp vì đang có sản phẩm sử dụng nhà cung cấp này");
        supplierRepository.delete(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponseDTO> search(String keyword, Pageable pageable) {
        Specification<Supplier> specification = Specification.where(SupplierSpecification.keyword(keyword));
        return supplierRepository.findAll(specification, pageable).map(SupplierMapper::toResponse);
    }
}