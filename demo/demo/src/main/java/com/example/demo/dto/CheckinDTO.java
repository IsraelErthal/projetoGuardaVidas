package com.example.demo.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckinDTO {

    @NotNull(message = "O id do posto é obrigatório")
    private Long postoId;

    @NotNull(message = "A foto é obrigatória")
    private MultipartFile foto;
}
