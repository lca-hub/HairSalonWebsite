package com.lca.service.impl;

import com.lca.dtos.request.ServiceRequestDTO;
import com.lca.dtos.response.ServiceResponseDTO;
import com.lca.entity.Category;
import com.lca.entity.Service;
import com.lca.enums.CategoryType;
import com.lca.mapper.ServiceMapper;
import com.lca.repository.CategoryRepository;
import com.lca.repository.ServiceRepository;
import com.lca.service.ServiceService;
import com.lca.specification.ServiceSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepo;
    private final CategoryRepository categoryRepo;

    @Override
    public ServiceResponseDTO create(ServiceRequestDTO request) {

        if (request.getServiceCode() != null && serviceRepo.existsByServiceCode(request.getServiceCode())) {
            throw new RuntimeException("Mã dịch vụ đã tồn tại: " + request.getServiceCode());
        }

        Category category = categoryRepo.findById(request.getCategoryId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy category với ID: " + request.getCategoryId()));

        if (category.getType() != CategoryType.SERVICE) {
            throw new RuntimeException("Category được chọn không phải category của dịch vụ.");
        }

        Service service = ServiceMapper.toEntity(request);

        service.setCategory(category);

        if (service.getIsActive() == null) {
            service.setIsActive(true);
        }

        Service saved = serviceRepo.save(service);

        return ServiceMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponseDTO getById(Long id) {

        Service service = serviceRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: "+ id));

        return ServiceMapper.toResponse(service);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceResponseDTO> getAll(Pageable pageable) {
        return serviceRepo.findAll(pageable).map(ServiceMapper::toResponse);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<ServiceResponseDTO> getActiveServices(Pageable pageable) {
        return serviceRepo.findByIsActiveTrue(pageable).map(ServiceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceResponseDTO> getByCategory(Long categoryId, Pageable pageable) {

        Category category =
                categoryRepo.findById(categoryId).orElseThrow(
                        () -> new RuntimeException("Không tìm thấy category với ID: " + categoryId));

        if (category.getType() != CategoryType.SERVICE) {
            throw new RuntimeException("Category này không thuộc nhóm dịch vụ.");
        }

        return serviceRepo.findByCategoryIdAndIsActiveTrue(categoryId, pageable).map(ServiceMapper::toResponse);
    }

    @Override
    public ServiceResponseDTO update(Long id, ServiceRequestDTO request) {

        Service service = serviceRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        if (request.getServiceCode() != null && !request.getServiceCode().equals(service.getServiceCode())
                        && serviceRepo.existsByServiceCode(request.getServiceCode())) {
            throw new RuntimeException("Mã dịch vụ đã tồn tại: " + request.getServiceCode());
        }

        Category category = categoryRepo.findById(request.getCategoryId()).orElseThrow(() -> new RuntimeException("Không tìm thấy category với ID: " + request.getCategoryId()));
        if (category.getType() != CategoryType.SERVICE) {
            throw new RuntimeException("Category được chọn không phải category của dịch vụ.");
        }

        ServiceMapper.updateEntity(service, request);

        service.setCategory(category);

        Service updated = serviceRepo.save(service);

        return ServiceMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {

        Service service = serviceRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        service.setIsActive(false);

        serviceRepo.save(service);
    }

    @Override
    public ServiceResponseDTO updateStatus(Long id, Boolean isActive) {

        Service service = serviceRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));

        service.setIsActive(isActive);

        Service updated = serviceRepo.save(service);

        return ServiceMapper.toResponse(updated);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<ServiceResponseDTO> search(String keyword, Long categoryId, Boolean isActive, Pageable pageable) {
        List<Specification<Service>> specifications = new ArrayList<>();

        Specification<Service> keywordSpec = ServiceSpecification.keyword(keyword);

        Specification<Service> categorySpec = ServiceSpecification.categoryId(categoryId);

        Specification<Service> activeSpec = ServiceSpecification.active(isActive);

        if (keywordSpec != null) {
            specifications.add(keywordSpec);
        }

        if (categorySpec != null) {
            specifications.add(categorySpec);
        }

        if (activeSpec != null) {
            specifications.add(activeSpec);
        }

        Specification<Service> specification = Specification.allOf(specifications);

        return serviceRepo.findAll(specification, pageable).map(ServiceMapper::toResponse);
    }
}