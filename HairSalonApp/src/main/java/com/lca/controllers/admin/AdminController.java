package com.lca.controllers.admin;

import com.lca.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/")
    public String home() {
        return "redirect:/admin/login";
    }

    @GetMapping("/login")
    public String loginPage() {

        return "admin/login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {

        String email = authentication.getName();

        String fullname = userRepository.findByEmail(email)
                .map(user -> user.getLastName() + " " + user.getFirstName()).orElse("Admin");

        model.addAttribute("fullname", fullname);

        return "admin/dashboard";
    }
}