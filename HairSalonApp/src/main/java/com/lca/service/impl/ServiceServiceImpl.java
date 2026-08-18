package com.lca.service.impl;

import com.lca.dtos.request.ServiceRequestDTO;
import com.lca.dtos.response.ServiceResponseDTO;
import com.lca.entity.Category;
import com.lca.entity.Service;
import com.lca.mapper.ServiceMapper;
import com.lca.repository.CategoryRepository;
import com.lca.repository.ServiceRepository;
import com.lca.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ServiceResponseDTO create(ServiceRequestDTO request) {

        if (request.getServiceCode() != null
                && serviceRepository.existsByServiceCode(request.getServiceCode())) {

            throw new RuntimeException("Mã dịch vụ đã tồn tại: " + request.getServiceCode());
        }

        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy category với ID: " + request.getCategoryId()));

        Service service = ServiceMapper.toEntity(request);

        service.setCategory(category);

        if (service.getIsActive() == null) {
            service.setIsActive(true);
        }

        Service saved = serviceRepository.save(service);

        return ServiceMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponseDTO getById(Long id) {

        Service service = serviceRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        return ServiceMapper.toResponse(service);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getAll() {

        return serviceRepository.findAll().stream().map(ServiceMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getActiveServices() {

        return serviceRepository.findByIsActiveTrue().stream().map(ServiceMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getByCategory(Long categoryId) {

        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Không tìm thấy category với ID: " + categoryId);
        }

        return serviceRepository.findByCategoryId(categoryId).stream().map(ServiceMapper::toResponse).toList();
    }

    @Override
    public ServiceResponseDTO update(Long id, ServiceRequestDTO request) {

        Service service = serviceRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        if (request.getServiceCode() != null
                && !request.getServiceCode().equals(service.getServiceCode())
                && serviceRepository.existsByServiceCode(request.getServiceCode())) {

            throw new RuntimeException("Mã dịch vụ đã tồn tại: " + request.getServiceCode());
        }

        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy category với ID: " + request.getCategoryId()));

        ServiceMapper.updateEntity(service, request);

        service.setCategory(category);

        Service updated = serviceRepository.save(service);

        return ServiceMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        Service service = serviceRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        serviceRepository.delete(service);
    }

    @Override
    public ServiceResponseDTO updateStatus(Long id, Boolean isActive) {

        Service service = serviceRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        service.setIsActive(isActive);

        Service updated = serviceRepository.save(service);

        return ServiceMapper.toResponse(updated);
    }
}