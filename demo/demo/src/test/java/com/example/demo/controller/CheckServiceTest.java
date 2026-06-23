package com.example.demo.controller;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.dto.PostoStatusDTO;
import com.example.demo.entity.Arquivo;
import com.example.demo.entity.Bombeiro;
import com.example.demo.entity.Checkin;
import com.example.demo.entity.Checkout;
import com.example.demo.entity.Posto;
import com.example.demo.repository.BombeiroRepository;
import com.example.demo.repository.CheckinRepository;
import com.example.demo.repository.CheckoutRepository;
import com.example.demo.repository.PostoRepository;
import com.example.demo.service.ArquivoService;
import com.example.demo.service.CheckService;

public class CheckServiceTest {

    @Mock
    private ArquivoService arquivoService;

    @Mock
    private PostoRepository postoRepository;

    @Mock
    private BombeiroRepository bombeiroRepository;

    @Mock
    private CheckinRepository checkinRepository;

    @Mock
    private CheckoutRepository checkoutRepository;

    @InjectMocks
    private CheckService checkService;

    private Posto posto;
    private Bombeiro bombeiro;
    private static final String CPF_USUARIO = "12345678900";

    @BeforeEach
    void setup() {

        MockitoAnnotations.openMocks(this);

        posto = new Posto();
        posto.setId(1L);
        posto.setNome("Posto Central");
        posto.setDescricao("Descrição");

        bombeiro = new Bombeiro();
        bombeiro.setId(1L);
        bombeiro.setNome("Bombeiro Teste");
        bombeiro.setCpf(CPF_USUARIO);
    }

    // =========================================================
    // TESTES UNITÁRIOS
    // =========================================================

