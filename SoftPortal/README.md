# SoftPortal

Manual de usuario del portal de gestión de permisos y solicitudes de personal.

Si necesitas la información de instalación, configuración y estructura interna, revisa el [Manual Técnico](MANUAL_TECNICO.md).
Si necesitas el detalle de requerimientos, revisa el [README de Requisitos](README_REQUISITOS.md).

## Descripcion general

SoftPortal permite a los colaboradores consultar su calendario de permisos, registrar solicitudes y revisar su historial. El personal de Recursos Humanos puede gestionar solicitudes en lote y generar reportes, mientras que el administrador puede además asignar roles de usuario.

## Requisitos previos

- Node.js 20 o superior para el frontend.
- Java 21 para el backend.
- PostgreSQL en ejecucion local o un servidor equivalente.
- Backend disponible en `http://localhost:8080`.

## Estructura del sistema

- Frontend: interfaz web en React + Vite.
- Backend: API REST en Spring Boot.
- Base de datos: PostgreSQL.

## Instalacion y ejecucion

### 1. Iniciar el backend

Desde la carpeta `softservice`:

```bash
./mvnw spring-boot:run
```

En Windows puedes usar:

```bash
mvnw.cmd spring-boot:run
```

La API expone sus servicios en `http://localhost:8080/api`.

### 2. Iniciar el frontend

Desde la carpeta `SoftPortal`:

```bash
npm install
npm run dev
```

La aplicacion quedara disponible en la direccion que indique Vite, normalmente `http://localhost:5173`.

### 3. Validar la compilacion

```bash
npm run build
npm run lint
```

## Acceso al sistema

### Inicio de sesion

1. Abre la pantalla de login.
2. Ingresa tu correo y contraseña.
3. Pulsa **Iniciar Sesion**.

Credenciales de demostracion:

- Email: `admin@softtek.com`
- Contraseña: `123`

### Registro de usuario

1. En la pantalla de acceso, selecciona **Registrate aqui**.
2. Completa nombre de usuario, correo, contraseña y confirmacion.
3. Pulsa **Crear Cuenta**.
4. Si el registro es correcto, el sistema te redirige al login.

## Roles y permisos

- Colaborador: puede consultar el calendario y revisar sus solicitudes.
- Recursos Humanos: puede gestionar solicitudes y ver reportes.
- Administrador: puede hacer todo lo anterior y administrar roles de usuarios.

El sistema reconoce como perfiles de Recursos Humanos los nombres `rh`, `rrhh`, `recursos humanos` y `recursos_humanos`.

## Pantallas principales

### Dashboard / Calendario

Ruta: `/dashboard`

Desde aqui el colaborador puede:

1. Revisar el calendario mensual.
2. Seleccionar dias disponibles para una solicitud.
3. Abrir la ventana de registro y elegir el tipo de permiso.
4. Enviar la solicitud al backend.

El sistema bloquea dias pasados, dias ya ocupados por colaboradores de la misma area y dias que ya tengan una solicitud pendiente o aprobada del mismo usuario.

### Mis solicitudes

Ruta: `/mis-solicitudes`

Esta pantalla permite:

1. Ver el historial personal de solicitudes.
2. Filtrar por dia, mes y año.
3. Revisar el estado de cada solicitud.
4. Consultar un resumen con solicitudes pendientes, aprobadas y rechazadas.

### Gestion de solicitudes

Ruta: `/solicitudes-gestion`

Disponible para administradores y Recursos Humanos. Permite:

1. Buscar solicitudes por nombre de usuario.
2. Filtrar por fecha.
3. Seleccionar una o varias solicitudes.
4. Cambiar el estado de manera masiva a aprobado, rechazado o pendiente.

### Reportes de solicitudes

Ruta: `/reportes-solicitudes`

Disponible para administradores y Recursos Humanos. Muestra:

1. Totales por estado.
2. Un resumen numerico de solicitudes aprobadas, rechazadas y pendientes.
3. Una grafica comparativa con filtros por dia, mes y año.

### Gestionar roles

Ruta: `/gestion-roles`

Disponible solo para administradores. Desde esta vista se puede:

1. Ver la lista de usuarios.
2. Consultar el rol actual de cada usuario.
3. Asignar un nuevo rol desde un selector.

## Navegacion

La barra superior permite:

- Ir al dashboard.
- Abrir Mis Solicitudes.
- Abrir Gestion de Solicitudes.
- Abrir Reportes.
- Ir a Gestionar Roles si el usuario es administrador.
- Cerrar sesion.

## Configuracion general

- API base del frontend: `http://localhost:8080/api`
- Base de datos por defecto: `jdbc:postgresql://localhost:5432/softservice`
- Usuario por defecto de PostgreSQL: `postgres`
- Contraseña por defecto configurada en el backend: `Disneyxa`

Si necesitas conocer la configuracion detallada del backend, la conexion a la base de datos o los endpoints disponibles, consulta el [Manual Técnico](MANUAL_TECNICO.md).

## Solucion de problemas

- Si no carga el login, revisa que el backend este en ejecucion.
- Si la informacion aparece vacia, confirma que la base de datos tenga datos iniciales.
- Si un usuario no ve una seccion, revisa que su rol sea el correcto.
- Si el frontend marca error de red, verifica que la API responda en `http://localhost:8080/api`.

## Comandos utiles

```bash
npm run dev
npm run build
npm run lint
```

```bash
./mvnw spring-boot:run
```

## Nota

Este manual describe el comportamiento actual de la aplicacion y puede ampliarse con casos de uso especificos o capturas de pantalla cuando el producto final quede estabilizado.
