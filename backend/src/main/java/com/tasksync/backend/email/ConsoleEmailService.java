package com.tasksync.backend.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Perfil dev: em vez de mandar e-mail de verdade (o que exigiria configurar
 * uma conta no Brevo so pra rodar localmente), so imprime o codigo no log.
 * Copie o codigo do console para testar a verificacao.
 */
@Service
@Profile("dev")
public class ConsoleEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(ConsoleEmailService.class);

    @Override
    public void sendVerificationCode(String toEmail, String code) {
        log.info("[DEV] Código de verificação para {}: {}", toEmail, code);
    }
}
