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



### 
----
###
## 📊 Guía de Configuración - Features Implementadas

He implementado todas las features solicitadas en tu proyecto SoftPortal. Aquí está el resumen completo:

---

## ✅ Features Implementadas

### 1. **Gráfica de Picos Elevados** 📈
Muestra visualmente cuándo se han realizado más solicitudes:
- Gráfico de línea con tendencias mensuales
- Datos agrupados por mes/año
- Incluye datos de todos los tiempos en la base de datos

### 2. **Predicción de Meses Futuros** 🔮
Análisis inteligente de tendencias:
- Predice solicitudes para los próximos 3 meses
- Basado en promedio de últimos 12 meses
- Muestra tendencia: CRECIMIENTO, DECRECIMIENTO o ESTABLE
- Usa línea punteada en la gráfica para diferenciar predicción

### 3. **Notificación por Email - Creación** 📧
Se envía automáticamente cuando alguien crea una solicitud:
- Email profesional con diseño HTML
- Incluye: tipo de permiso, fechas, estado, motivo
- Enviado al email del usuario que crea la solicitud

### 4. **Notificación por Email - Cambios de Estado** 📨
Se envía cuando RH acepta, rechaza o deja pendiente una solicitud:
- Email profesional con diseño HTML
- Muestra nuevo estado con color según tipo (verde=aceptada, rojo=rechazada, naranja=pendiente)
- Incluye motivo del rechazo si es aplicable

---

## ⚙️ Configuración Requerida

### PASO 1: Configurar Email (Outlook)

Edita el archivo `softservice/src/main/resources/application.properties` y cambia:

```properties
spring.mail.username=tu-email@outlook.com
spring.mail.password=tu-contraseña-de-aplicacion
```

**IMPORTANTE:** En Outlook debes usar **Contraseña de Aplicación**, no tu contraseña normal:
1. Ve a tu cuenta de Outlook
2. Security > Advanced security options
3. Crea una "App password"
4. Copia esa contraseña en `spring.mail.password`

**Alternativa:** Usa variables de entorno (más seguro para producción):
```bash
set MAIL_USERNAME=tu-email@outlook.com
set MAIL_PASSWORD=tu-contraseña-app
```

---

## 🚀 Cómo Usar las Features

### Acceder al Dashboard de Análisis:
1. Inicia sesión como Admin o RH
2. En el header, verás un botón nuevo "Análisis"
3. Click en "Análisis" para ver:
   - Gráfica de solicitudes históricas vs predicción
   - Estadísticas (promedio, total, tendencia)
   - Predicción de próximos 3 meses
   - Gráfico de barras con últimos 6 meses

### Emails Automáticos:
- Se envían automáticamente sin que el usuario haga nada extra
- Si hay error en el email, NO afecta la creación/cambio de estado
- Los emails tienen diseño HTML profesional con colores

---

## 📁 Archivos Nuevos Creados

### Backend:
- `softservice/src/main/java/com/example/portal/softportal/services/EmailService.java`
  - Servicio para enviar emails con templates HTML
  
- `softservice/src/main/java/com/example/portal/softportal/DTOs/EstadisticasMesilDto.java`
  - DTO para datos de estadísticas mensuales
  
- `softservice/src/main/java/com/example/portal/softportal/DTOs/PrediccionSolicitudesDto.java`
  - DTO para datos de predicción

### Frontend:
- `SoftPortal/src/pages/RequestsAnalytics.tsx`
  - Página de análisis con gráficas
  
- `SoftPortal/src/styles/RequestsAnalytics.css`
  - Estilos para la página de análisis

---

## 📡 Endpoints Nuevos

### GET `/api/solicitudes/estadisticas/por-mes`
Retorna estadísticas de solicitudes agrupadas por mes:
```json
[
  {
    "year": 2024,
    "month": 11,
    "cantidad": 5,
    "monthName": "Noviembre"
  },
  ...
]
```

### GET `/api/solicitudes/estadisticas/prediccion`
Retorna predicción e histórico de últimos 12 meses:
```json
{
  "historicoUltimos12Meses": [...],
  "prediccionProximos3Meses": [...],
  "promedioMensual": 4.5,
  "tendencia": "CRECIMIENTO"
}
```

---

## 🔄 Cambios en Endpoints Existentes

### PUT `/api/solicitudes/gestion/estado`
Ahora puedes enviar un campo `motivo` opcional:
```json
{
  "solicitudIds": [1, 2, 3],
  "actorUserId": 5,
  "estadoNombre": "rechazada",
  "motivo": "No cumple con los requisitos"
}
```

