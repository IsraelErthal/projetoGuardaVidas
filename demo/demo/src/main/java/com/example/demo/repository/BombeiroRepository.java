package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Bombeiro;

@Repository
public interface BombeiroRepository extends BaseRepository<Bombeiro, Long> {

    @Query("SELECT b FROM Bombeiro b WHERE b.cpf = :cpf AND b.ativo = TRUE")
    Optional<Bombeiro> findByCpf(String cpf);

    @Query("SELECT b FROM Bombeiro b WHERE b.email = :email AND b.ativo = TRUE")
    Optional<Bombeiro> findByEmail(String email);

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);
}
