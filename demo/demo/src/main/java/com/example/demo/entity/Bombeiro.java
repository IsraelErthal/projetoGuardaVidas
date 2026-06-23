package com.example.demo.entity;

import java.time.LocalDateTime;

import com.example.demo.enums.NivelAcesso;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bombeiros")
@EqualsAndHashCode(callSuper = false)
public class Bombeiro extends BaseEntity {

    @Column(length = 200)
    private String nome;

    @Column
    private String email;

    @Column(nullable = false, length = 11, unique = true)
    private String cpf;

    @Column(nullable = false)
    private String senha;

    @Column(name = "nivel_acesso", nullable = false)
    private NivelAcesso nivelAcesso = NivelAcesso.PADRAO;

    private String codigoRecuperacao;

    private LocalDateTime codigoRecuperacaoExpiracao;
}