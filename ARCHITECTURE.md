# Arquitectura del Portal de Aplicaciones Institucionales UTZMG
**Universidad Tecnológica de la Zona Metropolitana de Guadalajara**

---

## 1. Objetivo

Diseñar e implementar una plataforma institucional centralizada, moderna, segura y escalable que funcione como **Portal de Aplicaciones Institucionales de la UTZMG**.

El portal actúa como el **punto único de entrada (Single Point of Entry / Launchpad)** para la comunidad universitaria (Directivos, Coordinadores, Tutores, Docentes, Estudiantes, Personal Administrativo), permitiendo:
1. Iniciar sesión institucional mediante cuentas `@utzmg.edu.mx` (Google Workspace / OpenID Connect).
2. Determinar de forma dinámica las aplicaciones y módulos a los que el usuario tiene acceso según sus roles y permisos.
3. Administrar el catálogo institucional de aplicaciones y la matriz de roles sin necesidad de modificar el código fuente del portal ni de las aplicaciones conectadas.
4. Facilitar una integración desacoplada y progresiva hacia Single Sign-On (SSO) con aplicaciones construidas en tecnologías heterogéneas (Google Apps Script, Node.js/React, Python, Java, PHP, .NET, etc.).
5. Mantener un registro exhaustivo de auditoría y trazabilidad de accesos y cambios de configuración institucional.

---

## 2. Análisis del Estado Actual de las Aplicaciones

Tras la inspección técnica directa de los proyectos existentes en la institución:

| Criterio | Aplicación 1: Gestión de Tutorías | Aplicación 2: Evaluación de Proyectos Integradores |
| :--- | :--- | :--- |
| **Ubicación / Proyecto** | `Tutorias-app` | `Evaluacion Proyectos` (`evaluacion-proyectos`) |
| **Pila Tecnológica** | Google Apps Script (Web App) + HTML5 + Google Cloud Firestore + Google Sheets/Drive | React + TypeScript (Frontend) / Node.js + Express + TypeScript (Backend) / MongoDB Atlas |
| **Mecanismo de Autenticación Actual** | `Session.getActiveUser().getEmail()` en entorno Google Workspace (`@utzmg.edu.mx`) | Base de datos local de usuarios (`Usuario` en MongoDB) con contraseñas encriptadas con `bcrypt` y tokens JWT locales (`24h`) |
| **Almacenamiento de Sesión** | Cookie de sesión activa de Google en el navegador | `sessionStorage` con cabecera HTTP `Authorization: Bearer <token>` |
| **Gestión de Roles** | Dinámica mediante `WebRoles.gs` y catálogos en Firestore (`admin`, `da`, `tutor`, `docente`) | Atributo `rol` (`admin`, `evaluador`, `coordinador`, `profesor`, `director`) en la colección `usuarios` de MongoDB |
| **Nivel de Acoplamiento** | Alto con el ecosistema de Google Apps Script | Tradicional cliente-servidor REST |

### Diagnóstico para la Integración:
- **Tutorías** ya está autenticado con la cuenta Google institucional del usuario. Si el usuario inicia sesión en el Portal UTZMG con su cuenta Google `@utzmg.edu.mx`, al abrir Tutorías en una pestaña ya cuenta con sesión activa en Google, logrando un acceso transparente.
- **Evaluación de Proyectos** requiere actualmente un usuario y contraseña creados manualmente en MongoDB. Para una integración completa de SSO en una fase posterior, se incorporará soporte de autenticación vía Google OAuth / Token de intercambio institucional del Portal (sin romper el login local existente durante la transición).

---

## 3. Principio Fundamental de Diseño: Hub Institucional (Launchpad) vs. Contenedor

> **"El portal pertenece a la UTZMG; las aplicaciones son módulos independientes que se integran al portal."**

### ¿Por qué NO usar `<iframe>` ni contenedores embebidos?
1. **Independencia total de UI/UX y tecnologías**: Cada aplicación (React, Google Apps Script, Python, PHP, etc.) conserva su propio ciclo de vida, navegación, almacenamiento local (`localStorage`/`cookies`), diseño responsivo e infraestructura sin colisiones de estilos o scripts.
2. **Seguridad y compatibilidad de navegación**: Los `iframes` sufren bloqueos de políticas de seguridad modernas (`X-Frame-Options`, `Content-Security-Policy`, restricciones de cookies de terceros y autenticación de Google Workspace).
3. **Resiliencia de infraestructura**: Si una aplicación externa experimenta latencia o caída, el Portal UTZMG sigue funcionando al 100% sin afectar al resto de los servicios institucionales.
4. **Experiencia de usuario natural**: El portal actúa como un **Hub / Launchpad Institucional**:
   $$\text{Portal UTZMG} \longrightarrow \text{Autenticación Central} \longrightarrow \text{Lanzamiento a Aplicación (Ventana / Pestaña)}$$

