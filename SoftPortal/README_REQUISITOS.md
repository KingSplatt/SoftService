# SoftPortal - Requisitos del Proyecto

Documento base de requisitos funcionales y no funcionales para el sistema SoftPortal.

## 1. Objetivo

Definir de manera clara y sencilla las capacidades que debe cumplir el sistema para gestionar solicitudes de permisos del personal.

## 2. Alcance funcional

SoftPortal permite:

- Registro e inicio de sesión de usuarios.
- Consulta y creación de solicitudes de permiso.
- Gestión de solicitudes por perfiles administrativos.
- Visualización de reportes de estatus.
- Administración de roles de usuarios.

## 3. Actores del sistema

- Todos: aplica a todos los usuarios autenticados del sistema.
- Colaborador: captura y consulta sus solicitudes.
- RR.HH: gestiona solicitudes y revisa reportes.
- Administrador: gestiona roles y comparte capacidades de RH.

## 4. Requisitos funcionales

| ID | Requisito | Actores | Descripcion | Prioridad |
| --- | --- | --- | --- | --- |
| RF-01 | Autenticación | Todos | El sistema permite iniciar sesión con email y contraseña válidos. | Alta |
| RF-02 | Registro de usuarios | Todos | El sistema permite registrar nuevos usuarios con nombre, correo y contraseña. | Alta |
| RF-03 | Cierre de sesión | Todos | El sistema permite cerrar sesión y limpiar la sesión activa en cliente. | Alta |
| RF-04 | Protección de rutas | Todos | El sistema restringe rutas privadas cuando no existe sesión activa. | Alta |
| RF-05 | Control por rol | Todos | El sistema habilita o deniega secciones según el rol del usuario. | Alta |
| RF-06 | Consulta de calendario | Colaborador | El sistema muestra un calendario para planificar permisos por fecha. | Alta |
| RF-07 | Selección de fechas disponibles | Colaborador | El sistema impide seleccionar fechas no válidas (pasadas, bloqueadas o no disponibles). | Alta |
| RF-08 | Creación de solicitud | Colaborador | El sistema registra solicitudes con tipo de permiso, fechas y motivo. | Alta |
| RF-09 | Consulta de solicitudes personales | Colaborador | El sistema permite visualizar historial de solicitudes y su estado. | Alta |
| RF-10 | Filtros por fecha | Colaborador, RR.HH, Admin | El sistema permite filtrar solicitudes por día, mes y año. | Media |
| RF-11 | Gestión de solicitudes | RR.HH, Admin | El sistema permite seleccionar múltiples solicitudes y actualizar estado (aprobado, rechazado, pendiente). | Alta |
| RF-12 | Reportes de solicitudes | RR.HH, Admin | El sistema muestra totales por estado y visualización gráfica. | Media |
| RF-13 | Gestión de roles | Admin | El sistema permite asignar o modificar roles de usuarios. | Alta |
| RF-14 | Catálogos | Todos | El sistema consume catálogos de roles y tipos de permiso desde el backend. | Media |
| RF-15 | Mensajes de estado | Todos | El sistema muestra retroalimentación visual de éxito o error en operaciones relevantes. | Media |

## 5. Requisitos no funcionales

| ID | Requisito | Actores | Descripcion | Prioridad |
| --- | --- | --- | --- | --- |
| RNF-01 | Usabilidad | Todos | La interfaz debe ser clara, con navegación simple y textos comprensibles para usuarios no técnicos. | Alta |
| RNF-02 | Rendimiento | Todos | Login, carga de pantallas y filtros deben responder en tiempos adecuados para operación diaria. | Alta |
| RNF-03 | Disponibilidad | Todos | El sistema debe estar disponible durante el horario operativo de RR.HH. | Alta |
| RNF-04 | Seguridad de acceso | Todos | El sistema debe proteger rutas por sesión y rol, evitando accesos no autorizados. | Alta |
| RNF-05 | Integridad de datos | Todos | Solicitudes y cambios de estado deben persistirse de forma consistente. | Alta |
| RNF-06 | Mantenibilidad | Todos | El código debe mantenerse modularizado por capas en frontend y backend. | Media |
| RNF-07 | Escalabilidad funcional | Todos | El sistema debe permitir incorporar nuevos roles, tipos de permiso y reportes con cambios controlados. | Media |
| RNF-08 | Portabilidad de entorno | Todos | La solución debe ejecutarse en entorno local de desarrollo con Node.js, Java y PostgreSQL. | Media |
| RNF-09 | Observabilidad mínima | Admin | El backend debe registrar errores y trazas básicas para facilitar diagnóstico técnico. | Media |
| RNF-10 | Compatibilidad | Todos | La interfaz web debe funcionar en navegadores modernos compatibles con React. | Media |

## 6. Supuestos y restricciones

- El backend se ejecuta en `http://localhost:8080`.
- La API base consumida por frontend es `http://localhost:8080/api`.
- La base de datos esperada es PostgreSQL.
- La autorización se basa en el rol recibido en la sesión del usuario.

## 7. Criterios de aceptación generales

- Un usuario sin sesión no puede entrar a rutas protegidas.
- Un usuario con rol Colaborador no puede entrar a gestión/reportes/roles.
- RH y Admin pueden actualizar estados de solicitudes.
- Solo Admin puede cambiar roles de usuarios.
- El usuario puede crear y consultar sus propias solicitudes.

## 8. Trazabilidad simple (modulos)

- Autenticación: Login, Register, useAuth.
- Solicitudes personales: Dashboard, MyRequests.
- Gestión RH/Admin: RequestsManagement, RequestsReports.
- Administración: RoleManagement.
- Backend API: controladores de usuarios, solicitudes, roles y tipos de permiso.

## 9. Nota

Este documento puede evolucionar a una especificación formal con prioridades (Must/Should/Could), criterios de prueba y versión de requisitos por sprint.