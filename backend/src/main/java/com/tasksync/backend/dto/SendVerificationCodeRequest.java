package com.tasksync.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SendVerificationCodeRequest(
        @NotBlank String email,
        @NotBlank @Pattern(regexp = "email|sms", message = "method deve ser 'email' ou 'sms'") String method
) {
}
