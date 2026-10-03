package com.sistema.territorios.controller;

import com.sistema.territorios.model.RegistroRetirada;
import com.sistema.territorios.model.Territorio;
import com.sistema.territorios.model.Usuario;
import com.sistema.territorios.repository.RegistroRetiradaRepository;
import com.sistema.territorios.repository.TerritorioRepository;
import com.sistema.territorios.repository.UsuarioRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/retiradas")
@CrossOrigin(origins = "*")
public class RegistroRetiradaController {

    private final RegistroRetiradaRepository retiradaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TerritorioRepository territorioRepository;

    public RegistroRetiradaController(RegistroRetiradaRepository retiradaRepository,
            UsuarioRepository usuarioRepository,
            TerritorioRepository territorioRepository) {
        this.retiradaRepository = retiradaRepository;
        this.usuarioRepository = usuarioRepository;
        this.territorioRepository = territorioRepository;
    }

    @PostMapping
    @Transactional
    public RegistroRetirada levantarTerritorio(
            @RequestParam Long usuarioId,
            @RequestParam Long territorioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataRetirada) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        Territorio territorio = territorioRepository.findById(territorioId)
                .orElseThrow(() -> new RuntimeException("Território não encontrado"));

        if (territorio.isOcupado()) {
            throw new RuntimeException("Território já está em uso.");
        }

        territorio.setOcupado(true);
        territorioRepository.save(territorio);

        LocalDate dataFinal = (dataRetirada != null) ? dataRetirada : LocalDate.now();

        RegistroRetirada retirada = new RegistroRetirada(usuario, territorio, dataFinal);
        return retiradaRepository.save(retirada);
    }

    @PutMapping("/{id}/renovar")
    public RegistroRetirada renovar(@PathVariable Long id) {
        RegistroRetirada retirada = retiradaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro não encontrado"));

        LocalDate novaData = LocalDate.now();
        retirada.setDataRetirada(novaData);
        retirada.setPrevisaoRenovacao(novaData.plusMonths(4));
        retirada.setEntregaObrigatoria(novaData.plusMonths(8));

        return retiradaRepository.save(retirada);
    }

    @PutMapping("/{id}/devolver")
    @Transactional
    public RegistroRetirada devolver(@PathVariable Long id) {
        RegistroRetirada retirada = retiradaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro não encontrado"));

        retirada.setDataDevolucao(LocalDate.now());

        Territorio territorio = retirada.getTerritorio();
        territorio.setOcupado(false);
        territorioRepository.save(territorio);

        return retiradaRepository.save(retirada);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<RegistroRetirada> editarRegistro(
            @PathVariable Long id,
            @RequestParam Long usuarioId,
            @RequestParam Long territorioId) {

        RegistroRetirada registro = retiradaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de retirada não encontrado"));

        Usuario novoUsuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Territorio novoTerritorio = territorioRepository.findById(territorioId)
                .orElseThrow(() -> new RuntimeException("Território não encontrado"));

        if (!registro.getTerritorio().getId().equals(novoTerritorio.getId())) {
            Territorio territorioAntigo = registro.getTerritorio();
            territorioAntigo.setOcupado(false);
            territorioRepository.save(territorioAntigo);

            if (novoTerritorio.isOcupado()) {
                throw new RuntimeException("O novo território selecionado já está em uso.");
            }
            novoTerritorio.setOcupado(true);
            territorioRepository.save(novoTerritorio);

            registro.setTerritorio(novoTerritorio);
        }

        registro.setUsuario(novoUsuario);

        RegistroRetirada atualizado = retiradaRepository.save(registro);
        return ResponseEntity.ok(atualizado);
    }

    @GetMapping("/busca")
    public List<RegistroRetirada> buscar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Long territorioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataRetirada) {

        return retiradaRepository.buscarComFiltros(nome, territorioId, dataRetirada);
    }
}