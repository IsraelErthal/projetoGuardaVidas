package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.demo.entity.Arquivo;
import com.example.demo.repository.ArquivoRepository;

public class ArquivoServiceTest {

    @Mock
    private ArquivoRepository arquivoRepository;

    @InjectMocks
    private ArquivoService arquivoService;

    private Path tempDir;

    @BeforeEach
    void setup() throws IOException {

        MockitoAnnotations.openMocks(this);

        tempDir = Files.createTempDirectory("uploads-test");

        ReflectionTestUtils.setField(
                arquivoService,
                "path",
                tempDir.toString()
        );
    }

    @Test
    @DisplayName("Deve realizar upload com sucesso")
    void uploadComSucesso() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "teste.jpg",
                "image/jpeg",
                "imagem teste".getBytes()
        );

        Arquivo arquivoSalvo = new Arquivo();

        arquivoSalvo.setNome("teste.jpg");
        arquivoSalvo.setTipo("image/jpeg");
        arquivoSalvo.setTamanho(file.getSize());

        when(arquivoRepository.save(any(Arquivo.class)))
                .thenReturn(arquivoSalvo);

        Arquivo response = arquivoService.upload(file);

        assertNotNull(response);

        assertEquals("teste.jpg", response.getNome());

        assertEquals("image/jpeg", response.getTipo());
    }

   
    @Test
    @DisplayName("Deve lançar exceção ao ocorrer erro no upload")
    void erroUpload() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "arquivo.txt",
                "text/plain",
                "teste".getBytes()
        );

        ReflectionTestUtils.setField(
                arquivoService,
                "path",
                "/diretorio/invalido/:::"
        );

        assertThrows(RuntimeException.class, () -> {
            arquivoService.upload(file);
        });
    }
}