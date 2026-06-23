package com.example.demo.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Public;
import com.example.demo.config.JwtUtil;
import com.example.demo.dto.AuthDTO;
import com.example.demo.dto.RecuperacaoSolicitacaoDTO;
import com.example.demo.dto.TrocarSenhaDTO;
import com.example.demo.entity.Bombeiro;
import com.example.demo.repository.BombeiroRepository;
import com.example.demo.service.BombeiroService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private BombeiroService bombeiroService;

    @Autowired
    private BombeiroRepository bombeiroRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    @Public
    public ResponseEntity<?> login(@RequestBody @Valid AuthDTO dto) {

        String cpf   = dto.getCpf();
        String senha = dto.getSenha();

        Optional<Bombeiro> bombeiroOpt = bombeiroRepository.findByCpf(cpf);

        if (bombeiroOpt.isPresent()) {
            Bombeiro bombeiro = bombeiroOpt.get();
            String senhaInicial = cpf.substring(0, 5);
            boolean senhaValida = passwordEncoder.matches(senha, bombeiro.getSenha());
            boolean senhaInicialInformada = senha.equals(senhaInicial);

            if (!senhaValida && !senhaInicialInformada) {
                return ResponseEntity.status(401).body("CPF ou senha inválidos!");
            }

            if (!senhaValida) {
                bombeiro.setSenha(passwordEncoder.encode(senhaInicial));
                bombeiroRepository.save(bombeiro);
            }

            String nivelAcesso = bombeiro.getNivelAcesso().toString();
            String token       = jwtUtil.generateToken(cpf, nivelAcesso);

            return ResponseEntity.ok(Map.of(
                "token", token,
                "tipo",  nivelAcesso,
                "nome",  bombeiro.getNome(),
                "email", bombeiro.getEmail() == null ? "" : bombeiro.getEmail()
            ));
        }

        return ResponseEntity.status(401).body("CPF ou senha inválidos!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication, HttpServletRequest request) {

        if (authentication != null) {
            String role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring(5))
                    .findFirst()
                    .orElse("PADRAO");

            return ResponseEntity.ok(Map.of(
                "username", authentication.getName(),
                "role",     role
            ));
        }

        String token = extrairToken(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Não autenticado");
        }

        return ResponseEntity.ok(Map.of(
            "username", jwtUtil.extractUsername(token),
            "role",     jwtUtil.extractRole(token)
        ));
    }

    @Public
    @PostMapping("/recuperar-senha")
    public ResponseEntity<?> solicitarRecuperacaoSenha(@RequestBody @Valid RecuperacaoSolicitacaoDTO dto){
        bombeiroService.solicitarRecuperacaoSenha(dto);

        return ResponseEntity.ok(Map.of("message", "código enviado para o email cadastrado"));
    }

    @Public
    @PostMapping("/recuperar-senha/alterar")
    public ResponseEntity<?> alterarSenha(@RequestBody @Valid TrocarSenhaDTO dto){
        bombeiroService.trocarSenha(dto);


        return ResponseEntity.ok(Map.of("message", "senha alterada com sucesso!"));
    }

    private String extrairToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        return null;
    }
}
