package com.lca.mapper;

import com.lca.dtos.request.StylistRequestDTO;
import com.lca.dtos.response.StylistResponseDTO;
import com.lca.entity.Stylist;

public class StylistMapper {

    public static Stylist toEntity(StylistRequestDTO dto) {

        Stylist stylist = new Stylist();

        stylist.setSpecialization(dto.getSpecialization());
        stylist.setExperienceYears(dto.getExperienceYears());
        stylist.setBio(dto.getBio());

        return stylist;
    }

    public static StylistResponseDTO toResponse(Stylist stylist) {

        StylistResponseDTO dto = new StylistResponseDTO();

        dto.setId(stylist.getId());

        if (stylist.getUser() != null) {
            dto.setUserId(stylist.getUser().getId());
            dto.setFullname(stylist.getUser().getFullname());
            dto.setEmail(stylist.getUser().getEmail());
            dto.setPhoneNumber(stylist.getUser().getPhoneNumber());
            dto.setAvatar(stylist.getUser().getAvatar());
        }

        dto.setSpecialization(stylist.getSpecialization());
        dto.setExperienceYears(stylist.getExperienceYears());
        dto.setBio(stylist.getBio());
        dto.setAverageRating(stylist.getAverageRating());

        return dto;
    }
}