    @Test
    @DisplayName("Deve realizar checkin com sucesso")
    void checkinComSucesso() {

        CheckinDTO dto = new CheckinDTO();

        dto.setPostoId(1L);

        dto.setFoto(new MockMultipartFile(
                "foto",
                "foto.jpg",
                "image/jpeg",
                "teste".getBytes()
        ));

        Arquivo arquivo = new Arquivo();

        Checkin checkin = new Checkin();
        checkin.setCreatedAt(LocalDateTime.now());

        when(postoRepository.findById(1L))
                .thenReturn(Optional.of(posto));

        when(bombeiroRepository.findByCpf(CPF_USUARIO))
                .thenReturn(Optional.of(bombeiro));

        when(checkinRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(0L);

        when(checkoutRepository.findTopByPostoIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.empty());

        when(arquivoService.upload(any()))
                .thenReturn(arquivo);

        when(checkinRepository.save(any(Checkin.class)))
                .thenReturn(checkin);

        CheckinResponseDTO response = checkService.checkin(dto, CPF_USUARIO);

        assertEquals("Posto Central", response.getPosto());
    }

    @Test
    @DisplayName("Não deve permitir mais de 2 checkins")
    void naoPermitirMaisDe2Checkins() {

        CheckinDTO dto = new CheckinDTO();
        dto.setPostoId(1L);

        when(postoRepository.findById(1L))
                .thenReturn(Optional.of(posto));

        when(bombeiroRepository.findByCpf(CPF_USUARIO))
                .thenReturn(Optional.of(bombeiro));

        when(checkinRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(2L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> checkService.checkin(dto, CPF_USUARIO)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    @DisplayName("Deve realizar checkout com sucesso")
    void checkoutComSucesso() {

        CheckoutDTO dto = new CheckoutDTO();

        dto.setPostoId(1L);
        dto.setPrevencoesMatutinas(5);
        dto.setPrevencoesVespertinas(3);
        dto.setAguasVivasMatutinas(2);
        dto.setAguasVivasVespertinas(1);

        dto.setFoto(new MockMultipartFile(
                "foto",
                "foto.jpg",
                "image/jpeg",
                "teste".getBytes()
        ));

        Arquivo arquivo = new Arquivo();

        Checkout checkout = new Checkout();

        checkout.setCreatedAt(LocalDateTime.now());
        checkout.setPrevencoesTotal(8);
        checkout.setAguasVivasTotal(3);

        when(postoRepository.findById(1L))
                .thenReturn(Optional.of(posto));

        when(bombeiroRepository.findByCpf(CPF_USUARIO))
                .thenReturn(Optional.of(bombeiro));

        Checkin checkinAnterior = new Checkin();
        checkinAnterior.setPosto(posto);

        when(checkinRepository.findTopByBombeiroCpfOrderByCreatedAtDesc(CPF_USUARIO))
                .thenReturn(Optional.of(checkinAnterior));

        when(checkinRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(1L);

        when(checkoutRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(0L);

        when(arquivoService.upload(any()))
                .thenReturn(arquivo);

        when(checkoutRepository.save(any(Checkout.class)))
                .thenReturn(checkout);

        CheckoutResponseDTO response = checkService.checkout(dto, CPF_USUARIO);

        assertEquals(8, response.getPrevencoesTotal());
        assertEquals(3, response.getAguasVivasTotal());
    }

    @Test
    @DisplayName("Não deve permitir mais de 1 checkout")
    void naoPermitirMaisDe1Checkout() {

        CheckoutDTO dto = new CheckoutDTO();
        dto.setPostoId(1L);

        when(postoRepository.findById(1L))
                .thenReturn(Optional.of(posto));

        when(bombeiroRepository.findByCpf(CPF_USUARIO))
                .thenReturn(Optional.of(bombeiro));

        Checkin checkinAnterior = new Checkin();
        checkinAnterior.setPosto(posto);

        when(checkinRepository.findTopByBombeiroCpfOrderByCreatedAtDesc(CPF_USUARIO))
                .thenReturn(Optional.of(checkinAnterior));

        when(checkinRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(1L);

        when(checkoutRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(1L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> checkService.checkout(dto, CPF_USUARIO)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    @DisplayName("Deve permitir checkout quando outro guarda vidas fez checkin no posto")
    void checkoutSemCheckinProprioComCheckinNoPosto() {

        CheckoutDTO dto = new CheckoutDTO();

        dto.setPostoId(1L);
        dto.setPrevencoesMatutinas(1);
        dto.setPrevencoesVespertinas(1);
        dto.setAguasVivasMatutinas(0);
        dto.setAguasVivasVespertinas(0);

        dto.setFoto(new MockMultipartFile(
                "foto",
                "foto.jpg",
                "image/jpeg",
                "teste".getBytes()
        ));

        Checkout checkout = new Checkout();
        checkout.setCreatedAt(LocalDateTime.now());
        checkout.setPrevencoesTotal(2);
        checkout.setAguasVivasTotal(0);

        when(postoRepository.findById(1L))
                .thenReturn(Optional.of(posto));

        when(bombeiroRepository.findByCpf(CPF_USUARIO))
                .thenReturn(Optional.of(bombeiro));

        when(checkinRepository.findTopByBombeiroCpfOrderByCreatedAtDesc(CPF_USUARIO))
                .thenReturn(Optional.empty());

        when(checkinRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(1L);

        when(checkoutRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(0L);

        when(arquivoService.upload(any()))
                .thenReturn(new Arquivo());

        when(checkoutRepository.save(any(Checkout.class)))
                .thenReturn(checkout);

        CheckoutResponseDTO response = checkService.checkout(dto, CPF_USUARIO);

        assertEquals(2, response.getPrevencoesTotal());
    }

    @Test
    @DisplayName("Deve retornar status dos postos")
    void statusPostos() {

        Checkin checkin = new Checkin();

        checkin.setPosto(posto);
        checkin.setCreatedAt(LocalDateTime.now());

        when(checkinRepository.findAllByDia(any(), any()))
                .thenReturn(List.of(checkin));

        when(checkoutRepository.findAllByDia(any(), any()))
                .thenReturn(List.of());

        when(postoRepository.findById(1L))
                .thenReturn(Optional.of(posto));

        when(bombeiroRepository.findByCpf(CPF_USUARIO))
                .thenReturn(Optional.of(bombeiro));

        List<PostoStatusDTO> response = checkService.statusPostos();

        assertFalse(response.isEmpty());

        assertEquals("Posto Central", response.get(0).getPostoNome());

        assertTrue(response.get(0).getStatus().equals("CHECKIN"));
    }

    @Test
    @DisplayName("Integração completa checkin")
    void integracaoCheckin() {

        CheckinDTO dto = new CheckinDTO();

        dto.setPostoId(1L);

        dto.setFoto(new MockMultipartFile(
                "foto",
                "foto.jpg",
                "image/jpeg",
                "imagem".getBytes()
        ));

        Arquivo arquivo = new Arquivo();

        Checkin checkin = new Checkin();

        checkin.setCreatedAt(LocalDateTime.now());

        when(postoRepository.findById(1L))
                .thenReturn(Optional.of(posto));

        when(bombeiroRepository.findByCpf(CPF_USUARIO))
                .thenReturn(Optional.of(bombeiro));

        when(checkinRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(0L);

        when(checkoutRepository.findTopByPostoIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.empty());

        when(arquivoService.upload(any()))
                .thenReturn(arquivo);

        when(checkinRepository.save(any(Checkin.class)))
                .thenReturn(checkin);

        CheckinResponseDTO response = checkService.checkin(dto, CPF_USUARIO);

        assertEquals("Posto Central", response.getPosto());
    }

    @Test
    @DisplayName("Integração completa checkout")
    void integracaoCheckout() {

        CheckoutDTO dto = new CheckoutDTO();

        dto.setPostoId(1L);

        dto.setPrevencoesMatutinas(10);
        dto.setPrevencoesVespertinas(5);

        dto.setAguasVivasMatutinas(2);
        dto.setAguasVivasVespertinas(3);

        dto.setFoto(new MockMultipartFile(
                "foto",
                "foto.jpg",
                "image/jpeg",
                "imagem".getBytes()
        ));

        Arquivo arquivo = new Arquivo();

        Checkout checkout = new Checkout();

        checkout.setCreatedAt(LocalDateTime.now());
        checkout.setPrevencoesTotal(15);
        checkout.setAguasVivasTotal(5);

        when(postoRepository.findById(1L))
                .thenReturn(Optional.of(posto));

        when(bombeiroRepository.findByCpf(CPF_USUARIO))
                .thenReturn(Optional.of(bombeiro));

        Checkin checkinAnterior = new Checkin();
        checkinAnterior.setPosto(posto);

        when(checkinRepository.findTopByBombeiroCpfOrderByCreatedAtDesc(CPF_USUARIO))
                .thenReturn(Optional.of(checkinAnterior));

        when(checkinRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(1L);

        when(checkoutRepository.countByPostoIdAndDia(any(), any(), any()))
                .thenReturn(0L);

        when(arquivoService.upload(any()))
                .thenReturn(arquivo);

        when(checkoutRepository.save(any(Checkout.class)))
                .thenReturn(checkout);

        CheckoutResponseDTO response = checkService.checkout(dto, CPF_USUARIO);

        assertEquals(15, response.getPrevencoesTotal());
        assertEquals(5, response.getAguasVivasTotal());
    }
}
