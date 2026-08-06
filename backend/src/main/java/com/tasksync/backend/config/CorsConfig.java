package com.tasksync.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Libera o acesso da API para o frontend, que roda em outra origem (outra porta em
 * desenvolvimento, outro domínio em produção na Vercel/Netlify).
 *
 * Expomos um CorsConfigurationSource (em vez de só um WebMvcConfigurer) porque o
 * Spring Security intercepta as requisições antes do MVC: sem registrar o CORS
 * diretamente no SecurityConfig (via http.cors(...)), o preflight OPTIONS e as
 * respostas de algumas rotas podem ser bloqueados de forma inconsistente pelo
 * filtro de segurança, mesmo com a rota liberada em permitAll.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "https://*.vercel.app"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
