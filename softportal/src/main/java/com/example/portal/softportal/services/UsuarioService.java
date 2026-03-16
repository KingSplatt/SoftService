package com.example.portal.softportal.services;

import com.example.portal.softportal.DTOs.CreateUsuarioDto;
import com.example.portal.softportal.DTOs.UsuarioDto;
import com.example.portal.softportal.mapper.UsuarioMapper;
import com.example.portal.softportal.models.Role;
import com.example.portal.softportal.models.Usuario;
import com.example.portal.softportal.repository.RoleRepository;
import com.example.portal.softportal.repository.UsuarioRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, RoleRepository roleRepository) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<UsuarioDto> findAll() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioDto findById(Integer id) {
        return usuarioRepository.findById(id)
                .map(UsuarioMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id: " + id));
    }

    public UsuarioDto create(CreateUsuarioDto dto) {
        usuarioRepository.findByEmail(dto.getEmail()).ifPresent(existing -> {
            throw new IllegalArgumentException("Ya existe un usuario con email: " + dto.getEmail());
        });

        Role role = roleRepository.findById(dto.getIdRol())
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con id: " + dto.getIdRol()));

        Usuario entity = Usuario.builder()
                .nombreUsuario(dto.getNombreUsuario())
                .email(dto.getEmail())
                .passwordHash(dto.getPasswordHash())
                .rol(role)
                .diasDisponibles(dto.getDiasDisponibles())
                .build();

        return UsuarioMapper.toDto(usuarioRepository.save(entity));
    }
}