---

## 4. Catálogo de Aplicaciones 100% Administrable (Zero-Code Onboarding)

El portal está concebido para escalar de 2 a 10, 20 o más aplicaciones institucionales **sin necesidad de modificar código fuente**:

```
+-------------------------------------------------------------------------------+
| FORMULARIO ADMINISTRATIVO: REGISTRAR NUEVA APLICACIÓN                         |
+-------------------------------------------------------------------------------+
|  Nombre:              [ Control Escolar                             ]         |
|  Descripción:         [ Consulta de kárdex, horarios e inscripciones]         |
|  URL Institucional:   [ https://controlescolar.utzmg.edu.mx         ]         |
|  Icono:               [ GraduationCap                               ]         |
|  Categoría:           [ Gestión Académica                           ]         |
|  Roles autorizados:   [ [x] Estudiante  [x] Docente  [x] Admin      ]         |
|  Apertura:            (o) Nueva pestaña (_blank)   ( ) Misma ventana          |
|  Estado:              (o) Activo   ( ) En mantenimiento   ( ) Oculto          |
|  Orden de aparición:  [ 3 ]                                                   |
|                                                                               |
|                       [  GUARDAR APLICACIÓN  ]                                |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
             ¡La aplicación aparece de inmediato en el Dashboard
                 para todos los usuarios con los roles elegidos!
```

---

## 4. Arquitectura General del Sistema

```
                      +-------------------------------------------------------+
                      |                 USUARIO INSTITUCIONAL                 |
                      |              (Docente, Tutor, Admin, etc.)            |
                      +-------------------------------------------------------+
                                                 |
                                                 | 1. Acceso HTTPS
                                                 v
                      +-------------------------------------------------------+
                      |                  PORTAL UTZMG (HUB)                   |
                      |   [ Next.js / Tailwind CSS / Node.js / PostgreSQL ]   |
                      +-------------------------------------------------------+
                               |                                 |
           2. Autenticación    |                                 | 3. Consulta de Catálogo,
              Google OAuth 2.0 |                                 |    Roles y Auditoría
                               v                                 v
        +-------------------------------+             +---------------------------+
        |   GOOGLE WORKSPACE (UTZMG)    |             |   BASE DE DATOS PORTAL    |
        |  - OpenID Connect (OIDC)      |             |  - Users & Roles          |
        |  - Dominio: @utzmg.edu.mx     |             |  - Applications Catalog   |
        |  - Directorio Institucional   |             |  - Audit Log & Sessions   |
        +-------------------------------+             +---------------------------+
                               |
                               | 4. Despacho / Lanzamiento Autorizado
        +----------------------+--------------------------+-----------------------+
        |                                                 |                       |
        v                                                 v                       v
+-------------------------------+             +-----------------------+ +---------------------+
|      APP 1: TUTORÍAS          |             |   APP 2: PROYECTOS    | |   FUTURA APP (N)    |
| (Google Apps Script/Firestore)|             |  (Node.js / MongoDB)  | | (Python/Java/PHP)   |
|                               |             |                       | |                     |
|  Acceso: Sesión Google        |             |  Acceso: Portal SSO / | |  Acceso: OIDC / JWT |
|  Institucional Heredada       |             |  JWT / OAuth          | |  Institutional Hand |
+-------------------------------+             +-----------------------+ +---------------------+
```

---

## 5. Diagrama de Componentes del Portal

