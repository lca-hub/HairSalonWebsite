package com.lca.controllers.admin;

import com.lca.dtos.request.UserCreateRequestDTO;
import com.lca.dtos.request.UserUpdateRequestDTO;
import com.lca.dtos.response.UserResponseDTO;
import com.lca.enums.Role;
import com.lca.service.UserService;
import com.lca.utils.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;


    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDTO> create(
            @Valid @RequestPart("data") UserCreateRequestDTO request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {

        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createByAdmin(request, avatar));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestPart("data") UserUpdateRequestDTO request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {

        return ResponseEntity.ok(userService.updateByAdmin(id, request, avatar));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponseDTO> updateStatus(@PathVariable Long id,@RequestParam Boolean isActive) {
        return ResponseEntity.ok(userService.updateStatus(id, isActive));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponseDTO> updateRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateRole(id, role));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id) {
        userService.resetPassword(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PaginationUtil.create(page, size);
        return ResponseEntity.ok(userService.search(keyword, role, isActive, pageable));
    }
}