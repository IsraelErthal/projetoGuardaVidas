package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PostoStatusDTO {

    private Long          postoId;
    private String        postoNome;
    private String        descricao;

    // "CHECKIN" ou "CHECKOUT"
    private String        status;

    private LocalDateTime ultimoEventoEm;

    private String        fotoUrl;

    private Long          usuarioId;
    private String        usuarioNome;
    private String        usuarioCpf;

    private int           prevencoesMatutinas;
    private int           aguasVivasMatutinas;
    private int           prevencoesVespertinas;
    private int           aguasVivasVespertinas;
    private int           prevencoesTotal;
    private int           aguasVivasTotal;

    // true  → primeiro checkin do dia foi APÓS 7h → borda amarela no admin
    private boolean       checkinAtrasado;

    // quantos checkins foram feitos hoje neste posto (máx 2)
    private int           totalCheckinsHoje;
}
