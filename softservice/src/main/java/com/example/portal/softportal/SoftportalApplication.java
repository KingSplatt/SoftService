package com.example.portal.softportal;

import com.example.portal.softportal.models.Role;
import com.example.portal.softportal.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SoftportalApplication {

	public static void main(String[] args) {
		SpringApplication.run(SoftportalApplication.class, args);
	}

	@Bean
	CommandLineRunner seedDefaultRoles(RoleRepository roleRepository) {
		return args -> {
			roleRepository.findByNombreIgnoreCase("Recursos Humanos")
					.orElseGet(() -> roleRepository.save(Role.builder().nombre("Recursos Humanos").build()));
		};
	}

}
