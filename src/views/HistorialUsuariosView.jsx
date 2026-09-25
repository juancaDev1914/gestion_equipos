import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Laptop, 
  Calendar, 
  UserCheck, 
  Clock, 
  ArrowRight,
  Plus,
  Trash2
} from 'lucide-react';
import { db, registrarActividad } from '../db/db';

export default function HistorialUsuariosView({ 
  equipos = [], 
  historialUsuarios = [], 
  onSelectEquipo 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroSoloActuales, setFiltroSoloActuales] = useState(false);

  const equiposMap = equipos.reduce((acc, eq) => {
    acc[eq.id] = eq;
    return acc;
  }, {});

  // Agrupar usuarios por persona única
  const asignacionesFiltradas = historialUsuarios.filter((u) => {
    const eq = equiposMap[u.equipoId] || {};
    const q = busqueda.toLowerCase().trim();
    const coincide = 
      !q ||
      u.usuario.toLowerCase().includes(q) ||
      u.cargo?.toLowerCase().includes(q) ||
      u.departamento?.toLowerCase().includes(q) ||
      u.motivo?.toLowerCase().includes(q) ||
      eq.nombre?.toLowerCase().includes(q) ||
      eq.codigo?.toLowerCase().includes(q);

    if (filtroSoloActuales) {
      return coincide && u.esActual;
    }
    return coincide;
  });

  const handleEliminarHistorial = async (id, e) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este registro del historial de uso?')) {
      await db.historialUsuarios.delete(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Historial de Personas y Asignaciones</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Registro cronológico de quién ha utilizado cada equipo y estado de entregas
          </p>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre de persona, cargo, equipo o código..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2 self-center sm:self-auto">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
            <input
              type="checkbox"
              checked={filtroSoloActuales}
              onChange={(e) => setFiltroSoloActuales(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Solo usuarios actuales</span>
          </label>
        </div>
      </div>

      {/* Tarjetas de Asignación */}
      {asignacionesFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/40 p-6 space-y-2">
          <Users className="w-12 h-12 mx-auto text-slate-500" />
          <h3 className="text-base font-semibold text-slate-300">No hay registros de personas</h3>
          <p className="text-xs text-slate-400">
            {busqueda ? 'No hay resultados que coincidan con la búsqueda.' : 'Asigna equipos a personas para llevar el historial completo.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {asignacionesFiltradas.map((u) => {
            const eq = equiposMap[u.equipoId] || {};

            return (
              <div
                key={u.id}
                onClick={() => eq.id && onSelectEquipo(eq)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  u.esActual
                    ? 'bg-purple-950/20 hover:bg-purple-950/30 border-purple-500/40'
                    : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Persona */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      u.esActual ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {u.usuario.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">{u.usuario}</h3>
                        {u.esActual ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            En Uso Actualmente
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                            Uso Anterior
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {u.cargo ? `${u.cargo} • ` : ''}{u.departamento || 'Área general'}
                      </p>
                    </div>
                  </div>

                  {/* Equipo Vinculado */}
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700">
                    <Laptop className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-white font-mono">{eq.codigo || 'EQ'}</span>
                      <span className="text-xs text-slate-300 ml-1.5">{eq.nombre || 'Equipo'}</span>
                    </div>
                  </div>
                </div>

                {/* Fechas y Condiciones */}
                <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
                  <div className="flex flex-wrap items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Desde: <strong>{u.fechaInicio}</strong>
                    </span>
                    <span>➔</span>
                    <span className="flex items-center gap-1">
                      Hasta: <strong className={u.esActual ? 'text-emerald-400' : 'text-slate-300'}>
                        {u.fechaFin ? u.fechaFin : 'Presente'}
                      </strong>
                    </span>
                  </div>

                  {u.motivo && (
                    <span className="text-slate-400 text-[11px]">
                      Motivo: <strong className="text-slate-200">{u.motivo}</strong>
                    </span>
                  )}

                  <button
                    onClick={(e) => handleEliminarHistorial(u.id, e)}
                    className="self-end sm:self-auto text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Eliminar este registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(u.estadoEntrega || u.estadoDevolucion) && (
                  <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800 space-y-0.5">
                    {u.estadoEntrega && <p><strong>Estado entrega:</strong> {u.estadoEntrega}</p>}
                    {u.estadoDevolucion && <p><strong>Estado devolución:</strong> {u.estadoDevolucion}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
