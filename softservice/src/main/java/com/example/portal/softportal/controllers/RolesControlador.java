package com.example.portal.softportal.controllers;

import com.example.portal.softportal.DTOs.CreateRoleDto;
import com.example.portal.softportal.DTOs.RoleDto;
import com.example.portal.softportal.services.RoleService;
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
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RolesControlador {

	private final RoleService roleService;

	public RolesControlador(RoleService roleService) {
		this.roleService = roleService;
	}

	@GetMapping
	public ResponseEntity<List<RoleDto>> getAllRoles() {
		try {
			List<RoleDto> roles = roleService.findAll();
			return ResponseEntity.ok(roles);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<RoleDto> getRoleById(@PathVariable Integer id) {
		try {
			RoleDto role = roleService.findById(id);
			return ResponseEntity.ok(role);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping
	public ResponseEntity<RoleDto> createRole(@RequestBody CreateRoleDto request) {
		try {
			RoleDto role = roleService.create(request);
			return ResponseEntity.status(HttpStatus.CREATED).body(role);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
}
