package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostoDTO {


    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank(message = "O campo deve ser preenchido")
    @Size(message = "O campo n pode ter mais de 200 caracteres")
    private String nome;    

    @Size(message = "O campo n pode ter mais de 250 caracteres")
    private String descricao;
}
