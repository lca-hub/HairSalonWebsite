package com.lca.controllers.admin;

import com.lca.dtos.request.UserCreateRequestDTO;
import com.lca.dtos.request.UserUpdateRequestDTO;
import com.lca.service.UserService;
import com.lca.utils.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserWebController {

    private final UserService userService;

    @GetMapping
    public String userList(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, Model model) {
        Pageable pageable = PaginationUtil.create(page, size);
        model.addAttribute("users", userService.findAll(pageable));
        model.addAttribute("createRequest", new UserCreateRequestDTO());
        return "admin/user-list";
    }

    @PostMapping("/create")
    public String create(@Valid @ModelAttribute("createRequest") UserCreateRequestDTO request, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            Pageable pageable = PaginationUtil.create(0, 10);
            model.addAttribute("users", userService.findAll(pageable));
            model.addAttribute("errorMessage", bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return "admin/user-list";
        }

        try {
            userService.createByAdmin(request);
            return "redirect:/admin/users?success=created";
        } catch (RuntimeException e) {
            Pageable pageable = PaginationUtil.create(0, 10);
            model.addAttribute("users", userService.findAll(pageable));
            model.addAttribute("errorMessage", e.getMessage());
            return "admin/user-list";
        }
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, Model model) {
        Pageable pageable = PaginationUtil.create(page, size);
        model.addAttribute("users", userService.findAll(pageable));
        model.addAttribute("editingUser", userService.getById(id));
        model.addAttribute("createRequest", new UserCreateRequestDTO());
        model.addAttribute("updateRequest", new UserUpdateRequestDTO());
        return "admin/user-list";
    }

    @PostMapping("/edit/{id}")
    public String update(@PathVariable Long id, @Valid @ModelAttribute("updateRequest") UserUpdateRequestDTO request, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            Pageable pageable = PaginationUtil.create(0, 10);
            model.addAttribute("users", userService.findAll(pageable));
            model.addAttribute("editingUser", userService.getById(id));
            model.addAttribute("errorMessage", bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return "admin/user-list";
        }

        try {
            userService.updateByAdmin(id, request);
            return "redirect:/admin/users?success=updated";
        } catch (RuntimeException e) {
            Pageable pageable = PaginationUtil.create(0, 10);
            model.addAttribute("users", userService.findAll(pageable));
            model.addAttribute("editingUser", userService.getById(id));
            model.addAttribute("errorMessage", e.getMessage());
            return "admin/user-list";
        }
    }

    @PostMapping("/{id}/toggle-status")
    public String toggleStatus(@PathVariable Long id) {
        var user = userService.getById(id);
        userService.updateStatus(id, !Boolean.TRUE.equals(user.getIsActive()));
        return "redirect:/admin/users?success=status";
    }

    @PostMapping("/{id}/reset-password")
    public String resetPassword(@PathVariable Long id) {
        userService.resetPassword(id);
        return "redirect:/admin/users?success=reset";
    }
}