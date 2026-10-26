package com.inventory.controller;

import com.inventory.dto.auth.LoginRequest;
import com.inventory.dto.auth.LoginResponse;
import com.inventory.dto.auth.RegisterRequest;
import com.inventory.dto.auth.UserResponse;
import com.inventory.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request,
            Authentication authentication
    ) {
        boolean isCallerAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        UserResponse response = authService.register(request, isCallerAdmin);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/auth/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserResponse response = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body
    ) {
        boolean isActive = body.getOrDefault("isActive", true);
        return ResponseEntity.ok(authService.toggleUserStatus(id, isActive));
    }
}
