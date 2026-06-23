package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Checkout;

@Repository
public interface CheckoutRepository extends JpaRepository<Checkout, Long> {

    // último checkout do posto (independente do dia)
    Optional<Checkout> findTopByPostoIdOrderByCreatedAtDesc(Long postoId);

    // quantidade de checkouts do posto em um intervalo (limite 1/dia)
    @Query("""
        SELECT COUNT(c) FROM Checkout c
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

    // todos os checkouts de hoje (para dashboard admin)
    @Query("""
        SELECT c FROM Checkout c
        WHERE c.createdAt >= :inicio
          AND c.createdAt  < :fim
          AND c.ativo = TRUE
        ORDER BY c.createdAt DESC
    """)
    List<Checkout> findAllByDia(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim")    LocalDateTime fim
    );
}