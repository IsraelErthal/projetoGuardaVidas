package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrocarSenhaDTO {

    @Email
    @NotBlank(message = "O email deve ser preenchido")
    private String email;

    @NotBlank(message = "O código deve ser preenchido")
    @Size(min = 8, max = 8)
    private String codigo;

    @Size(min = 8, max = 18)
    @NotBlank(message = "A nova senha deve ser preenchida")
    private String novaSenha;
}
