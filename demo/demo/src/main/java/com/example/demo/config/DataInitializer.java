package com.example.demo.config;

import org.hibernate.validator.constraints.br.CPF;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.entity.Bombeiro;
import com.example.demo.entity.Posto;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.BombeiroRepository;
import com.example.demo.repository.PostoRepository;

@Configuration
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initDataBase(BombeiroRepository repository, PostoRepository repository2) {

        return args -> {
            criarOuAtualizarUsuario(repository, "12102759962", NivelAcesso.ADMIN);

            if (repository2.count() <= 0) {
                Posto posto= new Posto();

                posto.setNome("posto 1");
                posto.setDescricao("posto 1");

                repository2.save(posto);
                

                System.out.println("Posto criado com sucesso");
            } else {
                System.out.println("Posto já existe");
            }

        };

    }

    private void criarOuAtualizarUsuario(BombeiroRepository repository, String cpf, NivelAcesso nivelAcesso) {
        Bombeiro bombeiro = repository.findByCpf(cpf).orElseGet(Bombeiro::new);
        String senhaInicial = cpf.substring(0, 5);

        bombeiro.setNome("Administrador");
        bombeiro.setCpf(cpf);
        bombeiro.setNivelAcesso(nivelAcesso);

        if (bombeiro.getSenha() == null || !passwordEncoder.matches(senhaInicial, bombeiro.getSenha())) {
            bombeiro.setSenha(passwordEncoder.encode(senhaInicial));
        }

        repository.save(bombeiro);
    }
}
