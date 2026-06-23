package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.BombeiroDTO;
import com.example.demo.entity.Bombeiro;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.BombeiroRepository;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class BombeiroServiceTest {

    @Mock
    private BombeiroRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private BombeiroService service;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Deve criar bombeiro com sucesso")
    void criarBombeiroComSucesso() {

        BombeiroDTO dto = new BombeiroDTO();

        dto.setNome("Israel");
        dto.setCpf("12345678900");
        dto.setNivelAcesso(NivelAcesso.PADRAO);

        when(repository.existsByCpf(dto.getCpf()))
                .thenReturn(false);

        when(passwordEncoder.encode("12345"))
                .thenReturn("senhaCriptografada");

        Bombeiro bombeiroSalvo = new Bombeiro();

        bombeiroSalvo.setId(1L);
        bombeiroSalvo.setNome(dto.getNome());
        bombeiroSalvo.setCpf(dto.getCpf());
        bombeiroSalvo.setNivelAcesso(dto.getNivelAcesso());
        bombeiroSalvo.setSenha("senhaCriptografada");

        when(repository.save(any(Bombeiro.class)))
                .thenReturn(bombeiroSalvo);

        BombeiroDTO response = service.create(dto);

        assertEquals("Israel", response.getNome());
        assertEquals("12345678900", response.getCpf());
    }

    @Test
    @DisplayName("Não deve permitir CPF duplicado")
    void naoPermitirCpfDuplicado() {

        BombeiroDTO dto = new BombeiroDTO();

        dto.setNome("Carlos");
        dto.setCpf("99999999999");

        when(repository.existsByCpf(dto.getCpf()))
                .thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.create(dto)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    @DisplayName("Deve atualizar bombeiro mantendo senha")
    void atualizarMantendoSenha() {

        BombeiroDTO dto = new BombeiroDTO();

        dto.setNome("João");
        dto.setCpf("12345678900");
        dto.setNivelAcesso(NivelAcesso.PADRAO);

        Bombeiro bombeiroAtual = new Bombeiro();

        bombeiroAtual.setId(1L);
        bombeiroAtual.setNome("João antigo");
        bombeiroAtual.setCpf("12345678900");
        bombeiroAtual.setSenha("senhaAtual");

        when(repository.findById(1L))
                .thenReturn(Optional.of(bombeiroAtual));

        Bombeiro bombeiroSalvo = new Bombeiro();

        bombeiroSalvo.setId(1L);
        bombeiroSalvo.setNome(dto.getNome());
        bombeiroSalvo.setCpf(dto.getCpf());
        bombeiroSalvo.setSenha("senhaAtual");

        when(repository.save(any(Bombeiro.class)))
                .thenReturn(bombeiroSalvo);

        BombeiroDTO response = service.update(1L, dto);

        assertEquals("João", response.getNome());
        assertEquals("12345678900", response.getCpf());
    }

    @Test
    @DisplayName("Deve regenerar senha quando CPF mudar")
    void regenerarSenhaQuandoCpfMudar() {

        BombeiroDTO dto = new BombeiroDTO();

        dto.setNome("Pedro");
        dto.setCpf("55555444444");
        dto.setNivelAcesso(NivelAcesso.PADRAO);

        Bombeiro bombeiroAtual = new Bombeiro();

        bombeiroAtual.setId(1L);
        bombeiroAtual.setCpf("11111222222");
        bombeiroAtual.setSenha("senhaAntiga");

        when(repository.findById(1L))
                .thenReturn(Optional.of(bombeiroAtual));

        when(repository.existsByCpf(dto.getCpf()))
                .thenReturn(false);

        when(passwordEncoder.encode("55555"))
                .thenReturn("novaSenha");

        Bombeiro bombeiroSalvo = new Bombeiro();

        bombeiroSalvo.setId(1L);
        bombeiroSalvo.setNome(dto.getNome());
        bombeiroSalvo.setCpf(dto.getCpf());
        bombeiroSalvo.setSenha("novaSenha");

        when(repository.save(any(Bombeiro.class)))
                .thenReturn(bombeiroSalvo);

        BombeiroDTO response = service.update(1L, dto);

        assertEquals("Pedro", response.getNome());
        assertEquals("55555444444", response.getCpf());
    }

    @Test
    @DisplayName("Deve lançar erro ao atualizar bombeiro inexistente")
    void atualizarBombeiroInexistente() {

        BombeiroDTO dto = new BombeiroDTO();

        dto.setNome("Inexistente");
        dto.setCpf("00000000000");

        when(repository.findById(1L))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.update(1L, dto)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    @DisplayName("Não deve atualizar para CPF já existente")
    void naoAtualizarCpfDuplicado() {

        BombeiroDTO dto = new BombeiroDTO();

        dto.setNome("Novo");
        dto.setCpf("99999999999");

        Bombeiro bombeiroAtual = new Bombeiro();

        bombeiroAtual.setId(1L);
        bombeiroAtual.setCpf("11111111111");

        when(repository.findById(1L))
                .thenReturn(Optional.of(bombeiroAtual));

        when(repository.existsByCpf(dto.getCpf()))
                .thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.update(1L, dto)
        );

        assertTrue(exception.getStatusCode().equals(HttpStatus.CONFLICT));
    }
}