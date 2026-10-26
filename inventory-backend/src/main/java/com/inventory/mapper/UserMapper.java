package com.inventory.mapper;

import com.inventory.dto.auth.UserResponse;
import com.inventory.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
