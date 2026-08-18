package com.lca.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET = "HairSalonSecretKeyForJwt2026VeryLongKey";

    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 60;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Long userId, String email, String role) {
        return Jwts.builder().subject(String.valueOf(userId)).claim("email", email).claim("role", role).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(getKey()).compact();
    }

    public Long extractUserId(String token) {

        Claims claims = Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload();

        return Long.valueOf(claims.getSubject());
    }

    public String extractEmail(String token) {

        Claims claims = Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload();

        return claims.get("email", String.class);
    }
}