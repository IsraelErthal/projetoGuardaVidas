package com.example.demo.entity;

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
@Table
@EqualsAndHashCode(callSuper = false)
public class Posto extends BaseEntity {


    @Column(nullable = false, length = 200, unique = true)
    private String nome;

    @Column(nullable = true, length = 250)
    private String descricao;
}
