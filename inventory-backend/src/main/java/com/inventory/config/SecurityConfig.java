package com.inventory.config;

import com.inventory.security.JwtAccessDeniedHandler;
import com.inventory.security.JwtAuthenticationEntryPoint;
import com.inventory.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationEntryPoint authenticationEntryPoint,
                          JwtAccessDeniedHandler accessDeniedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public Endpoints
                        .requestMatchers("/auth/login", "/auth/register", "/health", "/error").permitAll()

                        // Products Endpoints
                        .requestMatchers(HttpMethod.GET, "/products", "/products/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/products", "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/products", "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/products", "/products/**").hasRole("ADMIN")

                        // Categories Endpoints
                        .requestMatchers(HttpMethod.GET, "/categories", "/categories/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/categories", "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/categories", "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/categories", "/categories/**").hasRole("ADMIN")

                        // Suppliers Endpoints
                        .requestMatchers(HttpMethod.GET, "/suppliers", "/suppliers/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/suppliers", "/suppliers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/suppliers", "/suppliers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/suppliers", "/suppliers/**").hasRole("ADMIN")

                        // Stock Operations
                        .requestMatchers("/transactions", "/transactions/**").hasAnyRole("ADMIN", "STAFF")

                        // Dashboard & Reports
                        .requestMatchers("/dashboard", "/dashboard/**", "/reports", "/reports/**").hasAnyRole("ADMIN", "STAFF")

                        // Admin-Only User Management
                        .requestMatchers("/users/**").hasRole("ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        if ("*".equals(allowedOrigins.trim())) {
            configuration.setAllowedOriginPatterns(List.of("*"));
        } else {
            configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        }
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
