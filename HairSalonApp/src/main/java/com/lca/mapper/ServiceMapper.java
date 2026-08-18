package com.lca.mapper;

import com.lca.dtos.request.ServiceRequestDTO;
import com.lca.dtos.response.ServiceResponseDTO;
import com.lca.entity.Service;

public class ServiceMapper {

    public static Service toEntity(ServiceRequestDTO dto) {

        Service service = new Service();

        service.setServiceCode(dto.getServiceCode());
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setPrice(dto.getPrice());
        service.setDurationMinutes(dto.getDurationMinutes());
        service.setImageUrl(dto.getImageUrl());

        service.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return service;
    }

    public static void updateEntity(Service service, ServiceRequestDTO dto) {

        service.setServiceCode(dto.getServiceCode());
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setPrice(dto.getPrice());
        service.setDurationMinutes(dto.getDurationMinutes());
        service.setImageUrl(dto.getImageUrl());

        if (dto.getIsActive() != null) {
            service.setIsActive(dto.getIsActive());
        }
    }


    public static ServiceResponseDTO toResponse(Service service) {

        ServiceResponseDTO dto = new ServiceResponseDTO();

        dto.setId(service.getId());

        if (service.getCategory() != null) {
            dto.setCategoryId(service.getCategory().getId());

            dto.setCategoryName(service.getCategory().getName());
        }

        dto.setServiceCode(service.getServiceCode());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setPrice(service.getPrice());
        dto.setDurationMinutes(service.getDurationMinutes());
        dto.setImageUrl(service.getImageUrl());
        dto.setIsActive(service.getIsActive());

        return dto;
    }
}
