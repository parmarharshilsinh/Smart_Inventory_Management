package com.inventory.service;

import com.inventory.dto.auth.LoginRequest;
import com.inventory.dto.auth.LoginResponse;
import com.inventory.dto.auth.RegisterRequest;
import com.inventory.dto.auth.UserResponse;
import com.inventory.entity.User;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.UserMapper;
import com.inventory.repository.UserRepository;
import com.inventory.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .or(() -> userRepository.findByUsername(request.getEmail().trim()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String jwt = tokenProvider.generateToken(authentication, user.getId(), user.getEmail());

        return new LoginResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                List.of(user.getRole().name())
        );
    }

    @Transactional
    public UserResponse register(RegisterRequest request, boolean isCallerAdmin) {
        String cleanUsername = request.getUsername().trim();
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(cleanUsername)) {
            throw new DuplicateResourceException("Username '" + cleanUsername + "' is already taken.");
        }

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new DuplicateResourceException("Email '" + cleanEmail + "' is already registered.");
        }

        User.Role assignedRole = User.Role.ROLE_STAFF;
        if (request.getRole() != null) {
            String roleUpper = request.getRole().toUpperCase().trim();
            if (roleUpper.contains("ADMIN")) {
                // Only existing authorized admins may create or promote an admin account
                if (isCallerAdmin) {
                    assignedRole = User.Role.ROLE_ADMIN;
                } else {
                    assignedRole = User.Role.ROLE_STAFF; // Ignore requested promotion from non-admin
                }
            }
        }

        User user = new User(
                cleanUsername,
                cleanEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                assignedRole
        );

        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String usernameOrEmail) {
        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse toggleUserStatus(Long userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setActive(isActive);
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }
}
