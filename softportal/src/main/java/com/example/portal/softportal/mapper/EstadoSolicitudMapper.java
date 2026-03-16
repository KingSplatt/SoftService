package com.example.portal.softportal.mapper;

import com.example.portal.softportal.DTOs.EstadoSolicitudDto;
import com.example.portal.softportal.models.EstadoSolicitud;

public final class EstadoSolicitudMapper {

    private EstadoSolicitudMapper() {
    }

    public static EstadoSolicitudDto toDto(EstadoSolicitud entity) {
        if (entity == null) {
            return null;
        }
        return EstadoSolicitudDto.builder()
                .idEstado(entity.getIdEstado())
                .nombre(entity.getNombre())
                .build();
    }
}
