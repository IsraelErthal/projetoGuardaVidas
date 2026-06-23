package com.example.demo.service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String remetente;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void enviarEmail(String destinatario, String titulo, String descricao) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(remetente());
        helper.setTo(destinatario);
        helper.setSubject(titulo);
        helper.setText(descricao);

        mailSender.send(message);
    }

    public void enviarEmailFromTemplate(String destinatario, String titulo, String fileName)
            throws MessagingException, IOException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(remetente());
        helper.setTo(destinatario);
        helper.setSubject(titulo);

        ClassPathResource resource = new ClassPathResource("templates/email/" + fileName);

        String html = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

        helper.setText(html, true);

        mailSender.send(message);
    }

    public void enviarEmailPorTemplate(String destinatario, String titulo, String fileName)
            throws MessagingException, IOException {
        enviarEmailFromTemplate(destinatario, titulo, fileName);
    }

    private String remetente() {
        if (remetente != null && !remetente.isBlank()) {
            return remetente;
        }

        if (mailUsername != null && !mailUsername.isBlank()) {
            return mailUsername;
        }

        return "senai@participativo.com.br";
    }

}
