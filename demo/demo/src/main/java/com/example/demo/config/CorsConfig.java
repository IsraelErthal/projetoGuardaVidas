package com.example.demo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter(){
        CorsConfiguration config = new CorsConfiguration();

        // Permite credenciais
        config.setAllowCredentials(true);

        // Permite todos os origins
        config.setAllowedOriginPatterns(List.of("*"));

        // Permite todos os métodos HTTP
        config.setAllowedMethods(List.of("*"));

        // Permite todos os headers
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));

        // Cache da configuração CORS
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);        
    }

}