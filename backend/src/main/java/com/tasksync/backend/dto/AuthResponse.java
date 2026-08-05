package com.tasksync.backend.dto;

public record AuthResponse(
        String token,
        String name,
        String email
) {
}