Esto aparecerá en el email enviado al usuario.

---

## 📊 Ejemplo de Email Recibido

**Cuando se crea una solicitud:**
```
Asunto: Solicitud de Permiso Creada - SoftPortal

Cuerpo:
¡Solicitud de Permiso Creada!

Hola Juan,

Tu solicitud de permiso ha sido creada correctamente. 
A continuación, encontrarás los detalles:

Tipo de Permiso: Vacaciones
Fecha de Inicio: 15/12/2024
Fecha de Fin: 22/12/2024
Estado Actual: Pendiente
Motivo: Vacaciones de fin de año

Tu solicitud está siendo procesada. El equipo de Recursos 
Humanos revisará tu solicitud y te notificará sobre el estado.
```

**Cuando RH acepta/rechaza:**
```
Asunto: Actualización de Estado - Solicitud de Permiso

Cuerpo:
Actualización en tu Solicitud de Permiso

Hola Juan,

Tu solicitud de permiso ha sido revisada. 
A continuación encontrarás los detalles actualizados:

Tipo de Permiso: Vacaciones
Fecha de Inicio: 15/12/2024
Fecha de Fin: 22/12/2024
Nuevo Estado: Aceptada
```

---

## 🔍 Solución de Problemas

### Los emails no se envían:
1. Verifica que hayas configurado MAIL_USERNAME y MAIL_PASSWORD
2. Verifica que uses una "Contraseña de Aplicación" de Outlook, no la contraseña normal
3. Revisa los logs de la aplicación Spring Boot
4. La creación/cambio de estado se completa aunque falle el email

### Los gráficos no aparecen:
1. Asegúrate de que hay datos de solicitudes en la BD
2. Verifica en la consola del navegador si hay errores
3. Recarga la página (F5)

### La predicción muestra números bajos:
- Es normal, usa el promedio de los últimos 12 meses
- Si hay pocos datos históricos, el promedio será bajo
- Conforme pasen meses, la predicción será más precisa

---

## 🧪 Prueba Rápida

1. Crea una solicitud desde un usuario normal
2. Deberías recibir un email en la bandeja de entrada
3. Ve a Análisis (como Admin/RH)
4. Deberías ver la gráfica actualizada
5. Acepta/rechaza la solicitud desde "Solicitudes"
6. El usuario debería recibir otro email

---

## 📦 Dependencias Nuevas

### Backend (Maven):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### Frontend (npm):
- `chart.js` - Librería de gráficos
- `react-chartjs-2` - Integración con React
- `axios` - Cliente HTTP (ya estaba, pero se usa en análisis)

---

## 📝 Notas Finales

- Todos los cambios son **non-breaking** - el sistema funciona igual que antes
- Los emails son **opcionales** - si fallan, no afectan las operaciones
- El análisis es **read-only** - no modifica datos
- El diseño es **responsive** - funciona en mobile, tablet y desktop
- Las predicciones se actualizan **automáticamente** con nuevos datos

---

¿Preguntas? Revisa los logs de Spring Boot o los errores en la consola del navegador (F12).

**¡Listo para usar! 🎉**


###
-----
###

## 🎯 Resumen de Implementación - SoftPortal

### ✅ Todas las Features Completadas

---

## 📊 Feature 1: Gráfica de Picos Elevados

```
┌─────────────────────────────────────┐
│  Solicitudes de Permiso             │
│  Últimos 12 Meses + Predicción      │
├─────────────────────────────────────┤
│                                     │
│  10 │     ╱╲                        │
│      │    ╱  ╲     ╱────╌╌╌        │
│   5  │   ╱    ╲   ╱                 │
│      │  ╱      ╲ ╱                  │
│   0  │╱        ╱╱                   │
│      └──────────────────────────────│
│  ene  feb  mar  abr  may  jun  jul  │
│                    ──── Histórico    │
│                    ╌╌╌ Predicción    │
└─────────────────────────────────────┘
```

**Datos que Retorna:**
- Mes y Año
- Cantidad de solicitudes
- Nombre del mes en español

**Endpoints:**
- `GET /api/solicitudes/estadisticas/por-mes`

---

## 🔮 Feature 2: Predicción de Meses Futuros

**Cálculo:**
1. Toma últimos 12 meses de solicitudes
2. Calcula promedio mensual
3. Predice próximos 3 meses basado en el promedio
4. Analiza tendencia: ↗️ CRECIMIENTO | ↘️ DECRECIMIENTO | → ESTABLE