```
+---------------------------------------------------------------------------------------+
|                                    PORTAL UTZMG                                       |
|                                                                                       |
|   +--------------------------+  +---------------------------+  +--------------------+ |
|   |    MÓDULO DE ACCESO      |  |   PANEL PRINCIPAL / HUB   |  |   ADMINISTRACIÓN   | |
|   |  - Google OAuth / OIDC   |  |  - Dashboard Cards Grid   |  |  - CRUD Apps       | |
|   |  - Sesión JWT / Cookie   |  |  - Filtro por Roles       |  |  - Asignación Rol  | |
|   |  - Verificador de Dominio|  |  - Categorías y Búsqueda  |  |  - Auditoría Logs  | |
|   +--------------------------+  +---------------------------+  +--------------------+ |
|                 |                             |                           |           |
|                 +-----------------------------+---------------------------+           |
|                                               |                                       |
|                                               v                                       |
|                               +-------------------------------+                       |
|                               |     CAPA DE SERVICIOS CORE    |                       |
|                               |  - AuthService (OIDC)         |                       |
|                               |  - AppCatalogService          |                       |
|                               |  - RBAC Permission Engine     |                       |
|                               |  - AuditLogger Service        |                       |
|                               |  - SSO Token Issuer           |                       |
|                               +-------------------------------+                       |
|                                               |                                       |
|                                               v                                       |
|                               +-------------------------------+                       |
|                               |      CAPA DE PERSISTENCIA     |                       |
|                               |  - Prisma ORM / PostgreSQL    |                       |
|                               |    (o SQLite para dev/local)  |                       |
|                               +-------------------------------+                       |
+---------------------------------------------------------------------------------------+
```

---

## 6. Flujo de Autenticación y Acceso

### 6.1. Flujo de Inicio de Sesión (Login)
```
[ Usuario ]                  [ Portal UTZMG ]               [ Google Workspace ]
     |                              |                                |
     |-- 1. Abre Portal ----------->|                                |
     |                              |-- 2. Redirige a Google OAuth ->|
     |                              |      (client_id, scope=email)  |
     |                              |<-------------------------------|
     |-- 3. Autentica en Google --->|                                |
     |      (@utzmg.edu.mx)         |                                |
     |                              |-- 4. Google retorna code ----->|
     |                              |<-- 5. Canjea code por ID Token |
     |                              |                                |
     |                              |-- 6. Valida dominio institucional
     |                              |      y busca/crea usuario local
     |                              |-- 7. Obtiene roles asignados   |
     |                              |-- 8. Registra evento Auditoría |
     |                              |-- 9. Crea cookie de sesión JWT |
     |<-- 10. Muestra Dashboard ----|                                |
```

### 6.2. Flujo de Lanzamiento a una Aplicación (Launch Flow)
```
[ Usuario ]                  [ Portal UTZMG ]              [ Aplicación Destino ]
     |                              |                                |
     |-- 1. Clic en "Ingresar" ---->|                                |
     |      (Card de Aplicación)    |                                |
     |                              |-- 2. Valida RBAC del usuario   |
     |                              |      (¿Tiene rol requerido?)   |
     |                              |                                |
     |                              |-- 3. Registra evento Auditoría |
     |                              |      ("APP_ACCESS: Tutorias")  |
     |                              |                                |
     |                              |-- 4. Tipo de Integración:      |
     |                              |      a) Direct/Google Session  |
     |                              |      b) SSO Launch Token (JWT) |
     |                              |      c) Redirect con OIDC      |
     |                              |                                |
     |<-- 5. Redirecciona / Abre -->|------------------------------->|
     |      Pestaña a la App        |                                |-- 6. Valida Token / Sesión
     |                              |                                |      y carga interfaz
```

---

## 7. Modelo de Datos Entidad-Relación

```
  +------------------+         +----------------------+         +------------------+
  |       User       |         |       UserRole       |         |       Role       |
  +------------------+         +----------------------+         +------------------+
  | id (PK)          |<------->| userId (FK)          |<------->| id (PK)          |
  | email (Unique)   |         | roleId (FK)          |         | name (Unique)    |
  | name             |         | assignedBy           |         | displayName      |
  | avatarUrl        |         | assignedAt           |         | description      |
  | status           |         +----------------------+         | isSystem         |
  | lastLoginAt      |                                          | createdAt        |
  | createdAt        |                                          +------------------+
  | updatedAt        |                                                    ^
  +------------------+                                                    |
           |                                                              |
           | 1:N                                                          | N:M
           v                                                              v
  +------------------+                                          +----------------------+
  |     AuditLog     |                                          |    AppRequiredRole   |
  +------------------+                                          +----------------------+
  | id (PK)          |                                          | applicationId (FK)   |
  | userId (FK, opt) |                                          | roleId (FK)          |
  | action           |                                          +----------------------+
  | targetResource   |                                                    ^
  | details (JSON)   |                                                    |
  | ipAddress        |                                                    | N:M
  | userAgent        |                                          +----------------------+
  | createdAt        |                                          |     Application      |
  +------------------+                                          +----------------------+
                                                                | id (PK)              |
                                                                | code (Unique, Slug)  |
                                                                | name                 |
                                                                | description          |
                                                                | url                  |
                                                                | icon                 |
                                                                | category             |
                                                                | authType (DIRECT/SSO)|
                                                                | openIn (BLANK/SELF)  |
                                                                | orderIndex           |
                                                                | status (ACTIVE/MAINT)|
                                                                | isVisible            |
                                                                | createdAt            |
                                                                | updatedAt            |
                                                                +----------------------+
```

