package com.lca.controllers.api;

import com.lca.dtos.request.AppointmentRequestDTO;
import com.lca.dtos.response.AppointmentResponseDTO;
import com.lca.service.AppointmentService;
import com.lca.utils.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponseDTO> create(
            Authentication authentication,
            @Valid @RequestBody AppointmentRequestDTO request) {

        AppointmentResponseDTO response = appointmentService.create(authentication.getName(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/appointments/my")
    public ResponseEntity<Page<AppointmentResponseDTO>> getMyAppointments(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(appointmentService.getMyAppointments(authentication.getName(), pageable));
    }

    @GetMapping("/appointments/my/{id}")
    public ResponseEntity<AppointmentResponseDTO> getMyAppointmentById(Authentication authentication, @PathVariable Long id) {

        return ResponseEntity.ok(appointmentService.getMyAppointmentById(authentication.getName(), id));
    }

    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<Void> cancel(Authentication authentication, @PathVariable Long id) {

        appointmentService.cancel(authentication.getName(), id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/appointments/{id}/reschedule")
    public ResponseEntity<AppointmentResponseDTO> reschedule(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequestDTO request) {

        return ResponseEntity.ok(appointmentService.reschedule(authentication.getName(), id, request));
    }

    @GetMapping("/stylists/me/appointments")
    public ResponseEntity<Page<AppointmentResponseDTO>> getStylistAppointments(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(appointmentService.getStylistAppointments(authentication.getName(), false, pageable));
    }

    @GetMapping("/stylists/me/appointments/today")
    public ResponseEntity<Page<AppointmentResponseDTO>> getTodayAppointments(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PaginationUtil.create(page, size);

        return ResponseEntity.ok(appointmentService.getStylistAppointments(authentication.getName(), true, pageable));
    }

    @GetMapping("/stylists/me/appointments/{id}")
    public ResponseEntity<AppointmentResponseDTO> getStylistAppointment(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getStylistAppointment(authentication.getName(), id));
    }

    @PostMapping("/stylists/me/appointments/{id}/start")
    public ResponseEntity<AppointmentResponseDTO> start(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.start(authentication.getName(), id));
    }

    @PostMapping("/stylists/me/appointments/{id}/complete")
    public ResponseEntity<AppointmentResponseDTO> complete(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.complete(authentication.getName(), id));
    }

    @PutMapping("/stylists/me/appointments/{id}/note")
    public ResponseEntity<AppointmentResponseDTO> updateNote(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(required = false) String stylistNote
    ) {
        return ResponseEntity.ok(appointmentService.updateNote(authentication.getName(), id, stylistNote));
    }
}