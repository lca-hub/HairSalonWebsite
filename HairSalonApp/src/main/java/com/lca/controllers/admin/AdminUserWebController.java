package com.lca.controllers.admin;

import com.lca.dtos.request.UserCreateRequestDTO;
import com.lca.dtos.request.UserUpdateRequestDTO;
import com.lca.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public String userList(Model model) {
        model.addAttribute("users", userService.getAll());
        model.addAttribute("createRequest", new UserCreateRequestDTO());
        return "admin/user-list";
    }

    @PostMapping("/create")
    public String create(@Valid @ModelAttribute("createRequest") UserCreateRequestDTO request, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("users", userService.getAll());
            model.addAttribute("errorMessage", bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return "admin/user-list";
        }

        try {
            userService.createByAdmin(request);
            return "redirect:/admin/users?success=created";

        } catch (RuntimeException e) {
            model.addAttribute("users", userService.getAll());
            model.addAttribute("errorMessage", e.getMessage());
            return "admin/user-list";
        }
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("users", userService.getAll());
        model.addAttribute("editingUser", userService.getById(id));
        model.addAttribute("createRequest", new UserCreateRequestDTO());
        model.addAttribute("updateRequest", new UserUpdateRequestDTO());

        return "admin/user-list";
    }

    @PostMapping("/edit/{id}")
    public String update(@PathVariable Long id, @Valid @ModelAttribute("updateRequest") UserUpdateRequestDTO request, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("users", userService.getAll());
            model.addAttribute("editingUser", userService.getById(id));
            model.addAttribute("errorMessage", bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return "admin/user-list";
        }

        try {
            userService.updateByAdmin(id, request);
            return "redirect:/admin/users?success=updated";

        } catch (RuntimeException e) {
            model.addAttribute("users", userService.getAll());
            model.addAttribute("editingUser", userService.getById(id));
            model.addAttribute("errorMessage", e.getMessage());
            return "admin/user-list";
        }
    }

    @PostMapping("/{id}/toggle-status")
    public String toggleStatus(@PathVariable Long id) {

        var user = userService.getById(id);

        userService.updateStatus(
                id,
                !Boolean.TRUE.equals(user.getIsActive())
        );

        return "redirect:/admin/users?success=status";
    }

    @PostMapping("/{id}/reset-password")
    public String resetPassword(@PathVariable Long id) {

        userService.resetPassword(id);

        return "redirect:/admin/users?success=reset";
    }
}
