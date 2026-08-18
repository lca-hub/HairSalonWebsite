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
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    public List<StylistResponseDTO> getAll() {

        return stylistRepository.findAll().stream()
                .filter(stylist -> stylist.getUser() != null && Boolean.TRUE.equals(stylist.getUser().getIsActive()))
                .map(StylistMapper::toResponse).toList();
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
    public List<ServiceResponseDTO> getServices(Long stylistId) {

        Stylist stylist = stylistRepository.findById(stylistId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + stylistId));

        return serviceRepository.findByIsActiveTrue().stream().map(ServiceMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviews(Long stylistId) {

        stylistRepository.findById(stylistId).orElseThrow(
                () -> new RuntimeException("Không tìm thấy stylist với ID: " + stylistId));

        return reviewRepository.findByAppointmentStylistId(stylistId).stream()
                .map(ReviewMapper::toResponse).toList();
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
    public List<StylistResponseDTO> getAllForAdmin() {

        return stylistRepository.findAll().stream().map(StylistMapper::toResponse).toList();
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
}