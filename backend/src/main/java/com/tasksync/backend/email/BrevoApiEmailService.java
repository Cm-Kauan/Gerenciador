package com.tasksync.backend.email;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Envia o codigo de verificacao por e-mail via API HTTP da Brevo (porta 443).
 * Necessario porque o Railway bloqueia as portas de SMTP (25/465/587) por
 * padrao, o que impede o envio via JavaMailSender. So e usado fora do
 * perfil "dev" - veja ConsoleEmailService.
 */
@Service
@Profile("!dev")
public class BrevoApiEmailService implements EmailService {

    private static final URI BREVO_ENDPOINT = URI.create("https://api.brevo.com/v3/smtp/email");

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiKey;
    private final String fromEmail;

    public BrevoApiEmailService(
            @Value("${app.brevo.api-key}") String apiKey,
            @Value("${app.mail.from}") String fromEmail
    ) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendVerificationCode(String toEmail, String code) {
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", "TaskSync", "email", fromEmail),
                "to", List.of(Map.of("email", toEmail)),
                "subject", "Seu código de verificação TaskSync",
                "htmlContent", "<p>Seu código de verificação é: <strong>" + code + "</strong></p>"
                        + "<p>Ele expira em 15 minutos. Se você não pediu esse código, ignore este e-mail.</p>"
        );

        try {
            String json = objectMapper.writeValueAsString(body);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(BREVO_ENDPOINT)
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "Falha ao enviar e-mail via Brevo: " + response.statusCode() + " - " + response.body());
            }
        } catch (IOException e) {
            throw new IllegalStateException("Erro ao enviar e-mail de verificação", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Erro ao enviar e-mail de verificação", e);
        }
    }
}
