package com.example.portal.softportal.DTOs;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudEstadoMasivoDto {

    @NotEmpty
    private List<Integer> solicitudIds;

    @NotNull
    private Integer actorUserId;

    @NotNull
    private String estadoNombre;
}
