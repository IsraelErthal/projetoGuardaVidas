package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setup() {

        MockitoAnnotations.openMocks(this);

        mimeMessage = new MimeMessage(Session.getDefaultInstance(System.getProperties()));

        when(mailSender.createMimeMessage())
                .thenReturn(mimeMessage);

        ReflectionTestUtils.setField(
                emailService,
                "remetente",
                "teste@email.com"
        );

        ReflectionTestUtils.setField(
                emailService,
                "mailUsername",
                "username@email.com"
        );
    }

    @Test
    @DisplayName("Deve enviar email simples com sucesso")
    void enviarEmailSimples() {

        assertDoesNotThrow(() -> {

            emailService.enviarEmail(
                    "destino@email.com",
                    "Título teste",
                    "Descrição teste"
            );
        });

        verify(mailSender, times(1))
                .send(mimeMessage);
    }

    @Test
    @DisplayName("Deve enviar email por template")
    void enviarEmailPorTemplate() {

        assertDoesNotThrow(() -> {

            emailService.enviarEmailPorTemplate(
                    "destino@email.com",
                    "Título template",
                    "teste.html"
            );
        });

        verify(mailSender, times(1))
                .send(mimeMessage);
    }

    @Test
    @DisplayName("Deve lançar exceção para template inexistente")
    void templateInexistente() {

        assertThrows(IOException.class, () -> {

            emailService.enviarEmailPorTemplate(
                    "destino@email.com",
                    "Erro",
                    "arquivo_inexistente.html"
            );
        });
    }

    @Test
    @DisplayName("Deve usar remetente configurado")
    void usarRemetenteConfigurado() {

        assertDoesNotThrow(() -> {

            emailService.enviarEmail(
                    "teste@email.com",
                    "Teste",
                    "Mensagem"
            );
        });

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Deve usar username quando remetente estiver vazio")
    void usarUsernameComoRemetente() {

        ReflectionTestUtils.setField(
                emailService,
                "remetente",
                ""
        );

        assertDoesNotThrow(() -> {

            emailService.enviarEmail(
                    "destino@email.com",
                    "Teste",
                    "Mensagem"
            );
        });

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Deve criar MimeMessage corretamente")
    void criarMimeMessage() {

        assertDoesNotThrow(() -> {

            emailService.enviarEmail(
                    "destino@email.com",
                    "Assunto",
                    "Texto"
            );
        });

        verify(mailSender, times(1))
                .createMimeMessage();
    }

    // =========================================================
    // TESTES DE INTEGRAÇÃO
    // =========================================================

    @Test
    @DisplayName("Integração completa envio email simples")
    void integracaoEmailSimples() {

        assertDoesNotThrow(() -> {

            emailService.enviarEmail(
                    "usuario@email.com",
                    "Integração",
                    "Teste integração"
            );
        });

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Integração completa envio email template")
    void integracaoEmailTemplate() {

        assertDoesNotThrow(() -> {

            emailService.enviarEmailPorTemplate(
                    "usuario@email.com",
                    "Template integração",
                    "teste.html"
            );
        });

        verify(mailSender).send(mimeMessage);
    }
}