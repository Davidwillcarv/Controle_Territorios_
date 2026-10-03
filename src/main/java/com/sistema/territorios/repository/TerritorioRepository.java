package com.sistema.territorios.repository;

import com.sistema.territorios.model.Territorio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TerritorioRepository extends JpaRepository<Territorio, Long> {
}