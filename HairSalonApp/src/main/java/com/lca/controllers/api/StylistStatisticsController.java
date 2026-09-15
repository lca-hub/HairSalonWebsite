package com.lca.controllers.api;

import com.lca.dtos.response.StatisticsResponseDTO;
import com.lca.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Year;

@RestController
@RequestMapping("/api/stylists/me/statistics")
@RequiredArgsConstructor
public class StylistStatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/revenue")
    public ResponseEntity<StatisticsResponseDTO> getRevenue(
            Authentication authentication,
            @RequestParam(defaultValue = "MONTH") String statsType,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        int targetYear = year == null ? Year.now().getValue() : year;

        return ResponseEntity.ok(statisticsService.getStylistStats(authentication.getName(), statsType, targetYear, month));
    }
}