
package com.paysphere.backend.security.service;

import com.paysphere.backend.security.dto.LoginRequest;
import com.paysphere.backend.security.dto.LoginResponse;
import com.paysphere.backend.security.entity.AppUser;
import com.paysphere.backend.security.repository.AppUserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            AppUserRepository appUserRepository,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.appUserRepository = appUserRepository;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        AppUser appUser = appUserRepository
                .findByUsername(request.username())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        String token = jwtService.generateToken(appUser.getUsername());

        return new LoginResponse(
                token,
                "Bearer",
                appUser.getUsername(),
                appUser.getRole().name(),
                3600
        );
    }
}
