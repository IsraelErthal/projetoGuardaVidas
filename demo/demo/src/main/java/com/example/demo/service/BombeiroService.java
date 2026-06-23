package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.BombeiroDTO;
import com.example.demo.dto.RecuperacaoSolicitacaoDTO;
import com.example.demo.dto.TrocarSenhaDTO;
import com.example.demo.entity.Bombeiro;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.BombeiroRepository;

import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;

@Service
public class BombeiroService extends BaseService<Bombeiro, BombeiroDTO> {


    
    private final BombeiroRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    protected BombeiroService(BombeiroRepository repository, PasswordEncoder passwordEncoder) {
        super(repository);
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Gera a senha inicial do bombeiro:
     * os 5 primeiros dígitos do CPF informado.
     * Ex: CPF "12345678900" → senha "12345"
     */
    private String gerarSenha(String cpf) {
        return cpf.substring(0, 5);
    }

    @Override
    public BombeiroDTO read(Long id) {
        Bombeiro bombeiro = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Bombeiro não encontrado."
            ));

        if (bombeiro.getNivelAcesso() == NivelAcesso.ADMIN) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Administradores não podem consultar outros administradores por este CRUD."
            );
        }

        return toDto(bombeiro);
    }

    @Override
    public List<BombeiroDTO> read() {
        return repository.findAll().stream()
            .filter(bombeiro -> bombeiro.getNivelAcesso() != NivelAcesso.ADMIN)
            .map(this::toDto)
            .toList();
    }

    @Override
    @Transactional
    public BombeiroDTO create(BombeiroDTO dto) {
        dto.setNivelAcesso(NivelAcesso.PADRAO);

        // CPF não pode ser duplicado
        if (repository.existsByCpf(dto.getCpf())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Já existe um bombeiro cadastrado com esse CPF."
            );
        }
        validarEmailDisponivel(dto.getEmail(), null);

        Bombeiro bombeiro = toEntity(dto);
        bombeiro.setEmail(normalizarEmail(dto.getEmail()));

        // senha = primeiros 5 dígitos do CPF (criptografada)
        String senhaGerada = gerarSenha(dto.getCpf());
        bombeiro.setSenha(passwordEncoder.encode(senhaGerada));

        return toDto(repository.save(bombeiro));
    }

    @Override
    @Transactional
    public BombeiroDTO update(Long id, BombeiroDTO dto) {

        Bombeiro bombeiroAtual = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Bombeiro não encontrado."
            ));

        if (bombeiroAtual.getNivelAcesso() == NivelAcesso.ADMIN) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Administradores não podem alterar outros administradores."
            );
        }

        dto.setNivelAcesso(NivelAcesso.PADRAO);

        // Se o CPF foi alterado, verifica duplicidade
        if (!bombeiroAtual.getCpf().equals(dto.getCpf())
                && repository.existsByCpf(dto.getCpf())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Já existe um bombeiro cadastrado com esse CPF."
            );
        }
        validarEmailDisponivel(dto.getEmail(), id);

        Bombeiro bombeiro = toEntity(dto);
        bombeiro.setId(id);
        bombeiro.setEmail(normalizarEmail(dto.getEmail()));

        // Se o CPF mudou, regenera a senha a partir dos novos 5 dígitos
        if (!bombeiroAtual.getCpf().equals(dto.getCpf())) {
            bombeiro.setSenha(passwordEncoder.encode(gerarSenha(dto.getCpf())));
        } else {
            // mantém a senha atual
            bombeiro.setSenha(bombeiroAtual.getSenha());
        }

        return toDto(repository.save(bombeiro));
    }

    @Override
    @Transactional
    public void sofDelete(Long id) {
        Bombeiro bombeiro = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Bombeiro não encontrado."
            ));

        if (bombeiro.getNivelAcesso() == NivelAcesso.ADMIN) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Administradores não podem excluir outros administradores."
            );
        }

        super.sofDelete(id);
    }

    @Transactional
    public void solicitarRecuperacaoSenha(RecuperacaoSolicitacaoDTO dto) {
        String email = normalizarEmail(dto.getEmail());

        Bombeiro bombeiro = repository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Nenhum bombeiro ativo encontrado com esse email."
            ));

        String codigo = String.valueOf(ThreadLocalRandom.current().nextInt(10000000, 100000000));
        bombeiro.setCodigoRecuperacao(codigo);
        bombeiro.setCodigoRecuperacaoExpiracao(LocalDateTime.now().plusMinutes(15));
        repository.save(bombeiro);

        try {
            emailService.enviarEmail(
                email,
                "Código de recuperação de senha",
                "Seu código de recuperação é: " + codigo + ". Ele expira em 15 minutos."
            );
        } catch (MessagingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao enviar email de recuperação.");
        }
    }

    @Transactional
    public void trocarSenha(TrocarSenhaDTO dto) {
        String email = normalizarEmail(dto.getEmail());
        String codigo = dto.getCodigo();
        String novaSenha = dto.getNovaSenha();

        Bombeiro bombeiro = repository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Nenhum bombeiro ativo encontrado com esse email."
            ));

        if (bombeiro.getCodigoRecuperacao() == null || bombeiro.getCodigoRecuperacaoExpiracao() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nenhuma solicitação de recuperação");
        }

        if (!bombeiro.getCodigoRecuperacao().equals(codigo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código incorreto");
        }

        if (bombeiro.getCodigoRecuperacaoExpiracao().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código expirado");
        }


        String novaSenhaCriptografada = passwordEncoder.encode(novaSenha);
        bombeiro.setSenha(novaSenhaCriptografada);

        bombeiro.setCodigoRecuperacao(null);
        bombeiro.setCodigoRecuperacaoExpiracao(null);

        repository.save(bombeiro);
    }

    private void validarEmailDisponivel(String email, Long idAtual) {
        String emailNormalizado = normalizarEmail(email);
        if (emailNormalizado == null || emailNormalizado.isBlank()) {
            return;
        }

        repository.findByEmail(emailNormalizado)
            .filter(b -> idAtual == null || !b.getId().equals(idAtual))
            .ifPresent(b -> {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Já existe um bombeiro cadastrado com esse email."
                );
            });
    }

    private String normalizarEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }

        return email.trim().toLowerCase();
    }
}
