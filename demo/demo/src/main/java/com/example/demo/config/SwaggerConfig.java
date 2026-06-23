package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {

    // Bean é um pedaço de código que pode ser utilizado em qualquer lugar
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info().title("API guarda-vidas")
                .version("0.1")
                .description("Documentação da API do sistema de guarda-vidas BY ISRAEL V. ERTHAL"))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components().addSecuritySchemes("Bearer Authentication", createApiKey()));
    }

    private SecurityScheme createApiKey() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP).bearerFormat("JWT").scheme("Bearer");
    }
}
