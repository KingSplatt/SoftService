package com.example.portal.softportal.DTOs;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSolicitudDto {

    @NotNull
    private Integer usuarioId;

    @NotNull
    private Integer tipoId;

    @NotNull
    private Integer estadoId;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;

    private String motivo;
}
