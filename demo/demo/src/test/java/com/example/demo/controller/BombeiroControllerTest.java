package com.example.demo.controller;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import com.example.demo.dto.BombeiroDTO;
import com.example.demo.entity.Bombeiro;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.BombeiroRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class BombeiroControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtUtil jwt;

    @Autowired
    private BombeiroRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EntityManager entityManager;

    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        this.objectMapper = new ObjectMapper();

        this.token = jwt.generateToken(
                "admin@admin.com",
                NivelAcesso.ADMIN.toString()
        );
    }

    @Test
    @DisplayName("Deve criar bombeiro com sucesso")
    void criarBombeiro() throws Exception {

        BombeiroDTO dto = new BombeiroDTO();

        dto.setNome("Israel");
        dto.setCpf("12345678900");
        dto.setNivelAcesso(NivelAcesso.PADRAO);

        String json = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/bombeiros")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Israel"))
                .andExpect(jsonPath("$.cpf").value("12345678900"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @DisplayName("Deve gerar senha automaticamente baseada no CPF")
    void gerarSenhaAutomatica() throws Exception {

        BombeiroDTO dto = new BombeiroDTO();

        dto.setNome("Carlos");
        dto.setCpf("98765432100");
        dto.setNivelAcesso(NivelAcesso.PADRAO);

        String json = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/bombeiros")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        Bombeiro bombeiro = repository.findByCpf("98765432100")
                .orElseThrow();

        // senha esperada = 98765
        assertTrue(passwordEncoder.matches(
                "98765",
                bombeiro.getSenha()
        ));
    }

    @Test
    @DisplayName("Deve deletar bombeiro logicamente")
    void deletarBombeiro() throws Exception {

        Bombeiro bombeiro = new Bombeiro();

        bombeiro.setNome("Bombeiro Delete");
        bombeiro.setCpf("11122233344");
        bombeiro.setNivelAcesso(NivelAcesso.PADRAO);
        bombeiro.setSenha(passwordEncoder.encode("11122"));

        bombeiro = repository.save(bombeiro);

        mockMvc.perform(delete("/bombeiros/" + bombeiro.getId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        entityManager.clear();

        bombeiro = repository.findById(bombeiro.getId())
                .orElseThrow();

        assertTrue(!bombeiro.isAtivo());
    }

    @Test
@DisplayName("Deve listar todos os bombeiros")
void listarBombeiros() throws Exception {

    Bombeiro bombeiro = new Bombeiro();

    bombeiro.setNome("João");
    bombeiro.setCpf("99988877766");
    bombeiro.setNivelAcesso(NivelAcesso.PADRAO);
    bombeiro.setSenha(passwordEncoder.encode("99988"));

    repository.save(bombeiro);

    mockMvc.perform(get("/bombeiros")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
}

@Test
@DisplayName("Deve buscar bombeiro por ID")
void buscarBombeiroPorId() throws Exception {

    Bombeiro bombeiro = new Bombeiro();

    bombeiro.setNome("Marcos");
    bombeiro.setCpf("55544433322");
    bombeiro.setNivelAcesso(NivelAcesso.PADRAO);
    bombeiro.setSenha(passwordEncoder.encode("55544"));

    bombeiro = repository.save(bombeiro);

    mockMvc.perform(get("/bombeiros/" + bombeiro.getId())
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Marcos"))
            .andExpect(jsonPath("$.cpf").value("55544433322"));
}

@Test
@DisplayName("Não deve permitir CPF duplicado")
void naoPermitirCpfDuplicado() throws Exception {

    Bombeiro bombeiro = new Bombeiro();

    bombeiro.setNome("Bombeiro Existente");
    bombeiro.setCpf("12312312399");
    bombeiro.setNivelAcesso(NivelAcesso.PADRAO);
    bombeiro.setSenha(passwordEncoder.encode("12312"));

    repository.save(bombeiro);

    BombeiroDTO dto = new BombeiroDTO();

    dto.setNome("Novo Bombeiro");
    dto.setCpf("12312312399"); // CPF repetido
    dto.setNivelAcesso(NivelAcesso.PADRAO);

    String json = objectMapper.writeValueAsString(dto);

    mockMvc.perform(post("/bombeiros")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json)
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isConflict());
}
}