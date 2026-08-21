package com.tasksync.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyCodeRequest(
        @NotBlank String email,
        @NotBlank String code
) {
}
