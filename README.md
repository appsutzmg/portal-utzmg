# Portal de Aplicaciones Institucionales — UTZMG
**Universidad Tecnológica de la Zona Metropolitana de Guadalajara**

Punto único de acceso (Launchpad / Hub Institucional) para la comunidad universitaria de la UTZMG (Directivos, Coordinadores, Tutores, Docentes, Estudiantes y Personal Administrativo).

---

## 🚀 Características Principales

1. **Hub Institucional Desacoplado**:
   - Acceso centralizado a las aplicaciones institucionales sin embeberlas en `<iframe>`.
   - Cada sistema conserva su propia arquitectura, base de datos y tecnología (Google Apps Script, React/Node.js, Python, PHP, Java, etc.).

2. **Autenticación Institucional (@utzmg.edu.mx)**:
   - Integración con Google Workspace / OpenID Connect.
   - Restricción estricta de dominio institucional.
   - Sin almacenamiento de contraseñas de Google.
   - Sesiones seguras mediante JWT y cookies `HttpOnly`.

3. **Catálogo de Aplicaciones 100% Administrable (Zero-Code Onboarding)**:
   - Registro y edición de nuevas aplicaciones desde la interfaz gráfica sin modificar código fuente.
   - Configuración de roles autorizados, categoría, orden, estado (*Operativa*, *Mantenimiento*, *Inactiva*), iconos institucionales y modo de apertura (`_blank` o `_self`).

4. **Control de Acceso Basado en Roles (RBAC Dinámico)**:
   - Roles institucionales: `Administrador`, `Directivo`, `Coordinador`, `Tutor`, `Docente`, `Estudiante`, `Personal Administrativo`.
   - Filtro automático: los usuarios solo visualizan y pueden lanzar las aplicaciones para las que están autorizados.

5. **Bitácora de Auditoría y Cumplimiento**:
   - Registro inmutable de inicios de sesión, lanzamientos de aplicaciones, cambios en el catálogo y modificaciones de roles.

---

## 🛠️ Pila Tecnológica

- **Framework**: Next.js 14+ (App Router) / React 18 / TypeScript
- **Estilos e Interfaz**: Tailwind CSS + Lucide Icons (Identidad visual oficial UTZMG: Verde institucional `#006837`, verde acento `#00A859`)
- **Base de Datos & ORM**: Prisma ORM con SQLite (desarrollo/local) o PostgreSQL (producción)
- **Seguridad y Criptografía**: `jose` (JWT firmado), Cookies seguras

---

## 📦 Estructura del Proyecto

```
Portal-utzmg/
├── ARCHITECTURE.md          # Especificación técnica y de arquitectura
├── prisma/
│   ├── schema.prisma        # Modelo de datos (User, Role, Application, AuditLog)
│   └── seed.js              # Carga inicial de roles, aplicaciones y usuarios
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── apps/        # Gestión CRUD de aplicaciones
│   │   │   ├── users/       # Asignación de roles a usuarios
│   │   │   └── audit/       # Bitácora de auditoría
│   │   ├── api/
│   │   │   ├── applications/# Endpoints de aplicaciones y lanzamiento
│   │   │   ├── auth/        # Login institucional, sesiones y demo users
│   │   │   └── admin/       # Endpoints administrativos
│   │   ├── dashboard/       # Dashboard principal institucional
│   │   ├── login/           # Pantalla de inicio de sesión UTZMG
│   │   ├── globals.css      # Estilos institucionales y temas
│   │   ├── layout.tsx       # Layout raíz con navbar y footer
│   │   └── page.tsx         # Redirección inteligente
│   ├── components/
│   │   ├── AppCard.tsx      # Tarjeta interactiva de aplicación
│   │   ├── DynamicIcon.tsx  # Renderizador de iconos Lucide
│   │   ├── Header.tsx       # Barra de navegación institucional
│   │   └── Footer.tsx       # Pie de página institucional
│   ├── contexts/
│   │   └── AuthContext.tsx  # Contexto global de sesión y permisos
│   └── lib/
│       ├── auth.ts          # Validaciones, tokens JWT y cookies
│       ├── audit.ts         # Registrador de eventos de auditoría
│       └── prisma.ts        # Cliente de persistencia Prisma
```

---

## ⚙️ Configuración y Puesta en Marcha

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Configurar variables de entorno (`.env`)
```env
DATABASE_URL="file:./dev.db" # O PostgreSQL en producción
JWT_SECRET="clave-secreta-institucional-utzmg"
INSTITUTIONAL_DOMAIN="utzmg.edu.mx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENABLE_DEMO_ACCOUNTS="true"
```

### 3. Crear base de datos y cargar datos iniciales
```bash
npx prisma db push
npm run db:seed
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## 👥 Matriz de Roles y Acceso a Aplicaciones

| Rol Institucional | Código del Rol | Acceso a Proyectos Integradores | Acceso a Tutorías | Panel Administrativo |
| :--- | :--- | :---: | :---: | :---: |
| **Administrador** | `admin` | ✅ | ✅ | ✅ |
| **Profesor / Docente** | `profesor` | ✅ | ✅ | ❌ |
| **Coordinador de Proyectos** | `coordinador_proyectos` | ✅ | ❌ | ❌ |
| **Asistente** | `asistente` | ✅ | ❌ | ❌ |
| **Tutor** | `tutor` | ❌ | ✅ | ❌ |
| **Dirección Académica** | `direccion_academica` | ❌ | ✅ | ❌ |

---

## 🔑 Cuentas de Demostración Configuradas

Para pruebas inmediatas en el portal ([http://localhost:3000](http://localhost:3000)):

- `admin@utzmg.edu.mx` → Rol: **Administrador** (Visualiza ambas aplicaciones y el menú de administración)
- `profesor@utzmg.edu.mx` → Rol: **Profesor** (Visualiza Proyectos Integradores y Tutorías)
- `coordinador.proyectos@utzmg.edu.mx` → Rol: **Coordinador de Proyectos** (Visualiza únicamente Proyectos Integradores)
- `asistente.proyectos@utzmg.edu.mx` → Rol: **Asistente** (Visualiza únicamente Proyectos Integradores)
- `tutor@utzmg.edu.mx` → Rol: **Tutor** (Visualiza únicamente Tutorías)
- `direccion.academica@utzmg.edu.mx` → Rol: **Dirección Académica** (Visualiza únicamente Tutorías)

---

### Soporte Técnico Institucional
Para dudas, reporte de incidencias o solicitud de permisos especiales:
- **Correo**: `apps@utzmg.edu.mx`

1. Crear un **Web Service** en Render conectado al repositorio de GitHub del Portal UTZMG.
2. Configurar los comandos de despliegue:
   - **Build Command**: `npm install && npx prisma db push && npm run build`
   - **Start Command**: `npm start`
3. Agregar las variables de entorno en Render:
   - `DATABASE_URL`: URL de conexión PostgreSQL (Render Postgres o externo).
   - `JWT_SECRET`: Cadena segura para firma de tokens.
   - `INSTITUTIONAL_DOMAIN`: `utzmg.edu.mx`.
   - `ENABLE_DEMO_ACCOUNTS`: `false` (en producción oficial).