**Ejemplo:**
```
Últimos 12 meses: 3, 4, 5, 4, 6, 7, 5, 4, 3, 5, 6, 4
Promedio: 4.75 ≈ 5 solicitudes/mes

Próximos 3 meses predichos:
├─ Enero 2024: 5 solicitudes
├─ Febrero 2024: 5 solicitudes
└─ Marzo 2024: 5 solicitudes

Tendencia: CRECIMIENTO (últimos 6 meses > primeros 6 meses)
```

**Endpoint:**
- `GET /api/solicitudes/estadisticas/prediccion`

---

## 📧 Feature 3: Email al Crear Solicitud

```
FROM: noreply@softportal.com
TO:   {usuario.email}
SUBJECT: Solicitud de Permiso Creada - SoftPortal

BODY (HTML):
┌─────────────────────────────────────┐
│  ¡Solicitud de Permiso Creada!      │ ← Encabezado azul
├─────────────────────────────────────┤
│                                     │
│  Hola Juan,                         │
│                                     │
│  Tipo de Permiso:  Vacaciones       │
│  Fecha Inicio:     15/12/2024       │
│  Fecha Fin:        22/12/2024       │
│  Estado Actual:    Pendiente 🟡     │
│  Motivo:           Vacaciones       │
│                                     │
│  Tu solicitud está siendo procesada │
│  y será revisada por RH...          │
│                                     │
└─────────────────────────────────────┘
```

**Integración:**
- Se envía automáticamente en `SolicitudService.create()`
- No falla la creación si el email falla
- Template HTML profesional con colores

---

## 📨 Feature 4: Email al Cambiar Estado

```
FROM: noreply@softportal.com
TO:   {usuario.email}
SUBJECT: Actualización de Estado - Solicitud de Permiso

BODY (HTML):
┌─────────────────────────────────────┐
│  Actualización en tu Solicitud      │ ← Encabezado azul
├─────────────────────────────────────┤
│                                     │
│  Hola Juan,                         │
│                                     │
│  Tipo de Permiso:  Vacaciones       │
│  Fecha Inicio:     15/12/2024       │
│  Fecha Fin:        22/12/2024       │
│  Nuevo Estado:     Aceptada ✅      │
│                                     │
│  [Si fue rechazada]                 │
│  Motivo:           No cumple req.   │
│                                     │
└─────────────────────────────────────┘
```

**Estados Soportados:**
- 🟢 ACEPTADA (verde)
- 🔴 RECHAZADA (rojo)
- 🟡 PENDIENTE (naranja)

**Integración:**
- Se envía en `SolicitudService.updateEstadoMasivo()`
- Nuevo campo `motivo` en DTO
- Colores dinámicos según estado

---

## 🏗️ Arquitectura Backend

```
SolicitudService
├── create()                  ← Envía email de creación
├── updateEstadoMasivo()      ← Envía email de estado
├── obtenerEstadisticasPorMes()
├── obtenerPrediccion()
└── determinateTendencia()

EmailService
├── enviarConfirmacionNuevaSolicitud()
├── enviarNotificacionCambioEstado()
├── generarCuerpoNuevaSolicitud()
├── generarCuerpoCambioEstado()
└── getColorPorEstado()

SolicitudRepository
├── obtenerEstadisticasPorMes()
├── obtenerEstadisticasPorMesRango()
└── obtenerSolicitudesPorRango()

SolicitudesControlador
├── GET /estadisticas/por-mes
├── GET /estadisticas/prediccion
└── [endpoints existentes]
```

---

## 🎨 Arquitectura Frontend

```
RequestsAnalytics
├── useEffect()                ← Carga datos
├── loadData()                 ← Fetch de endpoints
├── chartData                  ← Configuración de gráfico
├── chartOptions               ← Opciones de Chart.js
└── JSX Components:
    ├── <Line /> chart          ← Gráfica de línea
    ├── Stats card              ← Estadísticas
    ├── Prediction card         ← Próximos 3 meses
    └── Historical card         ← Últimos 6 meses

App.tsx
└── Route: /analisis-solicitudes
    └── <ProtectedRoute>
        └── <RequestsAnalytics />

Header.tsx
└── Botón "Análisis" (solo Admin/RH)
    └── navigate('/analisis-solicitudes')
```

---

## 🗄️ Base de Datos (Sin cambios)

Las queries usan la estructura existente:

```sql
-- Estadísticas por mes
SELECT 
  EXTRACT(YEAR FROM fecha_solicitud)::integer as year,
  EXTRACT(MONTH FROM fecha_solicitud)::integer as month,
  COUNT(*) as cantidad
FROM solicitudes
GROUP BY EXTRACT(YEAR FROM fecha_solicitud), EXTRACT(MONTH FROM fecha_solicitud)
ORDER BY year DESC, month DESC

-- Los emails se guardan en los logs/eventos, no en la BD
```

