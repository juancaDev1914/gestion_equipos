import React, { useState, useMemo } from 'react';
import { 
  Laptop, 
  Search, 
  Filter, 
  Plus, 
  Users, 
  MapPin, 
  Wrench, 
  Database, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function EquiposView({ 
  equipos = [], 
  mantenimientos = [], 
  backups = [], 
  historialUsuarios = [], 
  onSelectEquipo, 
  onNewEquipo 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Mapeos de conteo de usuarios y mantenimientos
  const metadataEquipos = useMemo(() => {
    return equipos.map(eq => {
      const users = historialUsuarios.filter(u => u.equipoId === eq.id);
      const totalPersonas = new Set(users.map(u => u.usuario.trim().toLowerCase())).size;
      const mantPendientes = mantenimientos.filter(m => m.equipoId === eq.id && m.estado === 'Pendiente').length;
      const totalBackups = backups.filter(b => b.equipoId === eq.id).length;

      return {
        ...eq,
        totalPersonas,
        mantPendientes,
        totalBackups
      };
    });
  }, [equipos, historialUsuarios, mantenimientos, backups]);

  // Filtrado reactivo
  const equiposFiltrados = useMemo(() => {
    return metadataEquipos.filter(eq => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda = 
        !q ||
        eq.nombre?.toLowerCase().includes(q) ||
        eq.codigo?.toLowerCase().includes(q) ||
        eq.marca?.toLowerCase().includes(q) ||
        eq.modelo?.toLowerCase().includes(q) ||
        eq.serie?.toLowerCase().includes(q) ||
        eq.usuarioActual?.toLowerCase().includes(q) ||
        eq.ubicacion?.toLowerCase().includes(q);

      const coincideTipo = filtroTipo === 'Todos' || eq.tipo === filtroTipo;
      const coincideEstado = filtroEstado === 'Todos' || eq.estado === filtroEstado;

      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  }, [metadataEquipos, busqueda, filtroTipo, filtroEstado]);

  const tiposDisponibles = ['Todos', 'Laptop', 'Escritorio', 'Servidor', 'Impresora', 'Switch/Router', 'Tablet', 'Celular', 'Otro'];
  const estadosDisponibles = ['Todos', 'Operativo', 'En Mantenimiento', 'En Reparación', 'En Espera', 'De Baja'];

  return (
    <div className="space-y-5">
      {/* Cabecera y Botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Catálogo de Equipos</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {equipos.length} dispositivos registrados en el sistema local
          </p>
        </div>
        <button
          onClick={onNewEquipo}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Equipo</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
        {/* Input de Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, nombre, serial, marca o usuario..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filtros por Botones y Selects */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          {/* Scroll horizontal para tipos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {tiposDisponibles.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filtroTipo === tipo
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-xs text-slate-400">Estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {estadosDisponibles.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Equipos */}
      {equiposFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/40 p-6 space-y-3">
          <Laptop className="w-12 h-12 mx-auto text-slate-500" />
          <h3 className="text-base font-semibold text-slate-300">No se encontraron equipos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {busqueda || filtroTipo !== 'Todos' || filtroEstado !== 'Todos'
              ? 'Prueba cambiando los términos de búsqueda o limpiando los filtros.'
              : 'Empieza registrando tu primer equipo para llevar el control de mantenimientos y personas.'}
          </p>
          <button
            onClick={onNewEquipo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Primer Equipo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {equiposFiltrados.map((eq) => (
            <div
              key={eq.id}
              onClick={() => onSelectEquipo(eq)}
              className="group bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-blue-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-md cursor-pointer hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5"
            >
              {/* Parte Superior: Código, Tipo, Estado */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                        {eq.codigo}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{eq.tipo} • {eq.marca || 'Genérico'}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                    eq.estado === 'Operativo'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : eq.estado === 'En Mantenimiento'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {eq.estado}
                  </span>
                </div>

                {/* Nombre / Modelo */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {eq.nombre}
                  </h3>
                  {eq.serie && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      S/N: {eq.serie}
                    </p>
                  )}
                </div>

                {/* Datos de Asignación y Ubicación */}
                <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 text-[11px]">Usuario Actual:</span>
                    <span className="font-semibold text-blue-300 truncate max-w-[150px]">
                      {eq.usuarioActual || 'Libre / En Bodega'}
                    </span>
                  </div>
                  {eq.ubicacion && (
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Ubicación:</span>
                      <span className="text-slate-300 truncate max-w-[150px] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {eq.ubicacion}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parte Inferior: Badges de Historial y Mantenimiento */}
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                {/* Contador de Personas que lo han usado */}
                <span 
                  className="flex items-center gap-1.5 text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 text-[11px] font-semibold"
                  title="Cantidad de personas que han usado este equipo a lo largo del tiempo"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{eq.totalPersonas} {eq.totalPersonas === 1 ? 'persona' : 'personas'}</span>
                </span>

                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  {eq.mantPendientes > 0 ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      {eq.mantPendientes} pend.
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {eq.totalBackups} bkp
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
