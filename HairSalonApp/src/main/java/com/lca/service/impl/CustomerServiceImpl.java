package com.lca.service.impl;

import com.lca.dtos.request.CustomerRequestDTO;
import com.lca.dtos.response.CustomerResponseDTO;
import com.lca.entity.Customer;
import com.lca.entity.User;
import com.lca.enums.Gender;
import com.lca.mapper.CustomerMapper;
import com.lca.repository.CustomerRepository;
import com.lca.repository.UserRepository;
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
    private final UserRepository userRepository;

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

    @Override
    @Transactional
    public CustomerResponseDTO updateMe(String email, CustomerRequestDTO request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        if (request.getDob() != null) {
            customer.setDob(request.getDob());
        }

        if (request.getGender() != null) {
            customer.setGender(request.getGender());
        }

        userRepository.save(user);
        customerRepository.save(customer);

        return CustomerMapper.toResponse(customer);
    }

    @Override
    public CustomerResponseDTO getByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng"));

        return CustomerMapper.toResponse(customer);
    }
}