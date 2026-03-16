package com.example.portal.softportal.services;

import com.example.portal.softportal.DTOs.CreateEstadoSolicitudDto;
import com.example.portal.softportal.DTOs.EstadoSolicitudDto;
import com.example.portal.softportal.mapper.EstadoSolicitudMapper;
import com.example.portal.softportal.models.EstadoSolicitud;
import com.example.portal.softportal.repository.EstadoSolicitudRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EstadoSolicitudService {

    private final EstadoSolicitudRepository estadoSolicitudRepository;

    public EstadoSolicitudService(EstadoSolicitudRepository estadoSolicitudRepository) {
        this.estadoSolicitudRepository = estadoSolicitudRepository;
    }

    @Transactional(readOnly = true)
    public List<EstadoSolicitudDto> findAll() {
        return estadoSolicitudRepository.findAll().stream()
                .map(EstadoSolicitudMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EstadoSolicitudDto findById(Integer id) {
        return estadoSolicitudRepository.findById(id)
                .map(EstadoSolicitudMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Estado no encontrado con id: " + id));
    }

    public EstadoSolicitudDto create(CreateEstadoSolicitudDto dto) {
        estadoSolicitudRepository.findByNombre(dto.getNombre()).ifPresent(existing -> {
            throw new IllegalArgumentException("Ya existe un estado con nombre: " + dto.getNombre());
        });
        EstadoSolicitud entity = EstadoSolicitud.builder()
                .nombre(dto.getNombre())
                .build();
        return EstadoSolicitudMapper.toDto(estadoSolicitudRepository.save(entity));
    }
}
