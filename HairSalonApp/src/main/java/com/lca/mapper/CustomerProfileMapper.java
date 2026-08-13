package com.lca.mapper;

import com.lca.dtos.request.CustomerRequestDTO;
import com.lca.dtos.response.CustomerResponseDTO;
import com.lca.entity.Customer;

public class CustomerProfileMapper {

    public static Customer toEntity(CustomerRequestDTO dto) {

        Customer customer = new Customer();

        customer.setDob(dto.getDob());
        customer.setGender(dto.getGender());

        return customer;
    }

    public static CustomerResponseDTO toResponse(Customer customer) {

        CustomerResponseDTO dto = new CustomerResponseDTO();

        dto.setId(customer.getId());

        if (customer.getUser() != null) {
            dto.setUserId(customer.getUser().getId());
            dto.setFullname(customer.getUser().getFullname());
            dto.setEmail(customer.getUser().getEmail());
            dto.setPhoneNumber(customer.getUser().getPhoneNumber());
            dto.setAvatar(customer.getUser().getAvatar());
        }

        dto.setDob(customer.getDob());
        dto.setGender(customer.getGender());
        dto.setTotalVisits(customer.getTotalVisits());
        dto.setTotalSpent(customer.getTotalSpent());

        return dto;
    }
}