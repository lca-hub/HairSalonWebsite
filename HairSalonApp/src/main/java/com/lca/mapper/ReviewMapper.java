package com.lca.mapper;

import com.lca.dtos.request.ReviewRequestDTO;
import com.lca.dtos.response.ReviewResponseDTO;
import com.lca.entity.Review;

public class ReviewMapper {

    private ReviewMapper() {
    }

    public static Review toEntity(ReviewRequestDTO dto) {

        Review review = new Review();

        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        return review;
    }

    public static void updateEntity(Review review, ReviewRequestDTO dto) {
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
    }

    public static ReviewResponseDTO toResponse(Review review) {

        ReviewResponseDTO dto = new ReviewResponseDTO();

        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());

        if (review.getAppointment() != null) {

            dto.setAppointmentId(review.getAppointment().getId());

            if (review.getAppointment().getCustomer() != null && review.getAppointment().getCustomer().getUser() != null) {
                dto.setCustomerName(review.getAppointment().getCustomer().getUser().getFullname());
            }

            if (review.getAppointment().getStylist() != null && review.getAppointment().getStylist().getUser() != null) {
                dto.setStylistName(review.getAppointment().getStylist().getUser().getFullname());
            }
        }

        return dto;
    }
}