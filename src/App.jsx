import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import { inicializarDatosPrueba } from './utils/seedData';

// Componentes estructurales
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import InstallPrompt from './components/InstallPrompt';

// Vistas
import DashboardView from './views/DashboardView';
import EquiposView from './views/EquiposView';
import MantenimientosView from './views/MantenimientosView';
import BackupsView from './views/BackupsView';
import HistorialUsuariosView from './views/HistorialUsuariosView';
import ReportesView from './views/ReportesView';

// Modales
import EquipoFormModal from './views/EquipoFormModal';
import EquipoDetalleModal from './views/EquipoDetalleModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isNewEquipoOpen, setIsNewEquipoOpen] = useState(false);
  const [equipoParaEditar, setEquipoParaEditar] = useState(null);
  const [equipoSeleccionadoDetalle, setEquipoSeleccionadoDetalle] = useState(null);

  // Inicialización de datos de prueba si la base de datos está vacía
  useEffect(() => {
    inicializarDatosPrueba(false);
  }, []);

  // Consultas reactivas automáticas a IndexedDB con Dexie Live Query
  const equipos = useLiveQuery(() => db.equipos.toArray()) || [];
  const mantenimientos = useLiveQuery(() => db.mantenimientos.toArray()) || [];
  const backups = useLiveQuery(() => db.backups.toArray()) || [];
  const historialUsuarios = useLiveQuery(() => db.historialUsuarios.toArray()) || [];
  const actividades = useLiveQuery(() => db.actividades.reverse().limit(15).toArray()) || [];

  // Mantener actualizado el equipo del modal de detalle si cambia en la base de datos
  const equipoDetalleActual = equipoSeleccionadoDetalle
    ? equipos.find(e => e.id === equipoSeleccionadoDetalle.id) || null
    : null;

  // Conteos para insignias de la barra de navegación
  const mantenimientosPendientes = mantenimientos.filter(
    m => m.estado === 'Pendiente' || m.estado === 'En Proceso'
  ).length;

  const counts = {
    equipos: equipos.length,
    mantenimientosPendientes,
    backups: backups.length,
    usuarios: new Set(historialUsuarios.map(u => u.usuario.trim().toLowerCase())).size
  };

  const handleOpenEdit = (equipo) => {
    setEquipoParaEditar(equipo);
    setIsNewEquipoOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-20 lg:pb-6">
      {/* Cabecera Superior */}
      <Navbar 
        onOpenNewEquipo={() => {
          setEquipoParaEditar(null);
          setIsNewEquipoOpen(true);
        }}
        onDatosRestaurados={() => {}}
      />

      {/* Contenedor Principal */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Barra Lateral en Pantallas Grandes */}
        <Sidebar
          currentTab={currentTab}
          setTab={setCurrentTab}
          counts={counts}
        />

        {/* Área de Contenido Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {/* Banner de instalación PWA nativa */}
          <InstallPrompt />

          {/* Vistas Dinámicas */}
          {currentTab === 'dashboard' && (
            <DashboardView
              equipos={equipos}
              mantenimientos={mantenimientos}
              backups={backups}
              historialUsuarios={historialUsuarios}
              actividades={actividades}
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectEquipo={(eq) => setEquipoSeleccionadoDetalle(eq)}
            />
          )}

          {currentTab === 'equipos' && (
            <EquiposView
              equipos={equipos}
              mantenimientos={mantenimientos}
              backups={backups}
              historialUsuarios={historialUsuarios}
              onSelectEquipo={(eq) => setEquipoSeleccionadoDetalle(eq)}
              onNewEquipo={() => {
                setEquipoParaEditar(null);
                setIsNewEquipoOpen(true);
              }}
            />
          )}

          {currentTab === 'mantenimientos' && (
            <MantenimientosView
              mantenimientos={mantenimientos}
              equipos={equipos}
              onSelectEquipo={(eq) => setEquipoSeleccionadoDetalle(eq)}
            />
          )}

          {currentTab === 'backups' && (
            <BackupsView
              backups={backups}
              equipos={equipos}
              onSelectEquipo={(eq) => setEquipoSeleccionadoDetalle(eq)}
            />
          )}

          {currentTab === 'usuarios' && (
            <HistorialUsuariosView
              equipos={equipos}
              historialUsuarios={historialUsuarios}
              onSelectEquipo={(eq) => setEquipoSeleccionadoDetalle(eq)}
            />
          )}

          {currentTab === 'reportes' && (
            <ReportesView
              equipos={equipos}
              mantenimientos={mantenimientos}
              backups={backups}
              historialUsuarios={historialUsuarios}
              onDatosRestaurados={() => {}}
            />
          )}
        </main>
      </div>

      {/* Barra de Navegación Inferior Móvil (Estilo App Nativa) */}
      <BottomNav
        currentTab={currentTab}
        setTab={setCurrentTab}
        counts={counts}
      />

      {/* Modal para Crear o Editar Equipo */}
      {isNewEquipoOpen && (
        <EquipoFormModal
          isOpen={isNewEquipoOpen}
          onClose={() => {
            setIsNewEquipoOpen(false);
            setEquipoParaEditar(null);
          }}
          equipoParaEditar={equipoParaEditar}
        />
      )}

      {/* Modal de Detalle Completo del Equipo (con Historial de Personas, Mantenimientos y Backups) */}
      {equipoDetalleActual && (
        <EquipoDetalleModal
          isOpen={!!equipoDetalleActual}
          onClose={() => setEquipoSeleccionadoDetalle(null)}
          equipo={equipoDetalleActual}
          mantenimientos={mantenimientos}
          backups={backups}
          historialUsuarios={historialUsuarios}
          onEditEquipo={(eq) => handleOpenEdit(eq)}
          onDeleted={() => setEquipoSeleccionadoDetalle(null)}
        />
      )}
    </div>
  );
}
