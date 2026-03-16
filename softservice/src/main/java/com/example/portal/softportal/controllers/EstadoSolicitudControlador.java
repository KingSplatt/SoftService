package com.example.portal.softportal.controllers;

import com.example.portal.softportal.DTOs.CreateEstadoSolicitudDto;
import com.example.portal.softportal.DTOs.EstadoSolicitudDto;
import com.example.portal.softportal.services.EstadoSolicitudService;
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
@RequestMapping("/api/estados-solicitud")
@CrossOrigin(origins = "*")
public class EstadoSolicitudControlador {

	private final EstadoSolicitudService estadoSolicitudService;

	public EstadoSolicitudControlador(EstadoSolicitudService estadoSolicitudService) {
		this.estadoSolicitudService = estadoSolicitudService;
	}

	@GetMapping
	public ResponseEntity<List<EstadoSolicitudDto>> getAllEstados() {
		try {
			List<EstadoSolicitudDto> estados = estadoSolicitudService.findAll();
			return ResponseEntity.ok(estados);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<EstadoSolicitudDto> getEstadoById(@PathVariable Integer id) {
		try {
			EstadoSolicitudDto estado = estadoSolicitudService.findById(id);
			return ResponseEntity.ok(estado);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping
	public ResponseEntity<EstadoSolicitudDto> createEstado(@RequestBody CreateEstadoSolicitudDto request) {
		try {
			EstadoSolicitudDto estado = estadoSolicitudService.create(request);
			return ResponseEntity.status(HttpStatus.CREATED).body(estado);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
}
