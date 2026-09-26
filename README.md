# 💻 EquiposApp — Gestión Integral de Equipos y Mantenimientos (PWA Offline)

Aplicación web progresiva (**PWA**) **offline-first** para la gestión integral de equipos de cómputo, mantenimientos técnicos, copias de seguridad y trazabilidad de usuarios. Construida con **React 19 + Vite + Dexie.js (IndexedDB)** e instalable como app nativa en móviles y escritorio, sin depender de un servidor backend.

> Funciona al **100% sin internet**: todos los datos se guardan localmente en el navegador y la app abre incluso en modo avión.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Características Principales](#-características-principales)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Módulos y Funcionalidades](#-módulos-y-funcionalidades)
5. [Datos y Persistencia](#-datos-y-persistencia)
6. [Modo Offline y PWA](#-modo-offline-y-pwa)
7. [Instalación y Ejecución](#-instalación-y-ejecución)
8. [Estructura del Proyecto](#-estructura-del-proyecto)
9. [Personalización](#-personalización)
10. [Guía para Desarrolladores](#-guía-para-desarrolladores)
11. [Flujos de Trabajo Comunes](#-flujos-de-trabajo-comunes)
12. [Reportes y Exportación](#-reportes-y-exportación)
13. [Consideraciones de Seguridad](#-consideraciones-de-seguridad)
14. [Solución de Problemas](#-solución-de-problemas)
15. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
16. [Licencia](#-licencia)
17. [Contacto y Soporte](#-contacto-y-soporte)

---

## 📖 Descripción General

**EquiposApp** es una solución completa para departamentos de TI, soporte técnico, colegios, empresas y negocios que necesitan:

- ✅ Inventario detallado de computadores, servidores, impresoras, redes y más
- ✅ Control de mantenimientos preventivos, correctivos y diagnósticos con costos
- ✅ Auditoría de copias de seguridad (backups) con verificación de integridad
- ✅ Trazabilidad total de **quién ha usado cada equipo** (historial de personas)
- ✅ Dashboard con KPIs, gráficos y actividad reciente en tiempo real
- ✅ Reportes profesionales en **PDF**, exportaciones a **CSV/Excel** y respaldo total en **JSON**
- ✅ Experiencia móvil nativa con instalación PWA y navegación táctil

La aplicación está diseñada para trabajar **sin conexión a internet** desde el primer arranque, con datos de demostración precargados para explorar todas las funciones.

---

## 🚀 Características Principales

### 🎯 Funcionalidades Clave

| Característica | Descripción |
|----------------|-------------|
| **Offline-First** | Funciona completamente sin internet; datos en IndexedDB vía Dexie.js |
| **PWA Instalable** | Instalable en Android, iOS (guía Safari), Windows y Mac con iconos propios |
| **Persistencia Local** | 5 tablas IndexedDB: equipos, mantenimientos, backups, historialUsuarios, actividades |
| **Tiempo Real Reactivo** | `dexie-react-hooks` + `useLiveQuery`: la UI se actualiza sola al cambiar la DB |
| **Contador de Personas** | Cada equipo muestra cuántas personas distintas lo han usado en su ciclo de vida |
| **Ficha Técnica PDF** | Ficha individual por equipo con specs, historial, mantenimientos y backups |
| **Respaldo Total JSON** | Descarga/restaura toda la base para migrar entre dispositivos o navegadores |
| **Indicador Online/Offline** | Badge en el Navbar que detecta `navigator.onLine` y eventos de red |
| **Responsive Mobile-First** | Sidebar en desktop + BottomNav táctil en móvil, tema oscuro Slate |

### 📱 Plataformas Soportadas

- **Móviles Android** (Chrome / Edge con instalación directa vía `beforeinstallprompt`)
- **iPhone / iPad** (Safari con guía "Añadir a pantalla de inicio" incluida)
- **PC / Mac** (Chrome, Edge, Firefox modernos)
- **Modo instalado** (standalone, icono propio, pantalla completa, funciona en avión)
- **Red local** (probar en el celular con `npm run dev -- --host`)

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Flujo de Datos

```
+------------------ CAPA DE UI ------------------+
|  Vistas (6 modulos)  |  Modales  |  Componentes |
|  Dashboard, Equipos, |  Detalle  |  Navbar,       |
|  Mant., Backups,     |  + Form   |  Sidebar,      |
|  Usuarios, Reportes  |           |  BottomNav...  |
+----------+--------------+----------+------------+
           |              |          |
           v              v          v
+----------- APP.JSX (Estado + Live Queries) ----+
| currentTab, modales (nuevo/editar/detalle)     |
| useLiveQuery x5 -> props reactivas             |
| counts para badges + registrarActividad()      |
+-------------------------+----------------------+
                          |
                          v
+------------- CAPA DE DATOS (Dexie.js) ---------+
|  IndexedDB: GestionEquiposDB                   |
|  equipos, mantenimientos, backups,             |
|  historialUsuarios, actividades                 |
|  + utils: exportPdf, exportCsv, seedData       |
+-------------------------+----------------------+
                          |
                          v
+------ SERVICE WORKER + MANIFEST (PWA) ---------+
|  Precache Workbox + instalacion standalone     |
+------------------------------------------------+
```

### Componentes del Sistema

#### 1. IndexedDB vía Dexie.js (`src/db/db.js`)

Base de datos local persistente `GestionEquiposDB v1`:

| Tabla | Clave / Índices | Descripción |
|-------|-----------------|-------------|
| `equipos` | `++id, codigo, nombre, tipo, marca, estado, ubicacion, usuarioActual, fechaAdquisicion` | Inventario con specs técnicas completas |
| `mantenimientos` | `++id, equipoId, tipo, estado, fecha, fechaProxima, tecnico` | Preventivo, Correctivo, Limpieza, Actualización, Diagnóstico |
| `backups` | `++id, equipoId, tipo, estado, fecha, destino, verificado` | Completa, Incremental, Imagen, BD, Archivos |
| `historialUsuarios` | `++id, equipoId, usuario, cargo, departamento, fechaInicio, fechaFin, estadoActual` | Trazabilidad de personas por equipo |
| `actividades` | `++id, tipo, descripcion, fecha, equipoId` | Feed / timeline (últimas 15 en App) |

#### 2. App.jsx (Orquestador + Estado Reactivo)

Actúa como store simple sin Context externo:

- Carga reactiva con `useLiveQuery(() => db.xxx.toArray())` para las 5 tablas.
- Deriva `equipoDetalleActual`, `mantenimientosPendientes` y `counts`.
- Controla navegación (`currentTab`: dashboard, equipos, mantenimientos, backups, usuarios, reportes) y modales (nuevo/editar/detalle).
- Inicializa datos demo con `inicializarDatosPrueba(false)` solo si la DB está vacía.

#### 3. Vistas - Módulos (`src/views/`)

Cada vista recibe datos por props y escribe directo a Dexie:

| Vista | Propósito |
|-------|-----------|
| `DashboardView` | KPIs, distribución por tipo, ranking rotación personas, próximos mantenimientos, actividad reciente |
| `EquiposView` | Catálogo con búsqueda + filtros por tipo/estado, tarjetas con contador personas, pendientes y backups |
| `MantenimientosView` | Agenda CRUD, filtros Pendientes/Completados, marcar completado, costos |
| `BackupsView` | CRUD de respaldos, toggle verificado, destino/tamaño/notas |
| `HistorialUsuariosView` | Timeline de asignaciones, filtro solo-actuales, estado entrega/devolución |
| `ReportesView` | Centro de PDF + CSV + JSON backup/restore + demo/reset |
| `EquipoDetalleModal` | Ficha 360 con 4 pestañas (specs, personas, mantenimientos, backups) + alta rápida + exportar ficha PDF |
| `EquipoFormModal` | Crear/editar equipo (19 campos), genera código `EQ-XXX`, crea historial inicial si hay usuario |

#### 4. Componentes Reutilizables (`src/components/`)

- `Navbar` — Logo, badge En línea / Modo Offline, botón Datos Demo, botón Nuevo Equipo.
- `Sidebar` — Navegación desktop con contadores y tarjeta "Almacenamiento Local".
- `BottomNav` — Navegación móvil fija de 5 tabs con indicador de alerta.
- `Modal` — Contenedor responsive (bottom-sheet en móvil), cierre con Escape, scroll interno.
- `StatCard` — Tarjeta KPI con 6 colores (blue, emerald, amber, cyan, purple, rose), clicable.
## 🧩 Módulos y Funcionalidades

### 💻 1. Equipos (Catálogo / Inventario)

**Descripción:** Registro maestro de todos los dispositivos con especificaciones técnicas completas.

**Campos por equipo:** `codigo` (ej. EQ-001), `nombre`, `tipo` (Laptop, Escritorio, Servidor, Impresora, Switch/Router, Tablet, Celular, Otro), `marca`, `modelo`, `serie` (S/N), `procesador`, `ram`, `almacenamiento`, `sistemaOperativo`, `ubicacion`, `estado` (Operativo, En Mantenimiento, En Reparación, En Espera, De Baja), `usuarioActual`, `fechaAdquisicion`, `valorEstimado` (USD), `notas`.

**Funcionalidades:**

- Búsqueda en vivo por nombre, código, marca, modelo, serie, usuario o ubicación.
- Filtros combinados por tipo + estado.
- Badge automático "N personas" (usuarios únicos históricos por equipo).
- Badge "N pend." si tiene mantenimientos pendientes, si no "N bkp".
- Crear con código auto `EQ-XXX`; si trae usuario inicial, crea su primer historial.
- Editar, eliminar (con confirmación) y ficha detalle 360.

**Estructura de un equipo:**

```javascript
{
  id: 1,
  codigo: "EQ-001",
  nombre: "Laptop Dell Latitude 5420",
  tipo: "Laptop",
  marca: "Dell",
  modelo: "Latitude 5420",
  serie: "DL5420-99882A",
  procesador: "Intel Core i7-1185G7 @ 3.0GHz",
  ram: "16 GB DDR4",
  almacenamiento: "512 GB NVMe SSD",
  sistemaOperativo: "Windows 11 Pro",
  ubicacion: "Departamento de TI",
  estado: "Operativo",
  usuarioActual: "Carlos Mendoza",
  fechaAdquisicion: "2024-02-15",
  valorEstimado: 1200,
  notas: "Equipo principal para desarrollo..."
}
```

---

### 🔧 2. Mantenimientos
### 💾 3. Copias de Seguridad (Backups)

**Descripción:** Auditoría de respaldos por equipo con verificación de recuperabilidad.

**Campos:** `equipoId`, `tipo` (Completa, Incremental, Imagen de Disco, Base de Datos, Archivos de Usuario), `estado` (Exitoso, Con Advertencias, Fallido), `fecha` (datetime-local), `destino` (NAS, disco externo, nube...), `tamano` (ej. "45 GB"), `verificado` (boolean), `notas`.

**Funcionalidades:**

- Registro rápido con verificado activado por defecto.
- Toggle "verificado / sin verificar" directo en la tarjeta.
- Búsqueda por tipo, destino, notas o equipo.
- Badges Exitoso / Advertencia / Fallido + icono de verificación.
- Contador usado en tarjetas de equipos y KPIs del dashboard.

---

### 👥 4. Historial de Personas / Usuarios

**Descripción:** Trazabilidad cronológica de quién ha usado cada equipo (el diferencial del sistema).

**Campos:** `equipoId`, `usuario`, `cargo`, `departamento`, `fechaInicio`, `fechaFin`, `motivo`, `estadoEntrega`, `estadoDevolucion`, `esActual` (boolean).

**Funcionalidades:**

- Reasignación inteligente desde la ficha: archiva al actual (fechaFin = hoy) y activa al nuevo + actualiza `usuarioActual` del equipo.
- Badges "En Uso Actualmente" vs "Uso Anterior".
- Búsqueda por persona, cargo, departamento, motivo o equipo + checkbox "Solo usuarios actuales".
- Al crear equipo con usuario se genera su primer registro como "Responsable inicial".
- Alimenta el ranking de rotación del dashboard.

---

### 📊 5. Dashboard

**Descripción:** Panel de control en tiempo real con `useLiveQuery`.

**Métricas (KPIs clicables):** Total equipos (X operativos), En mantenimiento, Pendientes, Personas únicas + backups.

**Bloques:** distribución por tipo con barras, top 4 equipos con mayor rotación, próximos 5 mantenimientos (clic abre ficha), timeline últimas 5 actividades.

---

### 📄 6. Reportes y Respaldos
## 🗄️ Datos y Persistencia

### Esquema Dexie (`src/db/db.js`)

```javascript
import Dexie from 'dexie';
export const db = new Dexie('GestionEquiposDB');
db.version(1).stores({
  equipos: '++id, codigo, nombre, tipo, marca, estado, ubicacion, usuarioActual, fechaAdquisicion',
  mantenimientos: '++id, equipoId, tipo, estado, fecha, fechaProxima, tecnico',
  backups: '++id, equipoId, tipo, estado, fecha, destino, verificado',
  historialUsuarios: '++id, equipoId, usuario, cargo, departamento, fechaInicio, fechaFin, estadoActual',
  actividades: '++id, tipo, descripcion, fecha, equipoId'
});
```

- `++id` = autoincremental. El resto son índices para filtros rápidos.
- `registrarActividad(tipo, descripcion, equipoId)` guarda timeline con fecha ISO.
- Lectura reactiva en `App.jsx`:

```javascript
const equipos = useLiveQuery(() => db.equipos.toArray()) || [];
const mantenimientos = useLiveQuery(() => db.mantenimientos.toArray()) || [];
const backups = useLiveQuery(() => db.backups.toArray()) || [];
const historialUsuarios = useLiveQuery(() => db.historialUsuarios.toArray()) || [];
const actividades = useLiveQuery(() => db.actividades.reverse().limit(15).toArray()) || [];
```

> Cualquier `add/update/delete` refresca la UI automáticamente, sin reload ni fetch.

### Datos de Demostración (`src/utils/seedData.js`)

`inicializarDatosPrueba(forzar=false)` solo siembra si `db.equipos.count() === 0`. Con `forzar=true` borra las 5 tablas y recarga. Incluye:

- **5 equipos:** Laptop Dell Latitude 5420, PC HP ProDesk 400 G7, Servidor Dell PowerEdge R440 (En Mantenimiento), MacBook Pro M2, Impresora Epson EcoTank L6270.
- **Mantenimientos** de ejemplo (preventivos completados + pendientes con `fechaProxima` y costos).
- **Backups** (completa exitosa verificada + incremental con advertencia).
- **6 historiales:** EQ-001 con 3 personas (rotación), EQ-002 con 2, EQ-004 con 1.
- **1 actividad** inicial de sistema inicializado.

Botones que la invocan: **Navbar y Datos Demo**, **Reportes y Recargar Datos Demo**.
## 📴 Modo Offline y PWA

### Manifiesto (`vite.config.js` + `index.html`)

| Campo | Valor |
|-------|-------|
| `name` | Gestión de Equipos y Mantenimiento |
| `short_name` | EquiposApp |
| `display` | standalone, `orientation: portrait-primary` |
| `theme_color` / `background_color` | `#0f172a` (slate-900) |
| `icons` | `pwa-192x192.png`, `pwa-512x512.png` (incluye maskable) |
| `includeAssets` | favicon, iconos PWA, apple-touch-icon |
| `workbox.globPatterns` | `**/*.{js,css,html,ico,png,svg,woff2}` (precache total) |

`index.html` suma: `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-capable`, descripción SEO "100% Offline".

### Instalación (`src/components/InstallPrompt.jsx`)

- Escucha `beforeinstallprompt` y muestra banner "Instalar EquiposApp en tu teléfono".
- Detecta `display-mode: standalone` / `navigator.standalone` para no mostrar nada si ya está instalada.
- En iOS muestra modal guía de 3 pasos (Compartir, Añadir a pantalla de inicio, Añadir).
- Tras `appinstalled` oculta el banner.

### Iconos (`generate-icons.js` + `public/`)

Script Node puro (sin dependencias) que genera PNGs con degradado slate + monitor azul + pulso verde:

```bash
node generate-icons.js
```

Genera: `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`. `favicon.svg` e `icons.svg` ya incluidos en `public/`.

### Indicador de Red (`Navbar.jsx`)

```javascript
const [isOnline, setIsOnline] = useState(navigator.onLine);
window.addEventListener('online', () => setIsOnline(true));
window.addEventListener('offline', () => setIsOnline(false));
```

Badge verde pulsante "En línea" o ámbar "Modo Offline" (los datos siguen guardándose en IndexedDB igual).

## ⚙️ Instalación y Ejecución

### Requisitos Previos

- **Node.js** 18+ y **npm** (verificar con `node -v` y `npm -v`).
- Navegador moderno (Chrome / Edge recomendado para PWA + IndexedDB).
- Opcional: celular en la misma Wi-Fi para probar instalación móvil.

### 1. Instalar dependencias

```bash
cd "c:\Users\juanka\Documents\PROGRAMACION\Aplicaciones\gestion_equipos"
npm install
```

### 2. Modo desarrollo (PC)

```bash
npm run dev
```

Abre la URL mostrada (generalmente `http://localhost:5173`). La primera vez se siembran los 5 equipos demo automáticamente.

### 3. Probar en tu teléfono móvil (red local)

1. Conecta PC y celular a la **misma Wi-Fi**.
2. Inicia exponiendo la red:

```bash
npm run dev -- --host
```

3. Copia la IP local que muestra Vite (ej. `http://192.168.1.X:5173`) al navegador del celular.
4. Pulsa el banner **"Instalar EquiposApp en tu teléfono"** o usa "Añadir a pantalla de inicio".
5. Activa el **modo avión**: la app sigue abriendo y guardando (100% offline).

### 4. Build de producción + preview

```bash
npm run build
npm run preview
```

`npm run build` genera `dist/` con Service Worker + precache Workbox. Despliega `dist/` en cualquier hosting estático (Netlify, Vercel, NAS local, etc.).

### 5. Otros scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor Vite con HMR |
| `npm run build` | Build producción + PWA |
| `npm run preview` | Previsualizar `dist/` local |
| `npm run lint` | Linter `oxlint` |
| `node generate-icons.js` | Regenerar iconos PWA en `public/` |

## 📁 Estructura del Proyecto

```
gestion_equipos/
├── public/
│   ├── favicon.svg              # Favicon principal
│   ├── icons.svg                # Set de iconos
│   ├── pwa-192x192.png          # Icono PWA 192 (generado)
│   ├── pwa-512x512.png          # Icono PWA 512 + maskable (generado)
│   └── apple-touch-icon.png     # Icono iOS 180 (generado)
├── src/
│   ├── assets/                  # hero.png, react.svg, vite.svg
│   ├── components/
│   │   ├── Navbar.jsx           # Header + badge red + Nuevo Equipo + demo
│   │   ├── Sidebar.jsx          # Nav desktop con contadores
│   │   ├── BottomNav.jsx        # Nav movil 5 tabs
│   │   ├── Modal.jsx            # Modal responsive + Escape
│   │   ├── StatCard.jsx         # KPI con 6 colores
│   │   └── InstallPrompt.jsx    # Banner PWA + guia iOS
│   ├── db/
│   │   └── db.js                # Dexie GestionEquiposDB + registrarActividad
│   ├── utils/
│   │   ├── exportPdf.js         # 4 reportes jsPDF + autotable + membrete
│   │   ├── exportCsv.js         # CSV (BOM) + backup/restore JSON
│   │   └── seedData.js          # 5 equipos + mantenimientos + backups + historiales
│   ├── views/
│   │   ├── DashboardView.jsx    # KPIs + graficos + ranking + timeline
│   │   ├── EquiposView.jsx      # Catalogo + busqueda + filtros
│   │   ├── MantenimientosView.jsx
│   │   ├── BackupsView.jsx
│   │   ├── HistorialUsuariosView.jsx
│   │   ├── ReportesView.jsx     # PDFs + CSVs + JSON + demo/reset
│   │   ├── EquipoDetalleModal.jsx  # Ficha 360, 4 pestanas
│   │   └── EquipoFormModal.jsx     # Form 19 campos crear/editar
│   ├── App.jsx                  # Orquestador + useLiveQuery x5 + counts
│   ├── App.css
│   ├── main.jsx                 # createRoot StrictMode
│   └── index.css                # Tailwind v4
├── index.html                   # Meta PWA + theme slate + SEO offline
├── vite.config.js               # tailwind + react + VitePWA/Workbox
├── generate-icons.js            # Generador PNG sin dependencias
├── package.json
└── README.md
```

---

## 🎨 Personalización

### Cambiar nombre, colores y manifiesto

- **Nombre app:** `vite.config.js` en `manifest.name` / `short_name`; `index.html` en `<title>` y meta description; `Navbar.jsx` (EquiposApp); `InstallPrompt.jsx` (textos del banner).
- **Colores PWA:** `theme_color` / `background_color` en `vite.config.js` + `<meta name="theme-color">` en `index.html` (actual: `#0f172a`).
- **Tema UI:** Tailwind v4 slate oscuro (`bg-slate-950`, `bg-slate-800/40`, acentos `blue-600`, `amber`, `emerald`, `cyan`, `purple`). Cambia clases por vista o ajusta `src/index.css`.
- **Iconos:** edita `getEquipmentIconColor()` en `generate-icons.js` y corre `node generate-icons.js`.

### Catálogos (tipos y estados)

## 👨‍💻 Guía para Desarrolladores

### Patrón de lectura/escritura (sin API ni Context)

```javascript
import { db, registrarActividad } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

// Leer reactivo (App.jsx lo pasa por props a las vistas)
const equipos = useLiveQuery(() => db.equipos.toArray()) || [];

// Crear
const newId = await db.equipos.add(dataToSave);
await registrarActividad('equipo', `Equipo creado: ${codigo} - ${nombre}`, newId);

// Actualizar / Borrar
await db.equipos.update(id, { estado: 'Operativo' });
await db.mantenimientos.delete(id);
```

### Reglas de negocio clave a respetar

1. **Reasignar persona** (`EquipoDetalleModal.jsx`): archivar actuales (`esActual=false`, `fechaFin=hoy`) e insertar nuevo (`esActual=true`), luego `db.equipos.update(equipoId, { usuarioActual })` + actividad.
2. **Mantenimiento En Proceso** (`MantenimientosView.jsx`): al crear con ese estado, equipo pasa a `En Mantenimiento`; al completar, si estaba así vuelve a `Operativo`.
3. **Crear equipo con usuario** (`EquipoFormModal.jsx`): además del `add`, inserta en `historialUsuarios` como "Responsable inicial" con `esActual=true`.
4. **Conteos únicos:** personas = `new Set(historial.filter(...).map(u => u.usuario.trim().toLowerCase())).size` (evita duplicados por mayúsculas/espacios).

### Agregar un campo nuevo (ej. `garantiaHasta` en equipos)

1. Añade el input en `EquipoFormModal.jsx` (`formData` + grid + `handleChange`).
2. Muéstralo en `EquipoDetalleModal.jsx` (pestaña especificaciones) y en columnas de `ReportesView.jsx` (CSV) + `exportPdf.js` si aplica.
3. Opcional: añade índice en `db.version(2).stores({...})` en `db.js` para filtrar por él (Dexie migra solo).
4. Siembra ejemplo en `seedData.js` y recarga demo.

### Agregar una vista nueva

1. Crea `src/views/MiVista.jsx` recibiendo `{ equipos, ... }` por props.
2. Regístrala en `App.jsx`: import + `currentTab === 'miVista' && <MiVista .../>`.
3. Añade item en `Sidebar.jsx` (`navItems`) y tab en `BottomNav.jsx` (icono lucide).
## 🔄 Flujos de Trabajo Comunes

### Flujo 1: Registrar un equipo nuevo y asignarlo

```
1. Navbar -> "Nuevo Equipo" (o Equipos -> "Agregar Equipo")
   - Codigo auto EQ-XXX (editable), nombre obligatorio
   - Llenar marca/modelo/serie/CPU/RAM/disco/SO/ubicacion/estado/valor
   - Escribir "Persona Asignada Actualmente" si ya tiene responsable
2. Guardar
   - Crea equipo + historial inicial ("Responsable inicial", esActual=true)
   - Registra actividad -> aparece en Dashboard y catalogo con "1 persona"
```

### Flujo 2: Reasignar equipo a otra persona

```
1. Equipos -> clic tarjeta -> ficha detalle -> pestana "Personas (N)"
2. "Asignar / Reasignar persona" -> nombre, cargo, motivo, estado entrega
3. Guardar
   - Anterior: esActual=false, fechaFin=hoy, "Devuelto por reasignacion"
   - Nuevo: esActual=true + equipo.usuarioActual actualizado
   - Contador "N personas" y ranking del dashboard se actualizan solos
```

### Flujo 3: Programar y cerrar un mantenimiento

```
1. Mantenimientos -> "Nuevo Mantenimiento" (o desde ficha del equipo)
   - Equipo, tipo, estado inicial, fecha + proxima, tecnico, costo, descripcion
2. Si estado = "En Proceso" -> equipo pasa a "En Mantenimiento" + badge ambar
3. Al terminar -> "Marcar completado"
   - Mantenimiento = Completado, equipo vuelve a Operativo
   - Costo alimenta el PDF de mantenimientos
```

### Flujo 4: Registrar y verificar un backup

```
1. Backups -> "Registrar Backup" -> equipo, tipo, estado, fecha/hora, destino, tamano
2. Marcar "verificada y recuperable" (o toggle despues en la tarjeta)
3. Auditoria: filtrar por equipo/destino, exportar CSV o PDF de backups
```

### Flujo 5: Cierre / migración entre dispositivos

```
## 📑 Reportes y Exportación

Todo se genera **100% en el cliente**, sin servidor (`src/utils/exportPdf.js` + `src/utils/exportCsv.js`).

### PDFs con jsPDF + autotable (`exportPdf.js`)

| Reporte | Función | Formato | Contenido |
|---------|---------|---------|-----------|
| Inventario general | `exportarReporteEquiposPDF(equipos, mantenimientos, usuarios)` | Landscape | Código, nombre, tipo, marca, estado, ubicación, usuario actual, N personas, pendientes |
| Mantenimientos | `exportarReporteMantenimientosPDF(mantenimientos, equiposMap)` | Landscape | Fecha, equipo, tipo, técnico, estado, próxima fecha, costo, descripción |
| Backups | `exportarReporteBackupsPDF(backups, equiposMap)` | Landscape | Fecha/hora, equipo, tipo, destino, tamaño, estado, verificado, notas |
| Ficha técnica | `exportarFichaTecnicaEquipoPDF(equipo, mantenimientos, backups, usuarios)` | Portrait | Datos generales + 3 tablas: historial personas, mantenimientos, backups |

Todos llevan membrete slate-900 + línea azul, título, subtítulo y fecha de emisión. Archivos: `Inventario_Equipos_YYYY-MM-DD.pdf`, `Reporte_Mantenimientos_...`, `Reporte_Backups_...`, `Ficha_EQ-XXX_....pdf`.

### CSV / Excel (`exportCsv.js` con `descargarCSV`)

- Separador `;`, valores entrecomillados, **BOM UTF-8** para tildes en Excel.
- 4 botones en Reportes: Equipos (12 col. incl. total personas únicas), Mantenimientos (10 col.), Backups (10 col.), Historial Personas (10 col.).
- Archivos: `Nombre_YYYY-MM-DD.csv`, abren directo en Excel / Google Sheets.

### Backup total JSON (`exportarBaseDatosJSON` / `importarBaseDatosJSON`)

```json
{
  "version": "1.0",
  "fechaExportacion": "2026-01-01T00:00:00.000Z",
  "datos": {
    "equipos": [],
    "mantenimientos": [],
    "backups": [],
    "historialUsuarios": [],
    "actividades": []
  }
}
```

- Exporta como `CopiaSeguridad_SistemaEquipos_YYYY-MM-DD.json`.
- Import valida `data.datos`, limpia las 5 tablas en transacción `rw` y hace `bulkAdd`. Retorna `{ success, message }` que Reportes muestra como alerta verde/roja.
## 🔒 Consideraciones de Seguridad

### Validaciones actuales

| Validación | Descripción |
|------------|-------------|
| **Nombre obligatorio** | `EquipoFormModal` bloquea guardar sin nombre; mantenimiento exige descripción; backup exige destino |
| **Equipo requerido** | No se puede crear mantenimiento/backup sin `equipoId` (alerta si catálogo vacío) |
| **Confirmaciones destructivas** | `confirm()` antes de eliminar equipo/mantenimiento/backup/historial, vaciar DB o recargar demo |
| **Restauración validada** | JSON sin `datos` muestra error "formato de respaldo no válido", sin romper la DB |

### Limitaciones (importante)

- **Sin autenticación ni roles:** cualquier persona con acceso al navegador ve y edita todo.
- **Sin encriptación en reposo:** IndexedDB guarda en texto plano local.
- **Sin backend:** no hay control servidor, auditoría firmada ni sincronización multiusuario real; migrar = archivo JSON manual.
- **Alcance de datos:** todo vive en el navegador/dispositivo; borrar caché del sitio borra la app.

> Para producción real, considerar: backend con login/roles, cifrado de campos sensibles (series, valores), backups automáticos programados, HTTPS siempre y control de acceso físico a los equipos.

---

## 🛠️ Solución de Problemas

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| **No se guardan los datos** | Verifica que IndexedDB esté permitido (modo incógnito bloquea persistencia); revisa consola por errores de Dexie |
| **Apareció vacío tras borrar caché** | El storage del sitio se eliminó; restaura tu último `.json` desde Reportes y Restaurar |
| **No aparece botón Instalar PWA** | Usa Chrome/Edge en `localhost` o HTTPS; en iOS usa Safari + "Añadir a pantalla de inicio" (guía integrada) |
| **La app no abre sin internet** | Corre `npm run build` y sirve `dist/` (el precache Workbox solo existe en build, no en `dev`) |
| **Error al importar JSON** | Confirma que sea un respaldo válido (`version`, `fechaExportacion`, `datos`); revisa el mensaje de Reportes |
| **Quiero volver a los datos de ejemplo** | Reportes y "Recargar Datos Demo" o Navbar y "Datos Demo" (reemplaza todo, pide confirmación) |
| **Error al iniciar / pantalla en blanco** | Limpia caché, `npm install`, `npm run dev`; corre `npm run lint` para errores |

### Resetear Datos de Demostración

- Desde UI: **Reportes y Recargar Datos Demo** (o Navbar y Datos Demo) con `inicializarDatosPrueba(true)`.
- Desde código: `await inicializarDatosPrueba(true)` en consola con la app corriendo.
- Vaciar todo: **Reportes y Vaciar Base de Datos** (limpia las 5 tablas).

---

## 💻 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.2 | Framework UI + hooks + StrictMode |
| **Vite** | 8.3 | Dev server HMR + build + preview |
| **@vitejs/plugin-react** | 6.1 | Integración React en Vite |
| **Tailwind CSS** | v4 (+ @tailwindcss/vite 4.3) | Estilos mobile-first, tema oscuro slate |
| **Dexie.js** | 4.4 | Wrapper IndexedDB (`GestionEquiposDB`) |
| **dexie-react-hooks** | 4.4 | `useLiveQuery` reactivo |
| **vite-plugin-pwa** | 1.3 + Workbox | Service Worker, Manifest, precache offline |
| **jsPDF** | 4.2 | Generación PDF en cliente |
| **jspdf-autotable** | 5.0 | Tablas en PDFs |
| **lucide-react** | 1.48 | Iconografía (Laptop, Wrench, Database, Users...) |
| **IndexedDB / Service Workers / Manifest** | Nativo navegador | Persistencia, offline e instalación |

---

## 📝 Licencia

Este proyecto es de código abierto. Consultar el archivo de licencia para más detalles.

---

## 📬 Contacto y Soporte

Para preguntas, sugerencias o reportes de problemas:

1. Revisar la documentación de este README (especialmente Solución de Problemas).
2. Examinar el código fuente en `src/` (componentes, vistas, `db/db.js`, `utils/`).
3. Reproducir con los datos demo (Recargar Datos Demo) antes de reportar un bug.
4. Revisar la consola del navegador (errores Dexie / PWA) y la versión (`package.json`).

---

*Documentación generada para EquiposApp v1.0 — Gestión Integral de Equipos y Mantenimientos (PWA Offline).*

- Desde código: `await inicializarDatosPrueba(true)` en consola con la app corriendo.
- Vaciar todo: **Reportes y Vaciar Base de Datos** (limpia las 5 tablas).

---


---

1. Reportes -> "Descargar Copia de Seguridad (.json)"
2. En el otro dispositivo/navegador -> "Restaurar Copia (.json)" y elegir archivo
   - Reemplaza las 5 tablas via transaccion Dexie
3. Verificar conteos en Dashboard + actividad reciente
4. Opcional: "Vaciar Base de Datos" para partir de cero o "Recargar Demo"
```

---

4. Si necesita tabla nueva, declárala en `db.js` con `version(2)` e inclúyela en backup/restore (`exportCsv.js`) y `seedData.js`.

---

- **Tipos equipo:** `EquipoFormModal.jsx` + `EquiposView.jsx` en `tiposDisponibles` (Laptop, Escritorio, Servidor, Impresora, Switch/Router, Tablet, Celular, Otro).
- **Estados equipo:** mismos archivos en `estadosDisponibles` (Operativo, En Mantenimiento, En Reparación, En Espera, De Baja).
- **Tipos mantenimiento:** `MantenimientosView.jsx` + `EquipoDetalleModal.jsx` (Preventivo, Correctivo, Limpieza, Actualización de Software, Diagnóstico).
- **Tipos backup:** `BackupsView.jsx` + detalle (Completa, Incremental, Imagen de Disco, Base de Datos, Archivos de Usuario).
- **Datos demo:** edita `datosIniciales` en `src/utils/seedData.js` y pulsa "Recargar Datos Demo".

### Reportes PDF

Membrete en `agregarEncabezado(doc, titulo, subtitulo)` de `src/utils/exportPdf.js` (barra slate-900 + línea blue-600). Cambia textos, `fillColor` y columnas de cada `autoTable` según tu empresa.

---

---

---


---


**Descripción:** Centro de exportación y administración (detalle en la sección Reportes y Exportación).

- Reportes PDF (inventario, mantenimientos, backups, ficha técnica individual).
- Exportaciones CSV (4 tablas, compatible Excel con BOM UTF-8 y separador `;`).
- Backup/restore total JSON + recargar demo + vaciar DB.

---


**Descripción:** Agenda técnica de preventivos, correctivos, limpiezas, actualizaciones y diagnósticos.

**Campos:** `equipoId`, `tipo` (Preventivo, Correctivo, Limpieza, Actualización de Software, Diagnóstico), `estado` (Pendiente, En Proceso, Completado), `fecha`, `fechaProxima`, `tecnico`, `costo` (USD), `descripcion`, `piezasCambiadas`.

**Funcionalidades:**

- Crear desde la vista o desde la ficha del equipo (pre-rellena equipo y fecha).
- Integración con inventario: si se crea "En Proceso" el equipo pasa a `En Mantenimiento`; al completar vuelve a `Operativo`.
- Botón "Marcar completado" en un clic + `registrarActividad()`.
- Búsqueda por tipo, técnico, descripción o equipo + filtros Todos / Pendientes / Completados.
- Costos acumulables para el reporte PDF. Eliminar con confirmación.

---

- `InstallPrompt` — Banner `beforeinstallprompt` en Android + guía iOS + detección `standalone`.

---

