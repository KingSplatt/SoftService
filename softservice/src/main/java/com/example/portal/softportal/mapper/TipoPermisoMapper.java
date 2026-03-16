package com.example.portal.softportal.mapper;

import com.example.portal.softportal.DTOs.TipoPermisoDto;
import com.example.portal.softportal.models.TipoPermiso;

public final class TipoPermisoMapper {

    private TipoPermisoMapper() {
    }

    public static TipoPermisoDto toDto(TipoPermiso entity) {
        if (entity == null) {
            return null;
        }
        return TipoPermisoDto.builder()
                .idTipo(entity.getIdTipo())
                .nombre(entity.getNombre())
                .build();
    }
}
