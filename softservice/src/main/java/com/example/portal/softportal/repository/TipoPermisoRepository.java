package com.example.portal.softportal.repository;

import com.example.portal.softportal.models.TipoPermiso;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoPermisoRepository extends JpaRepository<TipoPermiso, Integer> {
    Optional<TipoPermiso> findByNombre(String nombre);
}
