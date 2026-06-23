package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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

@Service
public class CheckService {

    // Horário de liberação do checkin após um checkout
    private static final LocalTime HORA_LIBERACAO = LocalTime.of(7, 0);

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    @Autowired
    private ArquivoService arquivoService;

    @Autowired
    private PostoRepository postoRepository;

    @Autowired
    private BombeiroRepository bombeiroRepository;

    @Autowired
    private CheckinRepository checkinRepository;

    @Autowired
    private CheckoutRepository checkoutRepository;

    // ── intervalos do dia atual ───────────────────────────────────────────────

    private LocalDateTime inicioDia() {
        return LocalDate.now().atStartOfDay();
    }

    private LocalDateTime fimDia() {
        return LocalDate.now().plusDays(1).atStartOfDay();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CHECK-IN
    // ══════════════════════════════════════════════════════════════════════════

    public CheckinResponseDTO checkin(CheckinDTO dto, String cpfUsuario) {

        Posto posto = postoRepository.findById(dto.getPostoId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Posto não encontrado."));

        Bombeiro bombeiro = bombeiroRepository.findByCpf(cpfUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Usuário autenticado não encontrado."));

        // Regra 1 — máximo de 2 checkins por dia
        long checkinsHoje = checkinRepository.countByPostoIdAndDia(
                posto.getId(), inicioDia(), fimDia());

        if (checkinsHoje >= 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Limite de 2 check-ins diários atingido para este posto.");
        }

        // Regra 2 — após checkout, só libera às 7h do dia seguinte
        Optional<Checkout> ultimoCheckout =
                checkoutRepository.findTopByPostoIdOrderByCreatedAtDesc(posto.getId());

        if (ultimoCheckout.isPresent()) {
            LocalDateTime liberadoEm = ultimoCheckout.get()
                    .getCreatedAt()
                    .toLocalDate()
                    .plusDays(1)
                    .atTime(HORA_LIBERACAO);

            if (LocalDateTime.now().isBefore(liberadoEm)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Próximo check-in liberado a partir de "
                                + liberadoEm.format(FMT) + ".");
            }
        }

        // Persiste
        Checkin checkin = new Checkin();
        checkin.setPosto(posto);
        checkin.setBombeiro(bombeiro);

        Arquivo arquivo = arquivoService.upload(dto.getFoto());
        checkin.setFoto(arquivo);

        Checkin checkinSalvo = checkinRepository.save(checkin);

        CheckinResponseDTO response = new CheckinResponseDTO();
        response.setPosto(posto.getNome());
        response.setHorario(checkinSalvo.getCreatedAt());

        return response;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CHECK-OUT
    // ══════════════════════════════════════════════════════════════════════════

    public CheckoutResponseDTO checkout(CheckoutDTO dto, String cpfUsuario) {

        Posto posto = postoRepository.findById(dto.getPostoId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Posto não encontrado."));

        Bombeiro bombeiro = bombeiroRepository.findByCpf(cpfUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Usuário autenticado não encontrado."));

        checkinRepository.findTopByBombeiroCpfOrderByCreatedAtDesc(cpfUsuario)
                .filter(checkin -> !checkin.getPosto().getId().equals(posto.getId()))
                .ifPresent(checkin -> {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "O check-out deve ser feito no mesmo posto do seu último check-in.");
                });

        long checkinsHoje = checkinRepository.countByPostoIdAndDia(
                posto.getId(), inicioDia(), fimDia());

        if (checkinsHoje == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nenhum check-in foi realizado hoje para este posto.");
        }

        // Regra — máximo de 1 checkout por dia
        long checkoutsHoje = checkoutRepository.countByPostoIdAndDia(
                posto.getId(), inicioDia(), fimDia());

        if (checkoutsHoje >= 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Já foi realizado um check-out hoje para este posto.");
        }

        // Persiste
        Checkout checkout = new Checkout();
        checkout.setPosto(posto);
        checkout.setBombeiro(bombeiro);

        Arquivo arquivo = arquivoService.upload(dto.getFoto());
        checkout.setFoto(arquivo);

        checkout.setPrevencoesMatutinas(dto.getPrevencoesMatutinas());
        checkout.setAguasVivasMatutinas(dto.getAguasVivasMatutinas());
        checkout.setPrevencoesVespertinas(dto.getPrevencoesVespertinas());
        checkout.setAguasVivasVespertinas(dto.getAguasVivasVespertinas());

        int prevencoesTotal = dto.getPrevencoesMatutinas() + dto.getPrevencoesVespertinas();
        int aguasVivasTotal = dto.getAguasVivasMatutinas() + dto.getAguasVivasVespertinas();

        checkout.setPrevencoesTotal(prevencoesTotal);
        checkout.setAguasVivasTotal(aguasVivasTotal);

        Checkout checkoutSalvo = checkoutRepository.save(checkout);

        CheckoutResponseDTO response = new CheckoutResponseDTO();
        response.setPosto(posto.getNome());
        response.setHorario(checkoutSalvo.getCreatedAt());
        response.setPrevencoesTotal(checkoutSalvo.getPrevencoesTotal());
        response.setAguasVivasTotal(checkoutSalvo.getAguasVivasTotal());

        return response;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STATUS DOS POSTOS (dashboard admin)
    // Retorna apenas postos com atividade HOJE, ordenados por posto
    // ══════════════════════════════════════════════════════════════════════════

    public List<PostoStatusDTO> statusPostos() {

        List<Checkin>  checkinsHoje  = checkinRepository.findAllByDia(inicioDia(), fimDia());
        List<Checkout> checkoutsHoje = checkoutRepository.findAllByDia(inicioDia(), fimDia());

        // IDs de postos com qualquer atividade hoje
        List<Long> postosAtivos = postos(checkinsHoje, checkoutsHoje);

        return postosAtivos.stream()
                .map(id -> postoRepository.findById(id).orElse(null))
                .filter(p -> p != null)
                .map(posto -> toStatusDTO(posto, checkinsHoje, checkoutsHoje))
                .sorted(Comparator.comparing(PostoStatusDTO::getPostoNome, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public List<PostoStatusDTO> checkinsHoje() {
        return checkinRepository.findAllByDia(inicioDia(), fimDia()).stream()
                .map(this::toCheckinStatusDTO)
                .sorted(Comparator.comparing(PostoStatusDTO::getPostoNome, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public List<PostoStatusDTO> checkoutsHoje() {
        return checkoutRepository.findAllByDia(inicioDia(), fimDia()).stream()
                .map(this::toCheckoutStatusDTO)
                .sorted(Comparator.comparing(PostoStatusDTO::getPostoNome, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    // IDs únicos de postos presentes em checkins ou checkouts de hoje
    private List<Long> postos(List<Checkin> checkins, List<Checkout> checkouts) {
        List<Long> ids = new java.util.ArrayList<>();

        checkins.stream()
                .map(c -> c.getPosto().getId())
                .distinct()
                .forEach(ids::add);

        checkouts.stream()
                .map(c -> c.getPosto().getId())
                .filter(id -> !ids.contains(id))
                .forEach(ids::add);

        return ids;
    }

    private PostoStatusDTO toStatusDTO(
            Posto posto,
            List<Checkin> todosCheckins,
            List<Checkout> todosCheckouts) {

        // filtra apenas os registros deste posto
        List<Checkin> checkinsPosto = todosCheckins.stream()
                .filter(c -> c.getPosto().getId().equals(posto.getId()))
                .toList();

        List<Checkout> checkoutsPosto = todosCheckouts.stream()
                .filter(c -> c.getPosto().getId().equals(posto.getId()))
                .toList();

        LocalDateTime checkinEm  = checkinsPosto.isEmpty()  ? null : checkinsPosto.get(0).getCreatedAt();
        LocalDateTime checkoutEm = checkoutsPosto.isEmpty() ? null : checkoutsPosto.get(0).getCreatedAt();

        boolean temCheckinMaisRecente = checkinEm != null
                && (checkoutEm == null || checkinEm.isAfter(checkoutEm));

        Checkout ultimoCheckout = checkoutsPosto.isEmpty() ? null : checkoutsPosto.get(0);

        // Borda amarela: primeiro checkin do dia foi feito APÓS 7h
        boolean checkinAtrasado = !checkinsPosto.isEmpty()
                && checkinsPosto.get(checkinsPosto.size() - 1)  // o mais antigo do dia
                        .getCreatedAt()
                        .toLocalTime()
                        .isAfter(HORA_LIBERACAO);

        PostoStatusDTO dto = new PostoStatusDTO();
        dto.setPostoId(posto.getId());
        dto.setPostoNome(posto.getNome());
        dto.setDescricao(posto.getDescricao());
        dto.setStatus(temCheckinMaisRecente ? "CHECKIN" : "CHECKOUT");
        dto.setUltimoEventoEm(temCheckinMaisRecente ? checkinEm : checkoutEm);
        dto.setPrevencoesTotal(ultimoCheckout == null ? 0 : ultimoCheckout.getPrevencoesTotal());
        dto.setAguasVivasTotal(ultimoCheckout == null ? 0 : ultimoCheckout.getAguasVivasTotal());
        dto.setCheckinAtrasado(checkinAtrasado);        // ← flag para borda amarela no frontend
        dto.setTotalCheckinsHoje(checkinsPosto.size()); // ← quantos checkins hoje (máx 2)

        return dto;
    }

    private PostoStatusDTO toCheckinStatusDTO(Checkin checkin) {
        Posto posto = checkin.getPosto();

        PostoStatusDTO dto = baseStatusDTO(posto);
        dto.setStatus("CHECKIN");
        dto.setUltimoEventoEm(checkin.getCreatedAt());
        dto.setFotoUrl(fotoUrl(checkin.getFoto()));
        preencherUsuario(dto, checkin.getBombeiro());
        dto.setCheckinAtrasado(checkin.getCreatedAt().toLocalTime().isAfter(HORA_LIBERACAO));
        dto.setTotalCheckinsHoje((int) checkinRepository.countByPostoIdAndDia(
                posto.getId(), inicioDia(), fimDia()));

        return dto;
    }

    private PostoStatusDTO toCheckoutStatusDTO(Checkout checkout) {
        Posto posto = checkout.getPosto();

        PostoStatusDTO dto = baseStatusDTO(posto);
        dto.setStatus("CHECKOUT");
        dto.setUltimoEventoEm(checkout.getCreatedAt());
        dto.setFotoUrl(fotoUrl(checkout.getFoto()));
        preencherUsuario(dto, checkout.getBombeiro());
        dto.setPrevencoesMatutinas(checkout.getPrevencoesMatutinas());
        dto.setAguasVivasMatutinas(checkout.getAguasVivasMatutinas());
        dto.setPrevencoesVespertinas(checkout.getPrevencoesVespertinas());
        dto.setAguasVivasVespertinas(checkout.getAguasVivasVespertinas());
        dto.setPrevencoesTotal(checkout.getPrevencoesTotal());
        dto.setAguasVivasTotal(checkout.getAguasVivasTotal());

        return dto;
    }

    private PostoStatusDTO baseStatusDTO(Posto posto) {
        PostoStatusDTO dto = new PostoStatusDTO();
        dto.setPostoId(posto.getId());
        dto.setPostoNome(posto.getNome());
        dto.setDescricao(posto.getDescricao());
        return dto;
    }

    private String fotoUrl(Arquivo arquivo) {
        return arquivo == null ? null : "/arquivos/" + arquivo.getId();
    }

    private void preencherUsuario(PostoStatusDTO dto, Bombeiro bombeiro) {
        if (bombeiro == null) {
            return;
        }

        dto.setUsuarioId(bombeiro.getId());
        dto.setUsuarioNome(bombeiro.getNome());
        dto.setUsuarioCpf(bombeiro.getCpf());
    }
}
