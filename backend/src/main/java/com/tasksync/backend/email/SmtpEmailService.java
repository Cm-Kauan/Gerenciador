package com.tasksync.backend.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Envia o codigo de verificacao por e-mail de verdade, via SMTP (Brevo em
 * producao). So e usado fora do perfil "dev" - veja ConsoleEmailService.
 */
@Service
@Profile("!dev")
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public SmtpEmailService(JavaMailSender mailSender, @Value("${app.mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Seu código de verificação TaskSync");
        message.setText(
                "Seu código de verificação é: " + code + "\n\n" +
                        "Ele expira em 15 minutos. Se você não pediu esse código, ignore este e-mail."
        );
        mailSender.send(message);
    }
}