### Detalle de Campos del Catálogo de Aplicaciones:
- `id`: Identificador único (CUID / UUID).
- `code`: Clave única para integraciones técnicas (`tutorias`, `proyectos-integradores`, `control-escolar`).
- `name`: Nombre visible de la aplicación.
- `description`: Resumen funcional mostrado en la tarjeta.
- `url`: Enlace URL base de la aplicación.
- `icon`: Identificador de icono (Lucide icons / SVG / URL de imagen).
- `category`: Categoría temática (`Académica`, `Gestión`, `Servicios`, `Administración`).
- `authType`: Modo de integración (`GOOGLE_SESSION`, `SSO_JWT_TOKEN`, `OIDC_FEDERATED`, `DIRECT_LINK`).
- `openIn`: Comportamiento de apertura (`_blank` para pestaña nueva, `_self` para misma ventana).
- `orderIndex`: Número entero para ordenar las tarjetas en pantalla.
- `status`: Estado operativo (`ACTIVE`, `MAINTENANCE`, `INACTIVE`).
- `isVisible`: Visibilidad pública en el portal.
- `requiredRoles`: Lista de roles requeridos para ver y acceder a la aplicación.

---

## 8. Estrategia de Roles y Permisos (RBAC Dinámico)

### 8.1. Catálogo Base de Roles Institucionales
1. **Administrador** (`admin`): Control total del portal, gestión de aplicaciones, asignación de roles y visor de auditoría.
2. **Directivo** (`directivo`): Acceso a tableros estratégicos, informes cuantitativos y aplicaciones directivas.
3. **Coordinador** (`coordinador`): Gestión de programas académicos, asignaciones y seguimiento de carreras.
4. **Tutor** (`tutor`): Acceso a seguimiento tutorial, reportes individuales y grupales.
5. **Docente** (`docente`): Acceso a evaluación cualitativa, evaluación de integradoras y listas de asignaturas.
6. **Estudiante** (`estudiante`): Acceso a consulta de calificaciones, servicios escolares, estadías y proyectos.
7. **Personal Administrativo** (`administrativo`): Acceso a herramientas de gestión administrativa, inventarios y recursos humanos.

### 8.2. Reglas de Acceso:
- Si una aplicación tiene `requiredRoles = []` (vacío) y `status = 'ACTIVE'`, está disponible para **cualquier usuario institucional autenticado**.
- Si una aplicación tiene `requiredRoles = ['tutor', 'coordinador', 'admin']`, solo los usuarios que posean al menos uno de esos roles visualizarán y podrán lanzar la aplicación.
- Los administradores tienen una vista previa para simular o ver todas las aplicaciones en mantenimiento o con roles restringidos.

---

## 9. Estrategia de Integración y Single Sign-On (SSO)

El portal soporta 4 niveles de integración gradual:

```
+------------------------------------------------------------------------------------------+
| Nivel 1: Herencia de Sesión Google Workspace (Inmediato - Sin cambios en Apps)          |
| Adecuado para: Tutorías (Google Apps Script)                                             |
| Funcionamiento: El usuario inicia sesión en el Portal con su cuenta Google @utzmg.edu.mx.|
| Al hacer clic en Tutorías, se abre en nueva pestaña; Apps Script detecta la sesión       |
| activa de Google en el navegador mediante Session.getActiveUser().getEmail().             |
+------------------------------------------------------------------------------------------+
                                            |
                                            v
+------------------------------------------------------------------------------------------+
| Nivel 2: SSO Launch Token (JWT Institucional Firmado)                                    |
| Adecuado para: Evaluación de Proyectos, Apps Web React/Node/PHP/Python                   |
| Funcionamiento:                                                                          |
| 1. El portal genera un token JWT temporal firmado con clave secreta compartida/RSA:      |
|    Payload: { email, name, roles, iat, exp (5 min), targetApp: 'proyectos' }             |
| 2. Redirige a: https://proyectos.utzmg.edu.mx/sso/callback?token=...                    |
| 3. El backend de la app receptora valida la firma, busca o auto-aprovisiona el usuario  |
|    en su BD local, y le genera su sesión nativa (Bearer JWT).                            |
+------------------------------------------------------------------------------------------+
                                            |
                                            v
+------------------------------------------------------------------------------------------+
| Nivel 3: Proveedor de Identidad OIDC Centralizado (Futuro / Escalabilidad Total)         |
| Adecuado para: Todas las aplicaciones institucionales a gran escala                      |
| Funcionamiento: El Portal UTZMG o Google Workspace actúa como OpenID Connect Provider    |
| estándar mediante Authorization Code Flow con PKCE.                                      |
+------------------------------------------------------------------------------------------+
```