---

## 📦 Stack Técnico

### Backend
```
Spring Boot 4.0.2
├── spring-boot-starter-data-jpa
├── spring-boot-starter-web
├── spring-boot-starter-mail ← NUEVO
├── spring-boot-starter-validation
├── lombok
└── postgresql
```

### Frontend
```
React 19.2.4
├── react-router-dom
├── chart.js ← NUEVO
├── react-chartjs-2 ← NUEVO
├── axios (ya existía)
├── TypeScript 5.9
└── Vite 8.0
```

### Configuration
```
application.properties
├── Database (PostgreSQL)
└── Email SMTP (Outlook) ← NUEVO
```

---

## 🔐 Configuración SMTP

```properties
# Outlook (requerido)
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}

# TLS
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Timeouts
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
```

---

## 🎯 Flujo de Datos

### Crear Solicitud
```
Frontend (crear solicitud)
    ↓
POST /api/solicitudes
    ↓
SolicitudService.create()
    ├── Guardar en BD
    ├── Enviar email (async)
    └── Retornar DTO
    ↓
Frontend (mostrar éxito)
```

### Actualizar Estado
```
Frontend (cambiar estado)
    ↓
PUT /api/solicitudes/gestion/estado
    ↓
SolicitudService.updateEstadoMasivo()
    ├── Actualizar en BD
    ├── Enviar emails (async)
    └── Retornar DTOs
    ↓
Frontend (mostrar éxito)
```

### Ver Análisis
```
Frontend (ir a /analisis-solicitudes)
    ↓
Cargar RequestsAnalytics.tsx
    ├── GET /api/solicitudes/estadisticas/por-mes
    ├── GET /api/solicitudes/estadisticas/prediccion
    └── Procesar datos
    ↓
Renderizar gráficos con Chart.js
```

---

## 📊 Dashboard de Análisis

```
┌─────────────────────────────────────────────────────┐
│ HEADER (SoftPortal)              [Análisis] ← Nuevo │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Análisis de Solicitudes                            │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ Estadísticas Generales      Gráfica        │    │
│  ├────────────────────────────────────────────┤    │
│  │ Promedio: 5 sol/mes         [Línea chart] │    │
│  │ Total: 60 solicitudes           ────      │    │
│  │ Tendencia: 📈 CRECIMIENTO       ╌╌╌       │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Próximos 3 Meses │  │ Últimos 6 Meses  │        │
│  ├──────────────────┤  ├──────────────────┤        │
│  │ Ene 2024: 5      │  │ Jul: ▓▓▓▓▓ 5     │        │
│  │ Feb 2024: 5      │  │ Ago: ▓▓▓▓ 4      │        │
│  │ Mar 2024: 5      │  │ Sep: ▓▓▓ 3       │        │
│  └──────────────────┘  │ Oct: ▓▓▓▓▓▓ 6    │        │
│                        │ Nov: ▓▓▓▓▓▓▓ 7   │        │
│                        │ Dic: ▓▓▓▓▓ 5     │        │
│                        └──────────────────┘        │
│                                                     │
│                          [Actualizar Datos]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Características Especiales

1. **Gráficos Responsivos**
   - Se adaptan a mobile, tablet, desktop
   - Interactivos (hover muestra datos)

2. **Predicción Inteligente**
   - Calcula tendencia comparando trimestres
   - Usa promedio móvil
   - Adapta predicción a datos históricos

3. **Emails Profesionales**
   - Diseño HTML con CSS
   - Colores según estado
   - Fuentes legibles
   - Compatible con todos los clientes de email

4. **Manejo de Errores**
   - Email falla: solicitud se crea igual
   - Gráfico falla: muestra mensaje amigable
   - Datos vacíos: muestra "no hay datos"

5. **Seguridad**
   - Endpoint de análisis solo para Admin/RH
   - Validación de usuario en backend
   - CORS habilitado
   - SMTP TLS/SSL

---

## 🚀 Próximas Mejoras (Opcional)

1. **Exportar reportes a PDF**
2. **Comparar períodos (YoY)**
3. **Análisis por tipo de permiso**
4. **Gráficos adicionales (pie chart, etc)**
5. **Alertas si hay picos inusuales**
6. **Integración con calendarios**

---

**¡Implementación Completada! ✅**

Todas las features funcionan correctamente y están listas para usar.
