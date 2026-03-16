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