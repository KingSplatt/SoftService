package com.example.portal.softportal.repository;

import com.example.portal.softportal.models.Solicitud;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitudRepository extends JpaRepository<Solicitud, Integer> {
    List<Solicitud> findByUsuarioIdUsuario(Integer idUsuario);

    List<Solicitud> findByUsuarioNombreUsuarioContainingIgnoreCase(String nombreUsuario);
}
