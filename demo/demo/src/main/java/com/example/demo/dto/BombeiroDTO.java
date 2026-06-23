package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.example.demo.enums.NivelAcesso;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BombeiroDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank(message = "O nome deve ser preenchido")
    @Size(max = 200, message = "O nome não pode ter mais de 200 caracteres")
    private String nome;

    @Email
    private String email;

    @NotBlank(message = "O CPF deve ser preenchido")
    @Pattern(regexp = "\\d{11}", message = "O CPF deve conter exatamente 11 dígitos numéricos")
    private String cpf;

    // senha nunca é exposta na resposta — gerada automaticamente no service
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    private NivelAcesso nivelAcesso = NivelAcesso.PADRAO;
}
