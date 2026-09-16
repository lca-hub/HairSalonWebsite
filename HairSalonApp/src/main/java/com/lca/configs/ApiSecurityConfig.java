package com.lca.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lca.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@Order(1)
@RequiredArgsConstructor
public class ApiSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {

        http
                .securityMatcher("/api/**")

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/stylists/me/**").hasRole("STYLIST")
                        .requestMatchers(HttpMethod.GET, "/api/services/**", "/api/stylists/**", "/api/products/**").permitAll()
                        .requestMatchers("/api/admin/appointments/**", "/api/admin/invoices/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers("/api/admin/customers/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_RECEPTIONIST")
                        .requestMatchers(
                                "/api/admin/services/**",
                                "/api/admin/categories/**",
                                "/api/admin/stylists/**",
                                "/api/admin/schedules/**",
                                "/api/admin/products/**",
                                "/api/admin/suppliers/**",
                                "/api/admin/purchase-orders/**",
                                "/api/admin/attendance/**",
                                "/api/admin/reviews/**",
                                "/api/admin/statistics/**",
                                "/api/admin/dashboard",
                                "/api/admin/orders/**",
                                "/api/admin/payment-transactions/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/admin/users").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers("/api/admin/users/**").hasRole("ADMIN")
                        .requestMatchers(
                                "/api/cart/**",
                                "/api/customers/me/**",
                                "/api/appointments/**",
                                "/api/invoices/my",
                                "/api/invoices/*",
                                "/api/reviews/**",
                                "/api/orders/**"
                        ).hasRole("CUSTOMER")

                        .requestMatchers("/api/notifications/**").authenticated()

                        .requestMatchers(
                                "/api/payments/vnpay/return",
                                "/api/payments/vnpay/ipn"
                        ).permitAll()

                        .requestMatchers(
                                "/api/payments/**",
                                "/api/payment-transactions/**"
                        ).authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173", "https://hairsalon-0io0.onrender.com"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        config.setAllowedHeaders(List.of("*"));

        config.setExposedHeaders(List.of("Authorization"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public Cloudinary cloudinary() {

        return new Cloudinary(
                ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret,
                        "secure", true
                )
        );
    }
}