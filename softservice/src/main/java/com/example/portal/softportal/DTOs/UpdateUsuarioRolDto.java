package com.example.portal.softportal.DTOs;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUsuarioRolDto {

    @NotNull
    private Integer idRol;

    @NotNull
    private Integer adminUserId;
}
