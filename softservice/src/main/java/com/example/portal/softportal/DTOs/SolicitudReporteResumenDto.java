package com.example.portal.softportal.DTOs;

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
public class SolicitudReporteResumenDto {
    private long total;
    private long aprobadas;
    private long rechazadas;
    private long pendientes;
}
