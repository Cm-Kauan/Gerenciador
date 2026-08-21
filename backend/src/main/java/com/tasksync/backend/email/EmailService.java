package com.tasksync.backend.email;

public interface EmailService {

    void sendVerificationCode(String toEmail, String code);
}
