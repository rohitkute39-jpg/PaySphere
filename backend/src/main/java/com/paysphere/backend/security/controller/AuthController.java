
package com.paysphere.backend.security.controller;

import com.paysphere.backend.security.dto.LoginRequest;
import com.paysphere.backend.security.dto.LoginResponse;
import com.paysphere.backend.security.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
