package com.lca.dtos.request;

import lombok.Data;

@Data
public class StylistRequestDTO {

    private Long userId;

    private String specialization;

    private Integer experienceYears;

    private String bio;
}
