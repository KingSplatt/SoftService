package com.example.portal.softportal.controllers;

import com.example.portal.softportal.DTOs.CreateTipoPermisoDto;
import com.example.portal.softportal.DTOs.TipoPermisoDto;
import com.example.portal.softportal.services.TipoPermisoService;
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
@RequestMapping("/api/tipos-permiso")
@CrossOrigin(origins = "*")
public class TipoPermisoControlador {

	private final TipoPermisoService tipoPermisoService;

	public TipoPermisoControlador(TipoPermisoService tipoPermisoService) {
		this.tipoPermisoService = tipoPermisoService;
	}

	@GetMapping
	public ResponseEntity<List<TipoPermisoDto>> getAllTiposPermiso() {
		try {
			List<TipoPermisoDto> tipos = tipoPermisoService.findAll();
			return ResponseEntity.ok(tipos);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<TipoPermisoDto> getTipoPermisoById(@PathVariable Integer id) {
		try {
			TipoPermisoDto tipo = tipoPermisoService.findById(id);
			return ResponseEntity.ok(tipo);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping
	public ResponseEntity<TipoPermisoDto> createTipoPermiso(@RequestBody CreateTipoPermisoDto request) {
		try {
			TipoPermisoDto tipo = tipoPermisoService.create(request);
			return ResponseEntity.status(HttpStatus.CREATED).body(tipo);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
}
