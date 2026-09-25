# EquiposApp - Gestión Integral de Equipos & Mantenimientos (PWA Offline)

Aplicación web progresiva (**PWA**) desarrollada con **React** y **Vite**, diseñada para funcionar **100% sin conexión a internet (Offline-First)** y con experiencia táctil nativa tanto en teléfonos móviles como en ordenadores de escritorio.

---

## 🚀 Características Principales

1. **Gestión Completa de Equipos:**
   - Registro de computadores portátiles, PCs de escritorio, servidores, impresoras, switches/routers, tablets y otros dispositivos.
   - Especificaciones técnicas: Procesador (CPU), Memoria RAM, Almacenamiento, Sistema Operativo, Número de Serie (S/N), Ubicación/Departamento, Valor Estimado y Estado Operativo.
   - Filtros en tiempo real por tipo de dispositivo y estado (Operativo, En Mantenimiento, En Reparación, En Espera, De Baja).

2. **Historial de Personas / Usuarios por Equipo:**
   - **Contador dinámico:** visualiza cuántas personas distintas han utilizado cada equipo a lo largo de su ciclo de vida.
   - Registro cronológico de asignaciones con fechas de entrega y devolución, motivo (ingreso, préstamo temporal, proyecto) y estado físico del equipo al entregarse/recibirse.
   - Reasignación rápida que actualiza automáticamente al usuario activo y archiva al anterior.

3. **Mantenimientos Técnicos:**
   - Registro de mantenimientos Preventivos, Correctivos, Limpiezas, Actualizaciones de Software y Diagnósticos.
   - Programación de próximas fechas de revisión con alertas para evitar vencimientos.
   - Registro de costos, técnicos responsables y descripción detallada de tareas realizadas.

4. **Copias de Seguridad (Backups):**
   - Auditoría de respaldos (Copias completas, incrementales, imágenes de disco, bases de datos o archivos de usuario).
   - Registro de medios y destinos (NAS local, discos externos, nube corporativa), tamaño en GB/MB y verificación de integridad.

5. **100% Offline con Persistencia en el Navegador (IndexedDB & PWA):**
   - Utiliza **IndexedDB** a través de **Dexie.js**, garantizando que los datos nunca se pierdan al cerrar el navegador o reiniciar el dispositivo.
   - Incluye **Service Worker** con precache de recursos: la aplicación abre y funciona perfectamente en modo avión o sin red Wi-Fi/datos móviles.
   - Indicador visual en tiempo real de estado En línea / Modo Offline.

6. **Dashboard Interactivo:**
   - Métricas clave (KPIs) en tiempo real: Total equipos, equipos en mantenimiento, revisiones pendientes, personas registradas.
   - Gráficos visuales de distribución por tipo de equipo.
   - Ranking de equipos con mayor rotación de personas.
   - Feed de actividad reciente del sistema.

7. **Reportes Profesionales y Exportación:**
   - **PDF:** Reporte general de inventario, reporte de mantenimientos con costos, reporte de backups y **Ficha Técnica Individual** con historial completo de personas del equipo. Generado 100% en el cliente sin servidores.
   - **Excel / CSV:** Exportación de tablas con codificación UTF-8 compatible con Microsoft Excel y Google Sheets.
   - **Copia de Seguridad del Sistema en JSON:** Descarga y restaura la base de datos completa con un solo clic para transferirla entre dispositivos o navegadores.

8. **Experiencia Nativa en Móviles:**
   - Barra de navegación inferior (Bottom Navigation) adaptada a gestos táctiles.
   - Botón directo de **Instalación PWA** para agregar la app a la pantalla de inicio en Android, Windows, Mac y guía para iOS Safari.

---

## 💻 Instrucciones de Uso y Ejecución

### 1. Iniciar en Modo Desarrollo

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd "c:\Users\juanka\Documents\PROGRAMACION\Aplicaciones\gestion_equipos"
npm run dev
```

Abre tu navegador en la URL mostrada (generalmente `http://localhost:5173`).

### 2. Probar en tu Teléfono Móvil

1. Asegúrate de que tu teléfono y tu computadora estén conectados a la misma red Wi-Fi.
2. Inicia el servidor de desarrollo exponiendo la red local:
   ```bash
   npm run dev -- --host
   ```
3. En la terminal verás una dirección IP local (ejemplo: `http://192.168.1.X:5173`).
4. Abre esa dirección en el navegador de tu teléfono (Chrome en Android o Safari en iPhone).
5. Pulsa en el banner superior **"Instalar EquiposApp en tu teléfono"** o usa la opción "Añadir a la pantalla de inicio".
6. ¡Listo! La aplicación se instalará como una app nativa con su propio icono y funcionará incluso desconectando el Wi-Fi.

### 3. Generar Versión de Producción

```bash
npm run build
```

---

## 🛠️ Tecnologías Utilizadas

- **React 19 & Vite 8:** Rendimiento ultrarrápido y reactividad moderna.
- **Tailwind CSS v4:** Estilos modernos, responsivos, tema oscuro Slate y diseño mobile-first.
- **Dexie.js & dexie-react-hooks:** Almacenamiento local persistente en IndexedDB con consultas en tiempo real.
- **vite-plugin-pwa & Workbox:** Service Worker, Web App Manifest e instalación offline.
- **jsPDF & jspdf-autotable:** Generación de documentos PDF profesionales en el navegador.
- **Lucide React:** Iconografía vectorial estilizada y consistente.
