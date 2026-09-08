package com.lca.controllers.admin;

import com.lca.dtos.request.StylistScheduleRequestDTO;
import com.lca.dtos.response.StylistScheduleResponseDTO;
import com.lca.service.StylistScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/schedules")
@RequiredArgsConstructor
public class AdminStylistScheduleController {

    private final StylistScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<StylistScheduleResponseDTO> create(@Valid @RequestBody StylistScheduleRequestDTO request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<StylistScheduleResponseDTO>> getAll() {
        return ResponseEntity.ok(scheduleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StylistScheduleResponseDTO> getById(@PathVariable Long id) {

        return ResponseEntity.ok(scheduleService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StylistScheduleResponseDTO> update(
            @PathVariable Long id, @Valid @RequestBody StylistScheduleRequestDTO request) {

        return ResponseEntity.ok(scheduleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        scheduleService.delete(id);

        return ResponseEntity.noContent().build();
    }
}