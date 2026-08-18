package com.lca.dtos.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StylistResponseDTO {

    private Long id;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String avatar;

    private String specialization;

    private Integer experienceYears;

    private String bio;

    private BigDecimal averageRating;
}