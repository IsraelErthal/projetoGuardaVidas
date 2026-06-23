package com.example.demo.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Public;
import com.example.demo.entity.Arquivo;
import com.example.demo.repository.ArquivoRepository;

@RestController
@RequestMapping("/arquivos")
public class ArquivoController {

    private final ArquivoRepository arquivoRepository;

    public ArquivoController(ArquivoRepository arquivoRepository) {
        this.arquivoRepository = arquivoRepository;
    }

    @Public
    @GetMapping("/{id}")
    public ResponseEntity<FileSystemResource> read(@PathVariable UUID id) {
        Arquivo arquivo = arquivoRepository.findById(id).orElseThrow();
        Path path = Path.of(arquivo.getCaminho());

        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = arquivo.getTipo() == null
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(arquivo.getTipo());

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new FileSystemResource(path));
    }
}
