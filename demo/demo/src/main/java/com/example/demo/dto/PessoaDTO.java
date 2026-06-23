package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PessoaDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank(message = "O campo deve ser preenchido")
    @Size(message = "O campo n pode ter mais de 200 caracteres")
    private String nome;    

    @Email(message = "O email deve ser preenchido")
    @Size(message = "O campo n pode ter mais de 200 caracteres")
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    // Depedendo do contexto pode-se colocar o nivel de acesso (Pra definir o nivel de acesso na tela de cadastro)
}
