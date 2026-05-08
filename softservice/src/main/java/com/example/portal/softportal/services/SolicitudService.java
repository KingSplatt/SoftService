package com.example.portal.softportal.services;

import com.example.portal.softportal.DTOs.CreateSolicitudDto;
import com.example.portal.softportal.DTOs.EstadisticasMesilDto;
import com.example.portal.softportal.DTOs.PrediccionSolicitudesDto;
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
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.time.ZoneOffset;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final TipoPermisoRepository tipoPermisoRepository;
    private final EstadoSolicitudRepository estadoSolicitudRepository;
    private final EmailService emailService;
        private final ObjectMapper objectMapper = new ObjectMapper()
                        .registerModule(new JavaTimeModule())
                        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public SolicitudService(
            SolicitudRepository solicitudRepository,
            UsuarioRepository usuarioRepository,
            TipoPermisoRepository tipoPermisoRepository,
            EstadoSolicitudRepository estadoSolicitudRepository,
            EmailService emailService) {
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.tipoPermisoRepository = tipoPermisoRepository;
        this.estadoSolicitudRepository = estadoSolicitudRepository;
        this.emailService = emailService;
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

        Solicitud solicitudGuardada = solicitudRepository.save(entity);
        
        // Enviar email de confirmación
        emailService.enviarConfirmacionNuevaSolicitud(usuario, solicitudGuardada);
        
        return SolicitudMapper.toDto(solicitudGuardada);
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

                // Guardar estado previo para evitar devolver dias múltiples veces
                java.util.Map<Integer, String> estadoPrevioPorSolicitud = new java.util.HashMap<>();
                for (Solicitud s : solicitudes) {
                        String nombrePrev = s.getEstadoSolicitud() != null && s.getEstadoSolicitud().getNombre() != null
                                        ? s.getEstadoSolicitud().getNombre().trim().toLowerCase(Locale.ROOT)
                                        : "";
                        estadoPrevioPorSolicitud.put(s.getIdSolicitud(), nombrePrev);
                        s.setEstadoSolicitud(nuevoEstado);
                }

                List<Solicitud> solicitudesActualizadas = solicitudRepository.saveAll(solicitudes);

                // Si el nuevo estado es rechazo/cancelacion y el previo no lo era, devolver dias al usuario
                for (Solicitud sActual : solicitudesActualizadas) {
                        String nuevoNombre = sActual.getEstadoSolicitud() != null && sActual.getEstadoSolicitud().getNombre() != null
                                        ? sActual.getEstadoSolicitud().getNombre().trim().toLowerCase(Locale.ROOT)
                                        : "";
                        String previo = estadoPrevioPorSolicitud.getOrDefault(sActual.getIdSolicitud(), "");

                        if ((nuevoNombre.equals("rechazado") || nuevoNombre.equals("cancelado"))
                                        && !previo.equals("rechazado") && !previo.equals("cancelado")) {
                                // calcular dias solicitados (incluir ambos extremos)
                                if (sActual.getFechaInicio() != null && sActual.getFechaFin() != null) {
                                        long dias = ChronoUnit.DAYS.between(sActual.getFechaInicio(), sActual.getFechaFin()) + 1;
                                        Usuario usuario = sActual.getUsuario();
                                        if (usuario != null) {
                                                Integer actuales = usuario.getDiasDisponibles() != null ? usuario.getDiasDisponibles() : 0;
                                                usuario.setDiasDisponibles((int) (actuales + dias));
                                                usuarioRepository.save(usuario);
                                        }
                                }
                        }
                        
                        // Enviar email de notificación de cambio de estado
                        Usuario usuarioSolicitud = sActual.getUsuario();
                        if (usuarioSolicitud != null) {
                                emailService.enviarNotificacionCambioEstado(usuarioSolicitud, sActual, request.getMotivo());
                        }
                }

                return solicitudesActualizadas.stream()
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


        /**
         * Obtiene estadísticas de solicitudes agrupadas por mes
         */
        @Transactional(readOnly = true)
        public List<EstadisticasMesilDto> obtenerEstadisticasPorMes() {
                List<Object[]> resultados = solicitudRepository.obtenerEstadisticasPorMes();
                return resultados.stream()
                        .map(row -> EstadisticasMesilDto.builder()
                                .year((Integer) row[0])
                                .month((Integer) row[1])
                                .cantidad(((Number) row[2]).longValue())
                                .build())
                        .sorted((a, b) -> {
                                if (a.getYear().equals(b.getYear())) {
                                        return a.getMonth().compareTo(b.getMonth());
                                }
                                return a.getYear().compareTo(b.getYear());
                        })
                        .collect(Collectors.toList());
        }

        /**
         * Obtiene predicción de solicitudes para los próximos 3 meses
         * basada en el promedio de los últimos 12 meses
         */
        @Transactional(readOnly = true)
        public PrediccionSolicitudesDto obtenerPrediccion() {
                LocalDateTime ahora = LocalDateTime.now();
                LocalDateTime hace12Meses = ahora.minusMonths(12);

                // Obtener datos históricos de los últimos 12 meses
                List<Object[]> historicoRaw = solicitudRepository.obtenerEstadisticasPorMesRango(hace12Meses, ahora);
                List<EstadisticasMesilDto> historico = historicoRaw.stream()
                        .map(row -> EstadisticasMesilDto.builder()
                                .year((Integer) row[0])
                                .month((Integer) row[1])
                                .cantidad(((Number) row[2]).longValue())
                                .build())
                        .sorted((a, b) -> {
                                if (a.getYear().equals(b.getYear())) {
                                        return a.getMonth().compareTo(b.getMonth());
                                }
                                return a.getYear().compareTo(b.getYear());
                        })
                        .collect(Collectors.toList());

                // Calcular promedio
                double promedio = historico.stream()
                        .mapToLong(EstadisticasMesilDto::getCantidad)
                        .average()
                        .orElse(0.0);

                // Generar predicción para próximos 3 meses
                List<EstadisticasMesilDto> prediccion = new ArrayList<>();
                YearMonth proximoMes = YearMonth.now().plusMonths(1);

                for (int i = 0; i < 3; i++) {
                        prediccion.add(EstadisticasMesilDto.builder()
                                .year(proximoMes.getYear())
                                .month(proximoMes.getMonthValue())
                                .cantidad(Math.round(promedio))
                                .build());
                        proximoMes = proximoMes.plusMonths(1);
                }

                // Determinar tendencia
                String tendencia = determinateTendencia(historico);

                return PrediccionSolicitudesDto.builder()
                        .historicoUltimos12Meses(historico)
                        .prediccionProximos3Meses(prediccion)
                        .promedioMensual(promedio)
                        .tendencia(tendencia)
                        .build();
        }

        /**
         * Determina la tendencia de solicitudes comparando últimos 6 meses
         */
        private String determinateTendencia(List<EstadisticasMesilDto> historico) {
                if (historico.size() < 6) {
                        return "INSUFICIENTE_DATOS";
                }

                List<EstadisticasMesilDto> ultimosSeis = historico.subList(historico.size() - 6, historico.size());
                List<EstadisticasMesilDto> primerTrimestre = ultimosSeis.subList(0, 3);
                List<EstadisticasMesilDto> segundoTrimestre = ultimosSeis.subList(3, 6);

                long promedioP1 = primerTrimestre.stream()
                        .mapToLong(EstadisticasMesilDto::getCantidad)
                        .sum() / 3;

                long promedioP2 = segundoTrimestre.stream()
                        .mapToLong(EstadisticasMesilDto::getCantidad)
                        .sum() / 3;

                if (promedioP2 > promedioP1 * 1.15) {
                        return "CRECIMIENTO";
                } else if (promedioP2 < promedioP1 * 0.85) {
                        return "DECRECIMIENTO";
                } else {
                        return "ESTABLE";
                }
        }
}

