package com.sistema.territorios.controller;

import com.sistema.territorios.model.Territorio;
import com.sistema.territorios.repository.TerritorioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/territorios")
@CrossOrigin(origins = "*")
public class TerritorioController {

    @Autowired
    private TerritorioRepository territorioRepository;

    @GetMapping
    public List<Territorio> listar() {
        return territorioRepository.findAll();
    }

    @PostMapping
    public Territorio salvar(@RequestBody Territorio territorio) {
        return territorioRepository.save(territorio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Territorio> atualizar(@PathVariable Long id, @RequestBody Territorio dados) {
        return territorioRepository.findById(id)
                .map(t -> {
                    t.setNomeOuNumero(dados.getNomeOuNumero());
                    return ResponseEntity.ok(territorioRepository.save(t));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!territorioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        territorioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}