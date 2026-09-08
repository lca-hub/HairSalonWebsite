package com.lca.controllers.api;

import com.lca.dtos.response.AttendanceResponseDTO;
import com.lca.service.AttendanceService;
import com.lca.utils.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stylists/me/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponseDTO> checkIn(@RequestParam Long userId) {
        return ResponseEntity.ok(attendanceService.checkIn(userId));
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceResponseDTO> checkOut(@RequestParam Long userId) {
        return ResponseEntity.ok(attendanceService.checkOut(userId));
    }

    @GetMapping
    public ResponseEntity<Page<AttendanceResponseDTO>> getMyAttendance(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.create(page, size);
        return ResponseEntity.ok(attendanceService.getMyAttendance(userId, pageable));
    }

    @GetMapping("/today")
    public ResponseEntity<AttendanceResponseDTO> getToday(@RequestParam Long userId) {
        return ResponseEntity.ok(attendanceService.getToday(userId));
    }
}