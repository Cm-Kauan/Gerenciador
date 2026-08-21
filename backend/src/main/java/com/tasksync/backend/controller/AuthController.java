package com.tasksync.backend.controller;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tasksync.backend.dto.AuthResponse;
import com.tasksync.backend.dto.LoginRequest;
import com.tasksync.backend.dto.RegisterRequest;
import com.tasksync.backend.dto.SendVerificationCodeRequest;
import com.tasksync.backend.dto.VerifyCodeRequest;
import com.tasksync.backend.email.EmailService;
import com.tasksync.backend.model.User;
import com.tasksync.backend.repository.UserRepository;
import com.tasksync.backend.security.CustomUserDetailsService;
import com.tasksync.backend.security.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int CODE_VALIDITY_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body("Já existe uma conta com este e-mail.");
        }

        User user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.phone()
        );
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Cadastro criado. Escolha como deseja verificar sua conta.",
                "email", user.getEmail()
        ));
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@Valid @RequestBody SendVerificationCodeRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Usuário não encontrado.");
        }
        if (user.isVerified()) {
            return ResponseEntity.badRequest().body("Esta conta já está verificada.");
        }

        if ("sms".equals(request.method())) {
            // TODO: verificacao por SMS ainda nao esta disponivel - exige um
            // servico pago (ex.: Twilio). Por enquanto, so e-mail funciona.
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body("Verificação por SMS ainda não está disponível. Use o e-mail por enquanto.");
        }

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        user.setVerificationCode(code);
        user.setVerificationCodeExpiresAt(Instant.now().plusSeconds(CODE_VALIDITY_MINUTES * 60L));
        user.setVerificationMethod(request.method());
        userRepository.save(user);

        emailService.sendVerificationCode(user.getEmail(), code);

        return ResponseEntity.ok(Map.of("message", "Código enviado para o e-mail informado."));
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Usuário não encontrado.");
        }
        if (user.isVerified()) {
            return ResponseEntity.badRequest().body("Esta conta já está verificada.");
        }
        if (user.getVerificationCode() == null
                || !user.getVerificationCode().equals(request.code())
                || user.getVerificationCodeExpiresAt() == null
                || user.getVerificationCodeExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Código inválido ou expirado.");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail ou senha inválidos.");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow();

        if (!user.isVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Conta ainda não verificada. Verifique seu e-mail antes de entrar.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail()));
    }
}
