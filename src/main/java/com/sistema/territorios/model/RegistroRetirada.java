package com.sistema.territorios.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "registros_retirada")
public class RegistroRetirada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "territorio_id", nullable = false)
    private Territorio territorio;

    private LocalDate dataRetirada;
    private LocalDate previsaoRenovacao;
    private LocalDate entregaObrigatoria;
    private LocalDate dataDevolucao;

    @Transient
    private String alertaStatus;

    public RegistroRetirada() {
    }

    public RegistroRetirada(Usuario usuario, Territorio territorio, LocalDate dataRetirada) {
        this.usuario = usuario;
        this.territorio = territorio;
        this.dataRetirada = dataRetirada;
        this.previsaoRenovacao = dataRetirada.plusMonths(4);
        this.entregaObrigatoria = dataRetirada.plusMonths(8);
    }

    public String getAlertaStatus() {
        if (dataDevolucao != null) {
            return "ENTREGUE";
        }
        if (dataRetirada == null) {
            return "DATA DE RETIRADA NÃO DEFINIDA";
        }
        long mesesEmPosse = ChronoUnit.MONTHS.between(dataRetirada, LocalDate.now());
        if (mesesEmPosse >= 8) {
            return "ENTREGA IMEDIATA (>= 8 meses)";
        } else if (mesesEmPosse >= 4) {
            return "OPCIONAL: RENOVAR OU ENTREGAR (>= 4 meses)";
        }
        return "DENTRO DO PRAZO";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Territorio getTerritorio() {
        return territorio;
    }

    public void setTerritorio(Territorio territorio) {
        this.territorio = territorio;
    }

    public LocalDate getDataRetirada() {
        return dataRetirada;
    }

    public void setDataRetirada(LocalDate dataRetirada) {
        this.dataRetirada = dataRetirada;
    }

    public LocalDate getPrevisaoRenovacao() {
        return previsaoRenovacao;
    }

    public void setPrevisaoRenovacao(LocalDate previsaoRenovacao) {
        this.previsaoRenovacao = previsaoRenovacao;
    }

    public LocalDate getEntregaObrigatoria() {
        return entregaObrigatoria;
    }

    public void setEntregaObrigatoria(LocalDate entregaObrigatoria) {
        this.entregaObrigatoria = entregaObrigatoria;
    }

    public LocalDate getDataDevolucao() {
        return dataDevolucao;
    }

    public void setDataDevolucao(LocalDate dataDevolucao) {
        this.dataDevolucao = dataDevolucao;
    }
}