---

## 10. Hoja de Ruta de Integración de las Aplicaciones Actuales

### 10.1. Fase 1: Despliegue del Portal y Conexión No Destructiva
- Se implementa y despliega el **Portal UTZMG**.
- Se registran en el catálogo las aplicaciones **Tutorías** y **Evaluación de Proyectos Integradores**.
- **Tutorías**: Integración inmediata vía `GOOGLE_SESSION` (sin modificar una sola línea de código en `Tutorias-app`).
- **Evaluación de Proyectos**: Integración inicial vía enlace directo asegurado con roles (`DIRECT_LINK`).

### 10.2. Fase 2: Plan de Adopción SSO para Evaluación de Proyectos Integradores
Antes de realizar cualquier cambio en `Evaluacion Proyectos`, se documenta el plan exacto:

1. **Qué cambios son necesarios**:
   - En Backend (`evaluacion-proyectos/backend`): Agregar una ruta de validación de token SSO: `GET/POST /api/auth/sso-login`.
   - En Frontend (`evaluacion-proyectos/frontend`): Agregar una ruta de recepción `/sso-callback` que reciba el token, invoque `/api/auth/sso-login` y guarde el token resultante en `sessionStorage`.
2. **Por qué son necesarios**: Para permitir que un docente o coordinador que ya inició sesión en el Portal no tenga que escribir nuevamente su contraseña local.
3. **Qué riesgos existen**:
   - Conflicto si el correo del token no existe previamente en la colección `usuarios` de MongoDB.
   - *Mitigación*: La ruta SSO asociará automáticamente cuentas existentes por correo institucional o permitirá auto-aprovisionamiento con rol por defecto.
4. **Qué archivos serán modificados**:
   - `backend/src/routes/auth.ts`
   - `frontend/src/App.tsx`
   - `frontend/src/pages/SSOCallback.tsx` (nuevo archivo independiente)
5. **Cómo se puede hacer rollback**:
   - El sistema de login tradicional por usuario y contraseña permanece intacto (`/api/auth/login`), por lo que cualquier reversión es instantánea deshabilitando el botón o ruta SSO.

---

## 11. Seguridad y Auditoría

### 11.1. Controles de Seguridad
1. **Validación Estricta de Dominio**:
   - Solo se admiten correos electrónicos que terminen estrictamente en `@utzmg.edu.mx`.
   - Cualquier intento de acceso con cuentas personales (`@gmail.com`) es rechazado con mensaje de acceso restringido.
2. **Protección de Rutas y Middleware**:
   - Middleware de autenticación a nivel de servidor (Next.js Middleware) para proteger `/dashboard`, `/admin/*` y endpoints `/api/*`.
3. **Protección de Sesiones**:
   - Tokens de sesión emitidos en cookies `HttpOnly`, `SameSite=Lax`, `Secure` (en producción HTTPS).
4. **Protección de Secretos**:
   - Claves de Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), claves JWT (`JWT_SECRET`) y URLs de bases de datos configuradas únicamente a través de variables de entorno (`.env.local`).
   - Cero almacenamiento de contraseñas de Google.
5. **Encabezados de Seguridad (HTTP Headers)**:
   - `X-Frame-Options: SAMEORIGIN` (o configurado para permitir marcos institucionales cuando aplique).
   - `X-Content-Type-Options: nosniff`.
   - `Strict-Transport-Security` (HSTS).

### 11.2. Módulo de Auditoría Institucional
Se registran los siguientes eventos con marca de tiempo UTC, usuario, dirección IP y metadatos:
- `AUTH_LOGIN_SUCCESS`: Inicio de sesión exitoso.
- `AUTH_LOGIN_FAILED`: Intento fallido o dominio no autorizado.
- `AUTH_LOGOUT`: Cierre de sesión.
- `APP_LAUNCH`: Clic y apertura de una aplicación institucional.
- `APP_CREATED`: Creación de una nueva aplicación en el catálogo.
- `APP_UPDATED`: Edición de propiedades, URL, roles o estado de una aplicación.
- `APP_STATUS_TOGGLED`: Activación/desactivación de una aplicación.
- `ROLE_ASSIGNED`: Asignación de rol a un usuario institucional.
- `ROLE_REVOKED`: Remoción de rol a un usuario.

