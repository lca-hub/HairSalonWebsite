package com.lca.controllers.admin;

import com.lca.dtos.response.StatisticsResponseDTO;
import com.lca.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Year;

@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
public class AdminStatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping
    public ResponseEntity<StatisticsResponseDTO> getDashboard() {
        return ResponseEntity.ok(statisticsService.getDashboard());
    }

    @GetMapping("/stats")
    public ResponseEntity<StatisticsResponseDTO> getStats(
            @RequestParam(defaultValue = "MONTH") String statsType,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        int targetYear = year == null ? Year.now().getValue() : year;
        return ResponseEntity.ok(statisticsService.getStats(statsType, targetYear, month));
    }
}
