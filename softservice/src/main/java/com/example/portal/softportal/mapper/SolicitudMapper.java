package com.example.portal.softportal.mapper;

import com.example.portal.softportal.DTOs.SolicitudDto;
import com.example.portal.softportal.models.Solicitud;

public final class SolicitudMapper {

    private SolicitudMapper() {
    }

    public static SolicitudDto toDto(Solicitud entity) {
        if (entity == null) {
            return null;
        }
        return SolicitudDto.builder()
                .idSolicitud(entity.getIdSolicitud())
                .usuarioId(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null)
                .usuarioNombre(entity.getUsuario() != null ? entity.getUsuario().getNombreUsuario() : null)
                .tipoId(entity.getTipoPermiso() != null ? entity.getTipoPermiso().getIdTipo() : null)
                .tipoNombre(entity.getTipoPermiso() != null ? entity.getTipoPermiso().getNombre() : null)
                .estadoId(entity.getEstadoSolicitud() != null ? entity.getEstadoSolicitud().getIdEstado() : null)
                .estadoNombre(entity.getEstadoSolicitud() != null ? entity.getEstadoSolicitud().getNombre() : null)
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .motivo(entity.getMotivo())
                .fechaSolicitud(entity.getFechaSolicitud())
                .build();
    }
}
