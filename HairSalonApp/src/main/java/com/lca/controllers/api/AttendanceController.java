package com.lca.controllers.api;

import com.lca.dtos.response.AttendanceResponseDTO;
import com.lca.service.AttendanceService;
import com.lca.utils.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stylists/me/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponseDTO> checkIn(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.checkIn(authentication.getName()));
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceResponseDTO> checkOut(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.checkOut(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<Page<AttendanceResponseDTO>> getMyAttendance(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.create(page, size);
        return ResponseEntity.ok(attendanceService.getMyAttendance(authentication.getName(), pageable));
    }

    @GetMapping("/today")
    public ResponseEntity<AttendanceResponseDTO> getToday(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.getToday(authentication.getName()));
    }
}
