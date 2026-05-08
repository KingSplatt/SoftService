package com.example.portal.softportal.repository;

import com.example.portal.softportal.models.Solicitud;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SolicitudRepository extends JpaRepository<Solicitud, Integer> {
    List<Solicitud> findByUsuarioIdUsuario(Integer idUsuario);

    List<Solicitud> findByUsuarioNombreUsuarioContainingIgnoreCase(String nombreUsuario);
    
    /**
     * Obtiene el conteo de solicitudes agrupadas por año y mes
     * Retorna: [año, mes, cantidad]
     */
    @Query(value = """
        SELECT 
            EXTRACT(YEAR FROM s.fecha_solicitud)::integer as year,
            EXTRACT(MONTH FROM s.fecha_solicitud)::integer as month,
            COUNT(*) as cantidad
        FROM solicitudes s
        GROUP BY EXTRACT(YEAR FROM s.fecha_solicitud), EXTRACT(MONTH FROM s.fecha_solicitud)
        ORDER BY year DESC, month DESC
        """, nativeQuery = true)
    List<Object[]> obtenerEstadisticasPorMes();
    
    /**
     * Obtiene solicitudes de los últimos N meses
     */
    @Query(value = """
        SELECT s FROM Solicitud s
        WHERE s.fechaSolicitud >= :fechaInicio AND s.fechaSolicitud <= :fechaFin
        ORDER BY s.fechaSolicitud DESC
        """)
    List<Solicitud> obtenerSolicitudesPorRango(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
    
    /**
     * Obtiene el conteo de solicitudes por mes para un rango específico
     */
    @Query(value = """
        SELECT 
            EXTRACT(YEAR FROM s.fecha_solicitud)::integer as year,
            EXTRACT(MONTH FROM s.fecha_solicitud)::integer as month,
            COUNT(*) as cantidad
        FROM solicitudes s
        WHERE s.fecha_solicitud >= :fechaInicio AND s.fecha_solicitud <= :fechaFin
        GROUP BY EXTRACT(YEAR FROM s.fecha_solicitud), EXTRACT(MONTH FROM s.fecha_solicitud)
        ORDER BY year DESC, month DESC
        """, nativeQuery = true)
    List<Object[]> obtenerEstadisticasPorMesRango(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
}
