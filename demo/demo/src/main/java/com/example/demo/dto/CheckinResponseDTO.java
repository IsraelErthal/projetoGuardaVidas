package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CheckinResponseDTO {


    // Response não precisa de validações (Por que só vai voltar pro usuário e não entrar no sistema)
    private String posto;


    private LocalDateTime horario;
}
