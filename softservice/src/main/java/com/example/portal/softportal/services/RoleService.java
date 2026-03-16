package com.example.portal.softportal.services;

import com.example.portal.softportal.DTOs.CreateRoleDto;
import com.example.portal.softportal.DTOs.RoleDto;
import com.example.portal.softportal.mapper.RoleMapper;
import com.example.portal.softportal.models.Role;
import com.example.portal.softportal.repository.RoleRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleDto> findAll() {
        return roleRepository.findAll().stream()
                .map(RoleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDto findById(Integer id) {
        return roleRepository.findById(id)
                .map(RoleMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con id: " + id));
    }

    public RoleDto create(CreateRoleDto dto) {
        roleRepository.findByNombre(dto.getNombre()).ifPresent(existing -> {
            throw new IllegalArgumentException("Ya existe un rol con nombre: " + dto.getNombre());
        });
        Role entity = Role.builder()
                .nombre(dto.getNombre())
                .build();
        return RoleMapper.toDto(roleRepository.save(entity));
    }
}
