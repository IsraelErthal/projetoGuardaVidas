package com.example.demo.entity;

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
@Table(name = "checkins")
@EqualsAndHashCode(callSuper = false)
@Entity
public class Checkin extends BaseEntity {


    @ManyToOne
    private Posto posto;

    @ManyToOne
    private Bombeiro bombeiro;

    @ManyToOne
    private Arquivo foto;
}
