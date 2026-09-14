package com.lca.service.impl;

import com.lca.dtos.request.ReviewRequestDTO;
import com.lca.dtos.response.ReviewResponseDTO;
import com.lca.entity.Appointment;
import com.lca.entity.Review;
import com.lca.entity.Customer;
import com.lca.entity.User;
import com.lca.enums.AppointmentStatus;
import com.lca.mapper.ReviewMapper;
import com.lca.repository.AppointmentRepository;
import com.lca.repository.ReviewRepository;
import com.lca.repository.CustomerRepository;
import com.lca.repository.UserRepository;
import com.lca.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponseDTO create(String email, ReviewRequestDTO request) {

        User user = getUserByEmail(email);
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy appointment với ID: " + request.getAppointmentId()));

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Appointment không thuộc customer này");
        }

        if (reviewRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new RuntimeException("Appointment này đã được đánh giá");
        }

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Chỉ được đánh giá appointment đã hoàn thành");
        }

        Review review = ReviewMapper.toEntity(request);

        review.setAppointment(appointment);

        Review saved = reviewRepository.save(review);

        return ReviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getByStylist(Long stylistId, Pageable pageable) {

        return reviewRepository.findByAppointmentStylistId(stylistId, pageable).map(ReviewMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponseDTO getById(Long id) {

        Review review = reviewRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy review với ID: " + id));

        return ReviewMapper.toResponse(review);
    }

    @Override
    public ReviewResponseDTO update(String email, Long id, ReviewRequestDTO request) {

        Review review = reviewRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy review với ID: " + id));

        User user = getUserByEmail(email);
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));

        if (review.getAppointment() == null
                || !review.getAppointment().getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Review không thuộc customer này");
        }

        ReviewMapper.updateEntity(review, request);

        Review updated = reviewRepository.save(review);

        return ReviewMapper.toResponse(updated);
    }

    @Override
    public void delete(String email, Long id) {

        Review review = reviewRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy review với ID: " + id));

        User user = getUserByEmail(email);
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy customer"));

        if (review.getAppointment() == null
                || !review.getAppointment().getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Review không thuộc customer này");
        }

        reviewRepository.delete(review);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> findAll(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(ReviewMapper::toResponse);
    }

    @Override
    public void adminDelete(Long id) {

        Review review = reviewRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy review với ID: " + id));

        reviewRepository.delete(review);
    }
}