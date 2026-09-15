package com.lca.service;

import com.lca.dtos.request.StylistScheduleRequestDTO;
import com.lca.dtos.response.StylistScheduleResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface StylistScheduleService {

    List<StylistScheduleResponseDTO> getByStylist(Long stylistId);

    List<StylistScheduleResponseDTO> getByStylistAndDate(Long stylistId, LocalDate workDate);

    List<String> getAvailableSlots(Long stylistId, LocalDate workDate, Long serviceId);

    List<StylistScheduleResponseDTO> getMySchedule(String email);

    StylistScheduleResponseDTO create(StylistScheduleRequestDTO request);

    List<StylistScheduleResponseDTO> getAll();

    StylistScheduleResponseDTO getById(Long id);

    StylistScheduleResponseDTO update(Long id, StylistScheduleRequestDTO request);

    void delete(Long id);
}