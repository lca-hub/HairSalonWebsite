package com.lca.controllers;

import com.lca.dtos.request.AppointmentRequestDTO;
import com.lca.dtos.response.AppointmentResponseDTO;
import com.lca.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> create(@Valid @RequestBody AppointmentRequestDTO request) {

        AppointmentResponseDTO response = appointmentService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponseDTO>>
    getMyAppointments(@RequestParam Long customerId) {

        return ResponseEntity.ok(appointmentService.getMyAppointments(customerId));
    }

    @GetMapping("/my/{id}")
    public ResponseEntity<AppointmentResponseDTO>
    getMyAppointmentById(@PathVariable Long id, @RequestParam Long customerId) {

        return ResponseEntity.ok(appointmentService.getMyAppointmentById(customerId, id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id, @RequestParam Long customerId) {

        appointmentService.cancel(customerId, id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponseDTO> reschedule(
            @PathVariable Long id, @RequestParam Long customerId,
            @Valid @RequestBody AppointmentRequestDTO request) {

        return ResponseEntity.ok(appointmentService.reschedule(customerId, id, request));
    }
}