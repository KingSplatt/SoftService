package com.example.portal.softportal.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrediccionSolicitudesDto {
    private List<EstadisticasMesilDto> historicoUltimos12Meses;
    private List<EstadisticasMesilDto> prediccionProximos3Meses;
    private Double promedioMensual;
    private String tendencia;
}
