package com.example.portal.softportal.services;

import com.example.portal.softportal.DTOs.CreateTipoPermisoDto;
import com.example.portal.softportal.DTOs.TipoPermisoDto;
import com.example.portal.softportal.mapper.TipoPermisoMapper;
import com.example.portal.softportal.models.TipoPermiso;
import com.example.portal.softportal.repository.TipoPermisoRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TipoPermisoService {

    private final TipoPermisoRepository tipoPermisoRepository;

    public TipoPermisoService(TipoPermisoRepository tipoPermisoRepository) {
        this.tipoPermisoRepository = tipoPermisoRepository;
    }

    @Transactional(readOnly = true)
    public List<TipoPermisoDto> findAll() {
        return tipoPermisoRepository.findAll().stream()
                .map(TipoPermisoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TipoPermisoDto findById(Integer id) {
        return tipoPermisoRepository.findById(id)
                .map(TipoPermisoMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de permiso no encontrado con id: " + id));
    }

    public TipoPermisoDto create(CreateTipoPermisoDto dto) {
        tipoPermisoRepository.findByNombre(dto.getNombre()).ifPresent(existing -> {
            throw new IllegalArgumentException("Ya existe un tipo de permiso con nombre: " + dto.getNombre());
        });
        TipoPermiso entity = TipoPermiso.builder()
                .nombre(dto.getNombre())
                .build();
        return TipoPermisoMapper.toDto(tipoPermisoRepository.save(entity));
    }
}
