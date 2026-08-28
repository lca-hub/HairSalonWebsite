package com.lca.controllers.admin;

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
@RequestMapping("/api/admin/appointments")
@RequiredArgsConstructor
public class AdminAppointmentController {

    private final AppointmentService appointmentService;


    @GetMapping
    public ResponseEntity<List<AppointmentResponseDTO>> getAll() {

        return ResponseEntity.ok(appointmentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> getById(@PathVariable Long id) {

        return ResponseEntity.ok(appointmentService.getById(id));
    }

    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> create(@Valid @RequestBody AppointmentRequestDTO request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.adminCreate(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> update(@PathVariable Long id, @Valid @RequestBody AppointmentRequestDTO request) {

        return ResponseEntity.ok(appointmentService.update(id, request));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<AppointmentResponseDTO> confirm(@PathVariable Long id) {

        return ResponseEntity.ok(appointmentService.confirm(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {

        appointmentService.adminCancel(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponseDTO> reschedule(@PathVariable Long id, @Valid @RequestBody AppointmentRequestDTO request) {

        return ResponseEntity.ok(appointmentService.adminReschedule(id, request));
    }
}