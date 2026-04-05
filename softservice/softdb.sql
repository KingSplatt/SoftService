CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE tipos_permiso (
    id_tipo SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE estados_solicitud (
    id_estado SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    dias_disponibles INT DEFAULT 12,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
);

CREATE TABLE solicitudes (
    id_solicitud SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_id INT NOT NULL,
    estado_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_permiso (id_tipo),
    CONSTRAINT fk_estado FOREIGN KEY (estado_id) REFERENCES estados_solicitud (id_estado)
);

-- Datos Iniciales
INSERT INTO roles (nombre) VALUES ('admin'), ('user');
INSERT INTO tipos_permiso (nombre) VALUES ('vacaciones'), ('enfermedad'), ('tramites'), ('homeoffice');
INSERT INTO estados_solicitud (nombre) VALUES ('pendiente'), ('aprobado'), ('rechazado');

-- Usuario Admin
INSERT INTO usuarios (nombre_usuario, email, password_hash, id_rol, dias_disponibles)
VALUES ('admin', 'admin@softtek.com', '123', 1, 0);

-- some queries

SELECT 
    u.nombre_usuario, 
    tp.nombre AS tipo, 
    es.nombre AS estado, 
    s.fecha_inicio, 
    s.motivo
FROM solicitudes s
JOIN usuarios u ON s.usuario_id = u.id_usuario
JOIN tipos_permiso tp ON s.tipo_id = tp.id_tipo
JOIN estados_solicitud es ON s.estado_id = es.id_estado;

select * from roles;

insert into roles (id_rol, nombre) values
('3','Application Support Engineer'),
('4','Service Manager'),
('5','Release Manager'),
('6','Developer'),
('7','Entry Level')

select * from tipos_permiso;

update tipos_permiso set nombre = 'home office' where id_tipo =4

update usuarios set id_rol = 3 where id_usuario = 2;
delete from solicitudes where usuario_id = 2;

INSERT INTO usuarios (nombre_usuario, email, password_hash, id_rol, dias_disponibles)
VALUES 
('Roberto Méndez', 'roberto.mendez@softtek.com', 'Disneyxa1', 2, 16),
('Beatriz Soto', 'beatriz.soto@softtek.com', 'Disneyxa1', 2, 18),
('Ricardo Luna', 'ricardo.luna@softtek.com', 'Disneyxa1', 2, 14),
('Sofía Valenzuela', 'sofia.valenzuela@softtek.com', 'Disneyxa1', 2, 16);