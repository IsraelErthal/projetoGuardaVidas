package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "checkouts")
@EqualsAndHashCode(callSuper = false)
@Entity
public class Checkout extends BaseEntity {

    @ManyToOne
    private Posto posto;

    @ManyToOne
    private Bombeiro bombeiro;

    @ManyToOne
    private Arquivo foto;

    @Column(nullable = false)
    private int prevencoesMatutinas;

    @Column(nullable = false)
    private int prevencoesVespertinas;

    @Column(nullable = false)
    private int aguasVivasMatutinas;

    @Column(nullable = false)
    private int aguasVivasVespertinas;

    @Column
    private int prevencoesTotal;

    @Column
    private int aguasVivasTotal;
}
