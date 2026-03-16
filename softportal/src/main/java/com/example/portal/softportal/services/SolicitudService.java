package com.example.portal.softportal.services;

import com.example.portal.softportal.DTOs.CreateSolicitudDto;
import com.example.portal.softportal.DTOs.SolicitudDto;
import com.example.portal.softportal.mapper.SolicitudMapper;
import com.example.portal.softportal.models.EstadoSolicitud;
import com.example.portal.softportal.models.Solicitud;
import com.example.portal.softportal.models.TipoPermiso;
import com.example.portal.softportal.models.Usuario;
import com.example.portal.softportal.repository.EstadoSolicitudRepository;
import com.example.portal.softportal.repository.SolicitudRepository;
import com.example.portal.softportal.repository.TipoPermisoRepository;
import com.example.portal.softportal.repository.UsuarioRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final TipoPermisoRepository tipoPermisoRepository;
    private final EstadoSolicitudRepository estadoSolicitudRepository;

    public SolicitudService(
            SolicitudRepository solicitudRepository,
            UsuarioRepository usuarioRepository,
            TipoPermisoRepository tipoPermisoRepository,
            EstadoSolicitudRepository estadoSolicitudRepository) {
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.tipoPermisoRepository = tipoPermisoRepository;
        this.estadoSolicitudRepository = estadoSolicitudRepository;
    }

    @Transactional(readOnly = true)
    public List<SolicitudDto> findAll() {
        return solicitudRepository.findAll().stream()
                .map(SolicitudMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SolicitudDto> findByUsuario(Integer usuarioId) {
        return solicitudRepository.findByUsuarioIdUsuario(usuarioId).stream()
                .map(SolicitudMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SolicitudDto findById(Integer id) {
        return solicitudRepository.findById(id)
                .map(SolicitudMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada con id: " + id));
    }

    public SolicitudDto create(CreateSolicitudDto dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id: " + dto.getUsuarioId()));

        TipoPermiso tipoPermiso = tipoPermisoRepository.findById(dto.getTipoId())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de permiso no encontrado con id: " + dto.getTipoId()));

        EstadoSolicitud estadoSolicitud = estadoSolicitudRepository.findById(dto.getEstadoId())
                .orElseThrow(() -> new IllegalArgumentException("Estado no encontrado con id: " + dto.getEstadoId()));

        Solicitud entity = Solicitud.builder()
                .usuario(usuario)
                .tipoPermiso(tipoPermiso)
                .estadoSolicitud(estadoSolicitud)
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .motivo(dto.getMotivo())
                .build();

        return SolicitudMapper.toDto(solicitudRepository.save(entity));
    }
}
