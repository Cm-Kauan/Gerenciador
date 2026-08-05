package com.tasksync.backend.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint protegido: só responde se a requisição vier com um JWT válido no
 * header Authorization. Serve para comprovar, na prática, que a autenticação
 * está funcionando de ponta a ponta.
 */
@RestController
public class MeController {

    @GetMapping("/api/me")
    public Map<String, String> me(Authentication authentication) {
        return Map.of("email", authentication.getName());
    }
}
