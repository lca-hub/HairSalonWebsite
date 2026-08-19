package com.lca.controllers.api;

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
@RequestMapping("/api")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponseDTO> create(@Valid @RequestBody AppointmentRequestDTO request) {
        AppointmentResponseDTO response = appointmentService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/appointments/my")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyAppointments(@RequestParam Long customerId) {

        return ResponseEntity.ok(appointmentService.getMyAppointments(customerId));
    }

    @GetMapping("/appointments/my/{id}")
    public ResponseEntity<AppointmentResponseDTO> getMyAppointmentById(@PathVariable Long id, @RequestParam Long customerId) {

        return ResponseEntity.ok(appointmentService.getMyAppointmentById(customerId, id));
    }

    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id, @RequestParam Long customerId) {

        appointmentService.cancel(customerId, id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/appointments/{id}/reschedule")
    public ResponseEntity<AppointmentResponseDTO> reschedule(@PathVariable Long id,
            @RequestParam Long customerId, @Valid @RequestBody AppointmentRequestDTO request) {

        return ResponseEntity.ok(appointmentService.reschedule(customerId, id, request));
    }

    @GetMapping("/stylists/me/appointments")
    public ResponseEntity<List<AppointmentResponseDTO>> getStylistAppointments(@RequestParam Long stylistId) {

        return ResponseEntity.ok(appointmentService.getMyAppointments(stylistId, false));
    }

    @GetMapping("/stylists/me/appointments/today")
    public ResponseEntity<List<AppointmentResponseDTO>> getTodayAppointments(@RequestParam Long stylistId) {

        return ResponseEntity.ok(appointmentService.getMyAppointments(stylistId, true));
    }

    @GetMapping("/stylists/me/appointments/{id}")
    public ResponseEntity<AppointmentResponseDTO> getStylistAppointment(@PathVariable Long id, @RequestParam Long stylistId) {

        return ResponseEntity.ok(appointmentService.getStylistAppointment(stylistId, id));
    }

    @PostMapping("/stylists/me/appointments/{id}/start")
    public ResponseEntity<AppointmentResponseDTO> start(@PathVariable Long id, @RequestParam Long stylistId) {

        return ResponseEntity.ok(appointmentService.start(stylistId, id));
    }

    @PostMapping("/stylists/me/appointments/{id}/complete")
    public ResponseEntity<AppointmentResponseDTO> complete(@PathVariable Long id, @RequestParam Long stylistId) {

        return ResponseEntity.ok(appointmentService.complete(stylistId, id));
    }

    @PutMapping("/stylists/me/appointments/{id}/note")
    public ResponseEntity<AppointmentResponseDTO> updateNote(@PathVariable Long id, @RequestParam Long stylistId, @RequestParam(required = false) String stylistNote) {

        return ResponseEntity.ok(appointmentService.updateNote(stylistId, id, stylistNote));
    }
}