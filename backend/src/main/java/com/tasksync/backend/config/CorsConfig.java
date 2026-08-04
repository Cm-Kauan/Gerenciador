package com.tasksync.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Libera o acesso da API para o frontend, que roda em outra origem (outra porta em
 * desenvolvimento, outro domínio em produção na Vercel/Netlify).
 * Atualize allowedOriginPatterns com a URL da Vercel assim que ela existir.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://*.vercel.app"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
