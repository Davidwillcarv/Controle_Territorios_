package com.sistema.territorios.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "territorios")
public class Territorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nomeOuNumero;

    private boolean ocupado = false;

    @OneToMany(mappedBy = "territorio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<RegistroRetirada> retiradas = new ArrayList<>();

    public Territorio() {
    }

    public Territorio(String nomeOuNumero) {
        this.nomeOuNumero = nomeOuNumero;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeOuNumero() {
        return nomeOuNumero;
    }

    public void setNomeOuNumero(String nomeOuNumero) {
        this.nomeOuNumero = nomeOuNumero;
    }

    public boolean isOcupado() {
        return ocupado;
    }

    public void setOcupado(boolean ocupado) {
        this.ocupado = ocupado;
    }

    public List<RegistroRetirada> getRetiradas() {
        return retiradas;
    }

    public void setRetiradas(List<RegistroRetirada> retiradas) {
        this.retiradas = retiradas;
    }
}