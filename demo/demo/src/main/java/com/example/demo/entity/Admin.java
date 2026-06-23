package com.example.demo.entity;

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
@Table(name = "admin")
@EqualsAndHashCode(callSuper = false)
public class Admin extends BaseEntity {

    @Column(nullable = false, length = 200, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(name = "nivel_acesso", nullable = false)
    private NivelAcesso nivelAcesso = NivelAcesso.ADMIN;
}   
