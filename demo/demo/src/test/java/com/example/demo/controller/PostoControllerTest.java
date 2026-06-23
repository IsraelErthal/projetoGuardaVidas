package com.example.demo.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.example.demo.config.JwtUtil;
import com.example.demo.dto.PostoDTO;
import com.example.demo.entity.Posto;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.PostoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test") 
@Transactional
public class PostoControllerTest {


    private MockMvc mockMvc;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private WebApplicationContext context;

    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwt;

    private String token;

    @Autowired
    private PostoRepository pr;

    @BeforeEach
    public void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        this.objectMapper = new ObjectMapper();

        this.token = jwt.generateToken("tantofaz@admin.com", NivelAcesso.ADMIN.toString());
    }

    @Test
    @DisplayName("Deve criar um posto com sucesso")
    void criarPosto() throws Exception {
        PostoDTO postoDTO = new PostoDTO();

        postoDTO.setNome("Posto 78");
        postoDTO.setDescricao("Descrição do posto 7");

   
        String json = objectMapper.writeValueAsString(postoDTO);

        mockMvc.perform(post("/postos")

                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .header("Authorization", "Bearer " + token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Posto 78"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @DisplayName("Listar todos os postos")
    void listarPostos() throws Exception {
        mockMvc.perform(get("/postos")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Dar badrequest")
    void badRequestPosto() throws Exception {
        mockMvc.perform(post("/postos")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve buscar posto por ID")
    void buscarPorId() throws Exception {

        Posto p = new Posto();
        p.setNome("Posto para Id");
        p.setDescricao("Posto para id");

        p = pr.save(p);

        mockMvc.perform(get("/postos/" + p.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Posto para Id"));
    }

    @Test
    @DisplayName("Deve deletar")
    void Deletar() throws Exception {

        Posto p = new Posto();
        p.setNome("Posto para Id");
        p.setDescricao("Posto para deletar");

        p = pr.save(p);

        mockMvc.perform(delete("/postos/" + p.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        entityManager.clear(); 

        p = pr.findById(p.getId()).orElseThrow();

        assertFalse(p.isAtivo());
    }

    
}
