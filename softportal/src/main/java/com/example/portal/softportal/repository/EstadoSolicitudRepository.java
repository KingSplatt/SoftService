package com.example.portal.softportal.repository;

import com.example.portal.softportal.models.EstadoSolicitud;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoSolicitudRepository extends JpaRepository<EstadoSolicitud, Integer> {
    Optional<EstadoSolicitud> findByNombre(String nombre);
}
