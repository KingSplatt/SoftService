
package com.example.portal.softportal.controllers;

import com.example.portal.softportal.DTOs.CreateSolicitudDto;
import com.example.portal.softportal.DTOs.SolicitudEstadoMasivoDto;
import com.example.portal.softportal.DTOs.SolicitudDto;
import com.example.portal.softportal.DTOs.SolicitudReporteResumenDto;
import com.example.portal.softportal.services.SolicitudService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*")
public class SolicitudesControlador {

	private final SolicitudService solicitudService;

	public SolicitudesControlador(SolicitudService solicitudService) {
		this.solicitudService = solicitudService;
	}

	/**
	 * Obtener todas las solicitudes
	 */
	@GetMapping
	public ResponseEntity<List<SolicitudDto>> getAllSolicitudes() {
		try {
			List<SolicitudDto> solicitudes = solicitudService.findAll();
			return ResponseEntity.ok(solicitudes);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Obtener solicitud por ID
	 */
	@GetMapping("/{id}")
	public ResponseEntity<SolicitudDto> getSolicitudById(@PathVariable Integer id) {
		try {
			SolicitudDto solicitud = solicitudService.findById(id);
			return ResponseEntity.ok(solicitud);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Obtener solicitudes por usuario
	 */
	@GetMapping("/usuario/{usuarioId}")
	public ResponseEntity<List<SolicitudDto>> getSolicitudesByUsuario(@PathVariable Integer usuarioId) {
		try {
			List<SolicitudDto> solicitudes = solicitudService.findByUsuario(usuarioId);
			return ResponseEntity.ok(solicitudes);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Crear nueva solicitud
	 */
	@PostMapping
	public ResponseEntity<SolicitudDto> createSolicitud(@RequestBody CreateSolicitudDto request) {
		try {
			SolicitudDto solicitud = solicitudService.create(request);
			return ResponseEntity.status(HttpStatus.CREATED).body(solicitud);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Listado de solicitudes para RH/Admin con filtro opcional por nombre de usuario.
	 */
	@GetMapping("/gestion")
	public ResponseEntity<List<SolicitudDto>> getSolicitudesForManagement(
			@RequestParam Integer actorUserId,
			@RequestParam(required = false) String nombreUsuario) {
		try {
			List<SolicitudDto> solicitudes = solicitudService.findAllForManagement(nombreUsuario, actorUserId);
			return ResponseEntity.ok(solicitudes);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Actualizacion masiva de estado para RH/Admin.
	 */
	@PutMapping("/gestion/estado")
	public ResponseEntity<List<SolicitudDto>> updateEstadoMasivo(@RequestBody SolicitudEstadoMasivoDto request) {
		try {
			List<SolicitudDto> solicitudes = solicitudService.updateEstadoMasivo(request);
			return ResponseEntity.ok(solicitudes);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Reporte de solicitudes por estado con filtros opcionales de fecha.
	 */
	@GetMapping("/reportes")
	public ResponseEntity<SolicitudReporteResumenDto> getReporteSolicitudes(
			@RequestParam Integer actorUserId,
			@RequestParam(required = false) Integer dia,
			@RequestParam(required = false) Integer mes,
			@RequestParam(required = false) Integer anio) {
		try {
			SolicitudReporteResumenDto reporte = solicitudService.getReporte(actorUserId, dia, mes, anio);
			return ResponseEntity.ok(reporte);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
}
