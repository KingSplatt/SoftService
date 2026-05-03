# Manual Técnico de SoftPortal

Documento técnico breve para entender cómo se ejecuta, configura y conecta el sistema.

## 1. Descripcion general

SoftPortal está dividido en dos partes:

- Frontend: aplicación web hecha con React, TypeScript y Vite.
- Backend: API REST desarrollada con Spring Boot y PostgreSQL.

La interfaz consume la API en `http://localhost:8080/api`.

## 2. Estructura del proyecto

- `SoftPortal/`: frontend.
- `softservice/`: backend.
- `softservice/src/main/resources/application.properties`: configuración de la conexión a la base de datos y Swagger.

## 3. Requisitos técnicos

- Node.js 20 o superior.
- Java 21.
- Maven Wrapper incluido en el proyecto.
- PostgreSQL local o remoto.

## 4. Ejecucion local

### Backend

Desde `softservice`:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

### Frontend

Desde `SoftPortal`:

```bash
npm install
npm run dev
```

## 5. Configuracion del backend

El archivo principal de configuracion es:

- [softservice/src/main/resources/application.properties](softservice/src/main/resources/application.properties)

Valores relevantes:

- `spring.datasource.url`: URL de PostgreSQL.
- `spring.datasource.username`: usuario de base de datos.
- `spring.datasource.password`: contraseña de base de datos.
- `spring.jpa.hibernate.ddl-auto=update`: actualiza el esquema automaticamente.
- `springdoc.swagger-ui.path=/swagger-ui.html`: ruta de Swagger.

Variables de entorno soportadas:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

## 6. Endpoints principales

La API usa prefijo `/api` y expone, entre otros, estos grupos:

- `usuarios`: autenticación, registro, listado y cambio de rol.
- `solicitudes`: creación, consulta, gestión masiva y reportes.
- `roles`: catálogo de roles.
- `tipos-permiso`: catálogo de tipos de permiso.

## 7. Rutas del frontend

- `/login`: inicio de sesión.
- `/register`: registro de usuario.
- `/dashboard`: calendario y creación de solicitudes.
- `/mis-solicitudes`: historial personal.
- `/solicitudes-gestion`: gestión para RH y administrador.
- `/reportes-solicitudes`: reportes para RH y administrador.
- `/gestion-roles`: administración de roles.

## 8. Control de acceso

El frontend protege las rutas con autenticación y, cuando aplica, valida roles.

- Admin: acceso completo.
- RH / RRHH: acceso a gestión y reportes.
- Usuario estándar: acceso a dashboard y mis solicitudes.

## 9. Dependencias externas

- PostgreSQL para persistencia.
- SpringDoc Swagger para documentación API.
- Fetch nativo del navegador para consumo de servicios.

## 10. Verificacion rapida

1. Arranca PostgreSQL.
2. Inicia el backend.
3. Abre `http://localhost:8080/swagger-ui.html`.
4. Inicia el frontend.
5. Valida login y navegación por roles.

## 11. Observaciones

- Las credenciales y la cadena de conexión deben revisarse antes de pasar a un entorno real.
- Si cambias el puerto del backend, actualiza también la constante `API_BASE_URL` del frontend.
- Si cambias el esquema o los nombres de campos del backend, revisa los tipos y `fetch` en las páginas del frontend.