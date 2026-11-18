package com.paysphere.backend.security.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        String username,
        String role,
        long expiresIn
) {}