package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Checkin;

@Repository
public interface CheckinRepository extends JpaRepository<Checkin, Long> {

    // último checkin do posto (independente do dia)
    Optional<Checkin> findTopByPostoIdOrderByCreatedAtDesc(Long postoId);

    @Query("""
        SELECT c FROM Checkin c
        WHERE c.bombeiro.cpf = :cpf
          AND c.ativo = TRUE
        ORDER BY c.createdAt DESC
    """)
    Optional<Checkin> findTopByBombeiroCpfOrderByCreatedAtDesc(@Param("cpf") String cpf);

    // quantidade de checkins do posto em um intervalo (usado para limitar 2/dia)
    @Query("""
        SELECT COUNT(c) FROM Checkin c
        WHERE c.posto.id = :postoId
          AND c.createdAt >= :inicio
          AND c.createdAt  < :fim
          AND c.ativo = TRUE
    """)
    long countByPostoIdAndDia(
        @Param("postoId") Long postoId,
        @Param("inicio")  LocalDateTime inicio,
        @Param("fim")     LocalDateTime fim
    );

    // checkins do posto em um intervalo (para dashboard admin)
    @Query("""
        SELECT c FROM Checkin c
        WHERE c.posto.id = :postoId
          AND c.createdAt >= :inicio
          AND c.createdAt  < :fim
          AND c.ativo = TRUE
        ORDER BY c.createdAt DESC
    """)
    List<Checkin> findByPostoIdAndDia(
        @Param("postoId") Long postoId,
        @Param("inicio")  LocalDateTime inicio,
        @Param("fim")     LocalDateTime fim
    );

    // todos os checkins de hoje (para listagem admin de todos os postos)
    @Query("""
        SELECT c FROM Checkin c
        WHERE c.createdAt >= :inicio
          AND c.createdAt  < :fim
          AND c.ativo = TRUE
        ORDER BY c.createdAt DESC
    """)
    List<Checkin> findAllByDia(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim")    LocalDateTime fim
    );
}
