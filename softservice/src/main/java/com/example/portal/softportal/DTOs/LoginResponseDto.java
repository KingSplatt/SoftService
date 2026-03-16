package com.example.portal.softportal.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class LoginResponseDto {
    private String token;
    
    @JsonProperty("user")
    private UserLoginDto user;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserLoginDto {
        @JsonProperty("id")
        private Integer idUsuario;
        
        private String email;
        
        @JsonProperty("nombre_usuario")
        private String nombreUsuario;
        
        @JsonProperty("id_rol")
        private Integer idRol;
        
        @JsonProperty("rol_nombre")
        private String rolNombre;
        
        @JsonProperty("dias_disponibles")
        private Integer diasDisponibles;
        
        @JsonProperty("fecha_creacion")
        private LocalDateTime fechaCreacion;
    }
}
