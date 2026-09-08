package com.lca.service.impl;

import com.lca.dtos.response.CustomerResponseDTO;
import com.lca.entity.Customer;
import com.lca.enums.Gender;
import com.lca.mapper.CustomerMapper;
import com.lca.repository.CustomerRepository;
import com.lca.service.CustomerService;
import com.lca.specification.CustomerSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponseDTO> findAll(Pageable pageable) {
        return customerRepository.findAll(pageable).map(CustomerMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponseDTO getById(Long id) {
        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy customer với ID: " + id));

        return CustomerMapper.toResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponseDTO> search(String keyword, Gender gender, Boolean isActive, Pageable pageable) {
        Specification<Customer> specification = Specification.where(CustomerSpecification.keyword(keyword))
                .and(CustomerSpecification.gender(gender))
                .and(CustomerSpecification.isActive(isActive));
        return customerRepository.findAll(specification, pageable).map(CustomerMapper::toResponse);
    }
}