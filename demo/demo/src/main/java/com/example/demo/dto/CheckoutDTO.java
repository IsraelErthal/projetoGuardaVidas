package com.example.demo.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutDTO {

    @NotNull(message = "O id do posto é obrigatório")
    private Long postoId;

    @NotNull(message = "A foto é obrigatória")
    private MultipartFile foto;

    @NotNull(message = "Obrigatório")
    @Min(value = 0, message = "Não pode ser negativo")
    private Integer prevencoesMatutinas;

    @NotNull(message = "Obrigatório")
    @Min(value = 0, message = "Não pode ser negativo")
    private Integer aguasVivasMatutinas;

    @NotNull(message = "Obrigatório")
    @Min(value = 0, message = "Não pode ser negativo")
    private Integer prevencoesVespertinas;

    @NotNull(message = "Obrigatório")
    @Min(value = 0, message = "Não pode ser negativo")
    private Integer aguasVivasVespertinas;
}
