package com.example.demo.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.example.demo.config.JwtUtil;
import com.example.demo.entity.Bombeiro;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.BombeiroRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private BombeiroRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private ObjectMapper objectMapper;

    private String tokenAdmin;

    @BeforeEach
    void setup() {

        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

        this.objectMapper = new ObjectMapper();

        this.tokenAdmin = jwtUtil.generateToken(
                "admin",
                NivelAcesso.ADMIN.toString()
        );
    }

    // =========================================================
    // TESTES UNITÁRIOS
    // =========================================================

    @Test
    @DisplayName("Deve realizar login com sucesso")
    void loginComSucesso() throws Exception {

        Bombeiro bombeiro = new Bombeiro();

        bombeiro.setNome("Israel");
        bombeiro.setCpf("12345678900");
        bombeiro.setNivelAcesso(NivelAcesso.ADMIN);
        bombeiro.setSenha(passwordEncoder.encode("12345"));

        repository.save(bombeiro);

        String body = """
            {
                "cpf":"12345678900",
                "senha":"12345"
            }
        """;

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.tipo").value("ADMIN"))
                .andExpect(jsonPath("$.nome").value("Israel"));
    }

    @Test
    @DisplayName("Deve retornar 401 para senha incorreta")
    void loginSenhaIncorreta() throws Exception {

        Bombeiro bombeiro = new Bombeiro();

        bombeiro.setNome("Carlos");
        bombeiro.setCpf("99999999999");
        bombeiro.setNivelAcesso(NivelAcesso.PADRAO);
        bombeiro.setSenha(passwordEncoder.encode("12345"));

        repository.save(bombeiro);

        String body = """
            {
                "cpf":"99999999999",
                "senha":"senhaerrada"
            }
        """;

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve retornar 401 para CPF inexistente")
    void loginCpfInexistente() throws Exception {

        String body = """
            {
                "cpf":"00000000000",
                "senha":"12345"
            }
        """;

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve acessar endpoint /me autenticado")
    void endpointMeAutenticado() throws Exception {

        mockMvc.perform(get("/auth/me")
                .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Deve bloquear endpoint /me sem token")
    void endpointMeSemToken() throws Exception {

        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================
    // TESTES DE INTEGRAÇÃO
    // =========================================================

    @Test
    @DisplayName("Integração completa login + acesso /me")
    void integracaoLoginEMe() throws Exception {

        Bombeiro bombeiro = new Bombeiro();

        bombeiro.setNome("Administrador");
        bombeiro.setCpf("11122233344");
        bombeiro.setNivelAcesso(NivelAcesso.ADMIN);
        bombeiro.setSenha(passwordEncoder.encode("12345"));

        repository.save(bombeiro);

        String loginBody = """
            {
                "cpf":"11122233344",
                "senha":"12345"
            }
        """;

        String response = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = objectMapper.readTree(response)
                .get("token")
                .asText();

        mockMvc.perform(get("/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("11122233344"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Integração deve bloquear token inválido")
    void integracaoTokenInvalido() throws Exception {

        mockMvc.perform(get("/auth/me")
                .header("Authorization", "Bearer token_invalido"))
                .andExpect(status().isUnauthorized());
    }
}