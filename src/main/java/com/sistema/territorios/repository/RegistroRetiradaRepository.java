package com.sistema.territorios.repository;

import com.sistema.territorios.model.RegistroRetirada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RegistroRetiradaRepository extends JpaRepository<RegistroRetirada, Long> {

        @Query("SELECT r FROM RegistroRetirada r " +
                        "WHERE (:nome IS NULL OR LOWER(r.usuario.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) " +
                        "AND (:territorioId IS NULL OR r.territorio.id = :territorioId) " +
                        "AND (:dataRetirada IS NULL OR r.dataRetirada = :dataRetirada)")
        List<RegistroRetirada> buscarComFiltros(
                        @Param("nome") String nome,
                        @Param("territorioId") Long territorioId,
                        @Param("dataRetirada") LocalDate dataRetirada);
}