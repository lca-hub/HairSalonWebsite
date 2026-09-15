package com.lca.controllers.api;

import com.lca.dtos.response.StylistScheduleResponseDTO;
import com.lca.service.StylistScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stylists")
@RequiredArgsConstructor
public class StylistScheduleController {

    private final StylistScheduleService scheduleService;

    @GetMapping("/{stylistId}/schedule")
    public ResponseEntity<List<StylistScheduleResponseDTO>> getSchedule(@PathVariable Long stylistId) {
        return ResponseEntity.ok(scheduleService.getByStylist(stylistId));
    }

    @GetMapping("/me/schedule")
    public ResponseEntity<List<StylistScheduleResponseDTO>> getMySchedule(Authentication authentication) {
        return ResponseEntity.ok(scheduleService.getMySchedule(authentication.getName()));
    }

    @GetMapping("/{stylistId}/schedule/{workDate}")
    public ResponseEntity<List<StylistScheduleResponseDTO>> getScheduleByDate(
            @PathVariable Long stylistId,
            @PathVariable LocalDate workDate) {

        return ResponseEntity.ok(scheduleService.getByStylistAndDate(stylistId, workDate));
    }

    @GetMapping("/{stylistId}/available-slots")
    public ResponseEntity<List<String>> getAvailableSlots(
            @PathVariable Long stylistId,
            @RequestParam LocalDate workDate,
            @RequestParam Long serviceId) {

        return ResponseEntity.ok(scheduleService.getAvailableSlots(stylistId, workDate, serviceId));
    }
}