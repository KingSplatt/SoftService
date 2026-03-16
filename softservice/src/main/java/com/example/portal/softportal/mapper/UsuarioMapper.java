package com.example.portal.softportal.mapper;

import com.example.portal.softportal.DTOs.UsuarioDto;
import com.example.portal.softportal.models.Usuario;

public final class UsuarioMapper {

    private UsuarioMapper() {
    }

    public static UsuarioDto toDto(Usuario entity) {
        if (entity == null) {
            return null;
        }
        return UsuarioDto.builder()
                .idUsuario(entity.getIdUsuario())
                .nombreUsuario(entity.getNombreUsuario())
                .email(entity.getEmail())
                .idRol(entity.getRol() != null ? entity.getRol().getIdRol() : null)
                .rolNombre(entity.getRol() != null ? entity.getRol().getNombre() : null)
                .diasDisponibles(entity.getDiasDisponibles())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }
}
