package com.example.portal.softportal.DTOs;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudDto {
    private Integer idSolicitud;
    private Integer usuarioId;
    private String usuarioNombre;
    private Integer tipoId;
    private String tipoNombre;
    private Integer estadoId;
    private String estadoNombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String motivo;
    private LocalDateTime fechaSolicitud;
}