---

## 12. Guía para Agregar Futuras Aplicaciones

Para registrar una nueva aplicación institucional (ej. *Control Escolar*, *Evaluación Docente*, *Servicio Social*, *Biblioteca*, *Estadías*):

1. **Sin modificar código del portal**:
   - El Administrador ingresa al módulo `/admin/apps`.
   - Hace clic en **"Registrar Nueva Aplicación"**.
   - Completa el formulario institucional:
     - Nombre (`Control Escolar`)
     - Código slug (`control-escolar`)
     - Descripción (`Consulta de kárdex, inscripciones y actas de calificación`)
     - URL de la aplicación (`https://controlescolar.utzmg.edu.mx`)
     - Icono (ej. `GraduationCap`, `BookOpen`, `FileCheck`, `Building2`, etc.)
     - Categoría (`Gestión Académica`)
     - Roles autorizados (`Estudiante`, `Docente`, `Coordinador`, `Admin`)
     - Modo de apertura (`Nueva pestaña` o `Misma ventana`)
     - Orden de aparición (`1`, `2`, `3`...)
   - Guarda los cambios.
2. **Resultado inmediato**:
   - Automáticamente, los usuarios con los roles seleccionados verán la nueva tarjeta en su Dashboard en tiempo real.
   - Si la aplicación requiere SSO en el futuro, se selecciona el modo `SSO_JWT_TOKEN` o `OIDC` configurando su respectivo secreto de integración.

---

## 13. Identidad Visual Institucional UTZMG

El diseño visual del portal respeta la identidad corporativa de la universidad:

- **Color Primario (Verde Institucional UTZMG)**: `#006837` / `#0B7B48`
- **Color Secundario (Verde Acento / Teal UTZMG)**: `#00A859` / `#008060`
- **Color Neutro Oscuro (Tipografía y estructura)**: `#1F2937` / `#111827`
- **Fondos y Paneles**: `#F8FAFC` (Superficie suave), `#FFFFFF` (Tarjetas limpias)
- **Acentos de Estado**:
  - Activo / Operativo: Verde Esmeralda (`#10B981`)
  - En Mantenimiento: Ámbar (`#F59E0B`)
  - Restringido / Inactivo: Gris Neutro (`#6B7280`)
- **Experiencia de Usuario (UX)**:
  - Diseño Desktop-First con plena adaptabilidad móvil (Responsive).
  - Búsqueda en vivo y filtrado instantáneo por categorías.
  - Indicadores claros de aplicaciones disponibles vs. mantenimiento.
  - Accesos directos a soporte y perfil del usuario institucional.

---

## 14. Pila Tecnológica, Nombre del Proyecto y Despliegue Institucional

### 14.1. Nombre Oficial del Proyecto
- **Nombre**: `Portal UTZMG` (Portal de Aplicaciones Institucionales UTZMG)
- **Directorio / Repositorio**: `portal-utzmg`

### 14.2. Pila Tecnológica
- **Framework**: Next.js 14+ (App Router) / React 18+ / TypeScript
- **Estilos e Interfaz**: Tailwind CSS + Lucide Icons (diseño limpio e institucional)
- **Base de Datos & ORM**: PostgreSQL / SQLite (vía Prisma ORM)
- **Autenticación**: Google OAuth 2.0 / OpenID Connect con restricción estricta de dominio (`hd: utzmg.edu.mx`)

### 14.3. Infraestructura y Repositorio Institucional
1. **Repositorio Git Separado**: El proyecto `portal-utzmg` se mantiene como un repositorio independiente, alojado bajo la organización/cuenta institucional de la Universidad.
2. **Infraestructura de Despliegue (Render / VPS Institucional)**: Desplegado en un servicio web independiente bajo la cuenta institucional, garantizando:
   - Dominio institucional propio (ej. `portal.utzmg.edu.mx` o `portal-utzmg.onrender.com`).
   - Aislamiento de entornos: el portal opera con sus propios recursos, variables de entorno y logs de auditoría sin interferir con los servidores de Tutorías ni de Evaluación de Proyectos.
   - Escalabilidad horizontal conforme se agreguen nuevas aplicaciones en los próximos años.
