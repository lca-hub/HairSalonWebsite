package com.lca.configs;

import com.lca.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers(
                                "/api/**"
                        )
                )

                .userDetailsService(
                        userDetailsService
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/admin/login",
                                "/css/**",
                                "/js/**",
                                "/images/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/auth/**",
                                "/api/services/**",
                                "/api/stylists/**",
                                "/api/products/**"
                        ).permitAll()

                        .requestMatchers(
                                "/admin/**",
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/appointments/**"
                        ).permitAll()


                        .anyRequest().authenticated()
                )

                .formLogin(form -> form
                        .loginPage("/admin/login")
                        .loginProcessingUrl("/admin/login")

                        .usernameParameter("email")
                        .passwordParameter("password")

                        .defaultSuccessUrl(
                                "/admin/dashboard",
                                true
                        )

                        .failureUrl(
                                "/admin/login?error=true"
                        )

                        .permitAll()
                )

                .logout(logout -> logout
                        .logoutUrl("/admin/logout")
                        .logoutSuccessUrl(
                                "/admin/login?logout=true"
                        )
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )

                .httpBasic(httpBasic ->
                        httpBasic.disable()
                );

        return http.build();
    }
}