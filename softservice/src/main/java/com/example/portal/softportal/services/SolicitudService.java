package com.example.portal.softportal.services;

import com.example.portal.softportal.DTOs.CreateSolicitudDto;
import com.example.portal.softportal.DTOs.SolicitudEstadoMasivoDto;
import com.example.portal.softportal.DTOs.SolicitudDto;
import com.example.portal.softportal.DTOs.SolicitudReporteResumenDto;
import com.example.portal.softportal.mapper.SolicitudMapper;
import com.example.portal.softportal.models.EstadoSolicitud;
import com.example.portal.softportal.models.Solicitud;
import com.example.portal.softportal.models.TipoPermiso;
import com.example.portal.softportal.models.Usuario;
import com.example.portal.softportal.repository.EstadoSolicitudRepository;
import com.example.portal.softportal.repository.SolicitudRepository;
import com.example.portal.softportal.repository.TipoPermisoRepository;
import com.example.portal.softportal.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
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

                EstadoSolicitud estadoSolicitud;
                if (isAdminOrRh(usuario)) {
                        if (dto.getEstadoId() != null) {
                                estadoSolicitud = estadoSolicitudRepository.findById(dto.getEstadoId())
                                                .orElseThrow(() -> new IllegalArgumentException("Estado no encontrado con id: " + dto.getEstadoId()));
                        } else {
                                estadoSolicitud = getEstadoPendiente();
                        }
                } else {
                        estadoSolicitud = getEstadoPendiente();
                }

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

        @Transactional(readOnly = true)
        public List<SolicitudDto> findAllForManagement(String nombreUsuario, Integer actorUserId) {
                validateAdminOrRhActor(actorUserId);

                List<Solicitud> solicitudes = (nombreUsuario == null || nombreUsuario.isBlank())
                                ? solicitudRepository.findAll()
                                : solicitudRepository.findByUsuarioNombreUsuarioContainingIgnoreCase(nombreUsuario.trim());

                return solicitudes.stream()
                                .map(SolicitudMapper::toDto)
                                .collect(Collectors.toList());
        }

        public List<SolicitudDto> updateEstadoMasivo(SolicitudEstadoMasivoDto request) {
                validateAdminOrRhActor(request.getActorUserId());

                EstadoSolicitud nuevoEstado = estadoSolicitudRepository.findByNombreIgnoreCase(request.getEstadoNombre())
                                .orElseThrow(() -> new IllegalArgumentException("Estado no encontrado: " + request.getEstadoNombre()));

                List<Solicitud> solicitudes = solicitudRepository.findAllById(request.getSolicitudIds());
                if (solicitudes.size() != request.getSolicitudIds().size()) {
                        throw new IllegalArgumentException("Una o más solicitudes no existen");
                }

                solicitudes.forEach((solicitud) -> solicitud.setEstadoSolicitud(nuevoEstado));

                return solicitudRepository.saveAll(solicitudes).stream()
                                .map(SolicitudMapper::toDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public SolicitudReporteResumenDto getReporte(Integer actorUserId, Integer dia, Integer mes, Integer anio) {
                validateAdminOrRhActor(actorUserId);

                List<Solicitud> solicitudes = solicitudRepository.findAll().stream()
                                .filter((solicitud) -> matchesDateFilter(solicitud, dia, mes, anio))
                                .toList();

                long aprobadas = solicitudes.stream()
                                .filter((solicitud) -> normalizeEstado(solicitud).equals("aprobado"))
                                .count();
                long rechazadas = solicitudes.stream()
                                .filter((solicitud) -> normalizeEstado(solicitud).equals("rechazado"))
                                .count();
                long pendientes = solicitudes.stream()
                                .filter((solicitud) -> normalizeEstado(solicitud).equals("pendiente"))
                                .count();

                return SolicitudReporteResumenDto.builder()
                                .total(solicitudes.size())
                                .aprobadas(aprobadas)
                                .rechazadas(rechazadas)
                                .pendientes(pendientes)
                                .build();
        }

        private String normalizeEstado(Solicitud solicitud) {
                if (solicitud.getEstadoSolicitud() == null || solicitud.getEstadoSolicitud().getNombre() == null) {
                        return "";
                }
                return solicitud.getEstadoSolicitud().getNombre().trim().toLowerCase(Locale.ROOT);
        }

        private boolean matchesDateFilter(Solicitud solicitud, Integer dia, Integer mes, Integer anio) {
                if (solicitud.getFechaSolicitud() == null) {
                        return false;
                }

                LocalDate fecha = solicitud.getFechaSolicitud().toLocalDate();

                if (anio != null && fecha.getYear() != anio) {
                        return false;
                }
                if (mes != null && fecha.getMonthValue() != mes) {
                        return false;
                }
                if (dia != null && fecha.getDayOfMonth() != dia) {
                        return false;
                }
                return true;
        }

        private EstadoSolicitud getEstadoPendiente() {
                return estadoSolicitudRepository.findByNombreIgnoreCase("pendiente")
                                .orElseThrow(() -> new IllegalArgumentException("No existe el estado 'pendiente'"));
        }

        private void validateAdminOrRhActor(Integer actorUserId) {
                Usuario actor = usuarioRepository.findById(actorUserId)
                                .orElseThrow(() -> new IllegalArgumentException("Usuario actor no encontrado"));

                if (!isAdminOrRh(actor)) {
                        throw new IllegalArgumentException("Solo Admin o Recursos Humanos pueden realizar esta accion");
                }
        }

        private boolean isAdminOrRh(Usuario usuario) {
                if (usuario.getRol() == null || usuario.getRol().getNombre() == null) {
                        return false;
                }

                String roleName = usuario.getRol().getNombre().trim().toLowerCase(Locale.ROOT);
                return roleName.equals("admin")
                                || roleName.equals("rh")
                                || roleName.equals("rrhh")
                                || roleName.equals("recursos humanos")
                                || roleName.equals("recursos_humanos");
        }
}
