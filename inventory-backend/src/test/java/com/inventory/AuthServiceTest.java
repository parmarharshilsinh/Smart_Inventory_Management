package com.inventory;

import com.inventory.dto.auth.LoginRequest;
import com.inventory.dto.auth.LoginResponse;
import com.inventory.dto.auth.RegisterRequest;
import com.inventory.dto.auth.UserResponse;
import com.inventory.entity.User;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.mapper.UserMapper;
import com.inventory.repository.UserRepository;
import com.inventory.security.JwtTokenProvider;
import com.inventory.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    private PasswordEncoder passwordEncoder;
    private UserMapper userMapper;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(12);
        userMapper = new UserMapper();
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, tokenProvider, userMapper);
    }

    @Test
    @DisplayName("Should successfully hash password and register user")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest("jdoe", "jdoe@inventory.local", "Password@123", "John Doe", "ROLE_STAFF");

        when(userRepository.existsByUsername("jdoe")).thenReturn(false);
        when(userRepository.existsByEmail("jdoe@inventory.local")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        UserResponse response = authService.register(req, false);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getUsername()).isEqualTo("jdoe");
        assertThat(response.getRole()).isEqualTo("ROLE_STAFF");

        verify(userRepository).save(argThat(user -> {
            assertThat(user.getPasswordHash()).isNotEqualTo("Password@123");
            assertThat(passwordEncoder.matches("Password@123", user.getPasswordHash())).isTrue();
            return true;
        }));
    }

    @Test
    @DisplayName("Should reject registration with duplicate username")
    void testRegisterDuplicateUsername() {
        RegisterRequest req = new RegisterRequest("existing", "new@inventory.local", "Password@123", "User", "ROLE_STAFF");
        when(userRepository.existsByUsername("existing")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req, false))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    @DisplayName("Should prevent non-admin caller from promoting self to ROLE_ADMIN")
    void testRegisterPreventUnauthorizedAdminPromotion() {
        RegisterRequest req = new RegisterRequest("sneaky", "sneaky@inventory.local", "Pass@123", "Sneaky User", "ROLE_ADMIN");

        when(userRepository.existsByUsername("sneaky")).thenReturn(false);
        when(userRepository.existsByEmail("sneaky@inventory.local")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = authService.register(req, false); // isCallerAdmin = false

        // Must default to ROLE_STAFF
        assertThat(response.getRole()).isEqualTo("ROLE_STAFF");
    }

    @Test
    @DisplayName("Should allow existing admin to register another ADMIN")
    void testRegisterAdminByAdmin() {
        RegisterRequest req = new RegisterRequest("newadmin", "admin2@inventory.local", "Pass@123", "Second Admin", "ROLE_ADMIN");

        when(userRepository.existsByUsername("newadmin")).thenReturn(false);
        when(userRepository.existsByEmail("admin2@inventory.local")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = authService.register(req, true); // isCallerAdmin = true

        assertThat(response.getRole()).isEqualTo("ROLE_ADMIN");
    }

    @Test
    @DisplayName("Should authenticate and return JWT token on valid login")
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest("admin@inventory.local", "Password@123");
        User user = new User("admin", "admin@inventory.local", "hashedPass", "Admin User", User.Role.ROLE_ADMIN);
        user.setId(1L);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail("admin@inventory.local")).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(any(), eq(1L), eq("admin@inventory.local"))).thenReturn("sample.jwt.token");

        LoginResponse res = authService.login(req);

        assertThat(res.getToken()).isEqualTo("sample.jwt.token");
        assertThat(res.getUsername()).isEqualTo("admin");
        assertThat(res.getRoles()).contains("ROLE_ADMIN");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid login")
    void testLoginBadCredentials() {
        LoginRequest req = new LoginRequest("admin@inventory.local", "WrongPassword");
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }
}
