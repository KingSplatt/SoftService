package com.example.portal.softportal.controllers;

import com.example.portal.softportal.DTOs.CreateUsuarioDto;
import com.example.portal.softportal.DTOs.LoginRequestDto;
import com.example.portal.softportal.DTOs.LoginResponseDto;
import com.example.portal.softportal.DTOs.RegisterUsuarioDto;
import com.example.portal.softportal.DTOs.UpdateUsuarioRolDto;
import com.example.portal.softportal.DTOs.UsuarioDto;
import com.example.portal.softportal.services.UsuarioService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioControlador {

    private final UsuarioService usuarioService;

    public UsuarioControlador(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Endpoint de login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto request) {
        try {
            LoginResponseDto response = usuarioService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint público de registro
     */
    @PostMapping("/register")
    public ResponseEntity<UsuarioDto> register(@RequestBody RegisterUsuarioDto request) {
        try {
            UsuarioDto usuario = usuarioService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener todos los usuarios (requiere autenticación en producción)
     */
    @GetMapping
    public ResponseEntity<List<UsuarioDto>> getAllUsuarios() {
        try {
            List<UsuarioDto> usuarios = usuarioService.findAll();
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener usuario por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDto> getUsuarioById(@PathVariable Integer id) {
        try {
            UsuarioDto usuario = usuarioService.findById(id);
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Crear nuevo usuario
     */
    @PostMapping
    public ResponseEntity<UsuarioDto> createUsuario(@RequestBody CreateUsuarioDto request) {
        try {
            UsuarioDto usuario = usuarioService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Asignar rol a un usuario (solo admin)
     */
    @PostMapping("/{id}/rol")
    public ResponseEntity<UsuarioDto> updateUserRole(@PathVariable Integer id, @RequestBody UpdateUsuarioRolDto request) {
        try {
            UsuarioDto usuario = usuarioService.updateUserRole(id, request.getIdRol(), request.getAdminUserId());
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
