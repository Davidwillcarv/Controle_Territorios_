package com.sistema.territorios.controller;

import com.sistema.territorios.model.Usuario;
import com.sistema.territorios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public Usuario salvar(@RequestBody Usuario usuario) {
        if (usuario.getEmail() != null && usuario.getEmail().trim().isEmpty()) {
            usuario.setEmail(null);
        }
        return usuarioRepository.save(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable Long id, @RequestBody Usuario dados) {
        return usuarioRepository.findById(id)
                .map(u -> {
                    u.setNome(dados.getNome());
                    u.setEmail(dados.getEmail());
                    return ResponseEntity.ok(usuarioRepository.save(u));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}