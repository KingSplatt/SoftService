package com.example.portal.softportal.mapper;

import com.example.portal.softportal.DTOs.RoleDto;
import com.example.portal.softportal.models.Role;

public final class RoleMapper {

    private RoleMapper() {
    }

    public static RoleDto toDto(Role entity) {
        if (entity == null) {
            return null;
        }
        return RoleDto.builder()
                .idRol(entity.getIdRol())
                .nombre(entity.getNombre())
                .build();
    }
}
