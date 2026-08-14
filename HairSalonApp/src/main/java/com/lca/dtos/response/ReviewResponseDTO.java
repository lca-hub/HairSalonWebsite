package com.lca.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewResponseDTO {

    private Long id;

    private Long appointmentId;

    private String customerName;

    private String stylistName;

    private Integer rating;

    private String comment;

    private LocalDateTime createdAt;
}