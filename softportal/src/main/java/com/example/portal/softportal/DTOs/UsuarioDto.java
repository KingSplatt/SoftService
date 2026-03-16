package com.example.portal.softportal.DTOs;

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
public class UsuarioDto {
    private Integer idUsuario;
    private String nombreUsuario;
    private String email;
    private Integer idRol;
    private String rolNombre;
    private Integer diasDisponibles;
    private LocalDateTime fechaCreacion;
}
