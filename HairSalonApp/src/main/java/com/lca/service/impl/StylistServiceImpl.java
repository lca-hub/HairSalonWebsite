package com.lca.service.impl;

import com.lca.dtos.request.StylistRequestDTO;
import com.lca.dtos.response.ReviewResponseDTO;
import com.lca.dtos.response.ServiceResponseDTO;
import com.lca.dtos.response.StylistResponseDTO;
import com.lca.entity.Stylist;
import com.lca.entity.User;
import com.lca.mapper.ReviewMapper;
import com.lca.mapper.ServiceMapper;
import com.lca.mapper.StylistMapper;
import com.lca.repository.ReviewRepository;
import com.lca.repository.ServiceRepository;
import com.lca.repository.StylistRepository;
import com.lca.repository.UserRepository;
import com.lca.service.StylistService;
import com.lca.specification.StylistSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class StylistServiceImpl implements StylistService {

    private final StylistRepository stylistRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<StylistResponseDTO> getAll(Pageable pageable) {
        return stylistRepository.findByUserIsActiveTrue(pageable).map(StylistMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public StylistResponseDTO getById(Long id) {
        Stylist stylist = stylistRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + id));

        if (stylist.getUser() == null || !Boolean.TRUE.equals(stylist.getUser().getIsActive())) {
            throw new RuntimeException("Stylist không hoạt động");
        }

        return StylistMapper.toResponse(stylist);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceResponseDTO> getServices(Long stylistId, Pageable pageable) {
        stylistRepository.findById(stylistId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + stylistId));

        return serviceRepository.findByIsActiveTrue(pageable).map(ServiceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getReviews(Long stylistId, Pageable pageable) {
        stylistRepository.findById(stylistId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + stylistId));

        return reviewRepository.findByAppointmentStylistId(stylistId, pageable).map(ReviewMapper::toResponse);
    }

    @Override
    public StylistResponseDTO create(StylistRequestDTO request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user với ID: " + request.getUserId()));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("User đang bị khóa");
        }

        if (stylistRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("User này đã có stylist profile");
        }

        Stylist stylist = StylistMapper.toEntity(request);
        stylist.setUser(user);

        if (stylist.getExperienceYears() == null) {
            stylist.setExperienceYears(0);
        }

        if (stylist.getAverageRating() == null) {
            stylist.setAverageRating(new java.math.BigDecimal("0.00"));
        }

        Stylist saved = stylistRepository.save(stylist);

        return StylistMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StylistResponseDTO> getAllForAdmin(Pageable pageable) {
        return stylistRepository.findAll(pageable).map(StylistMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public StylistResponseDTO getByIdForAdmin(Long id) {
        Stylist stylist = stylistRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + id));

        return StylistMapper.toResponse(stylist);
    }

    @Override
    public StylistResponseDTO update(Long id, StylistRequestDTO request) {
        Stylist stylist = stylistRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + id));

        User user = userRepository.findById(request.getUserId()).orElseThrow(
                () -> new RuntimeException("Không tìm thấy user với ID: " + request.getUserId()));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("User đang bị khóa");
        }

        if (!stylist.getUser().getId().equals(request.getUserId())
                && stylistRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("User này đã có stylist profile");
        }

        StylistMapper.updateEntity(stylist, request);
        stylist.setUser(user);

        Stylist updated = stylistRepository.save(stylist);

        return StylistMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        Stylist stylist = stylistRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + id));

        stylistRepository.delete(stylist);
    }

    @Override
    public StylistResponseDTO updateStatus(Long id, Boolean isActive) {
        Stylist stylist = stylistRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + id));

        User user = stylist.getUser();

        if (user == null) {
            throw new RuntimeException("Stylist chưa liên kết với user");
        }

        user.setIsActive(isActive);
        userRepository.save(user);

        return StylistMapper.toResponse(stylist);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StylistResponseDTO> search(String keyword, String specialization, Integer minExperience, Integer maxExperience, Boolean isActive, Pageable pageable) {
        Specification<Stylist> specification = Specification.where(StylistSpecification.keyword(keyword))
                .and(StylistSpecification.specialization(specialization))
                .and(StylistSpecification.minExperience(minExperience))
                .and(StylistSpecification.maxExperience(maxExperience))
                .and(StylistSpecification.isActive(isActive));
        return stylistRepository.findAll(specification, pageable).map(StylistMapper::toResponse);
    }
}