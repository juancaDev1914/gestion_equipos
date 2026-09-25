import React from 'react';
import StatCard from '../components/StatCard';
import { 
  Laptop, 
  Wrench, 
  Database, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function DashboardView({ 
  equipos = [], 
  mantenimientos = [], 
  backups = [], 
  historialUsuarios = [], 
  actividades = [],
  onNavigate,
  onSelectEquipo
}) {
  // Cálculos de métricas
  const totalEquipos = equipos.length;
  const operativos = equipos.filter(e => e.estado === 'Operativo').length;
  const enMantenimiento = equipos.filter(e => e.estado === 'En Mantenimiento' || e.estado === 'En Reparación').length;
  const pendientes = mantenimientos.filter(m => m.estado === 'Pendiente' || m.estado === 'En Proceso').length;
  const totalBackups = backups.length;
  
  // Total personas registradas
  const personasUnicas = new Set(historialUsuarios.map(u => u.usuario.trim().toLowerCase())).size;

  // Equipos con más usuarios
  const conteoUsuariosPorEquipo = equipos.map(eq => {
    const usuariosEq = historialUsuarios.filter(u => u.equipoId === eq.id);
    const unicos = new Set(usuariosEq.map(u => u.usuario.trim().toLowerCase())).size;
    return {
      equipo: eq,
      totalUsuarios: unicos
    };
  }).sort((a, b) => b.totalUsuarios - a.totalUsuarios).slice(0, 4);

  // Mantenimientos próximos (pendientes)
  const proximosMantenimientos = mantenimientos
    .filter(m => m.estado === 'Pendiente' || m.estado === 'En Proceso')
    .slice(0, 5);

  // Mapeo para nombres de equipos
  const equiposMap = equipos.reduce((acc, eq) => {
    acc[eq.id] = eq;
    return acc;
  }, {});

  // Distribución por tipos de equipo
  const tiposContados = equipos.reduce((acc, eq) => {
    acc[eq.tipo] = (acc[eq.tipo] || 0) + 1;
    return acc;
  }, {});

  const tiposList = Object.entries(tiposContados).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Saludo y Resumen Rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Panel de Control de Equipos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitoreo en tiempo real de inventario, mantenimientos preventivos y copias de seguridad.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            100% Offline & Persistente
          </span>
        </div>
      </div>

      {/* Grid de Métricas Principales (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total de Equipos"
          value={totalEquipos}
          subtitle={`${operativos} operativos`}
          icon={Laptop}
          color="blue"
          onClick={() => onNavigate('equipos')}
        />
        <StatCard
          title="En Mantenimiento"
          value={enMantenimiento}
          subtitle={enMantenimiento > 0 ? 'Equipos en taller' : 'Todos operativos'}
          icon={Wrench}
          color={enMantenimiento > 0 ? 'amber' : 'emerald'}
          alert={enMantenimiento > 0}
          onClick={() => onNavigate('mantenimientos')}
        />
        <StatCard
          title="Mant. Pendientes"
          value={pendientes}
          subtitle={`${pendientes} por realizar`}
          icon={Clock}
          color={pendientes > 0 ? 'rose' : 'cyan'}
          alert={pendientes > 0}
          onClick={() => onNavigate('mantenimientos')}
        />
        <StatCard
          title="Personas en Historial"
          value={personasUnicas}
          subtitle="Usuarios registrados"
          icon={Users}
          color="purple"
          onClick={() => onNavigate('usuarios')}
        />
      </div>

      {/* Sección Gráfica y Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Distribución por Tipo de Equipo */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Inventario por Tipo de Dispositivo</span>
          </h3>

          <div className="space-y-3">
            {tiposList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Sin equipos registrados aún.</p>
            ) : (
              tiposList.map(([tipo, count]) => {
                const porcentaje = Math.round((count / totalEquipos) * 100);
                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">{tipo}</span>
                      <span className="text-slate-400">{count} ({porcentaje}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700/60 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Equipos con Mayor Rotación de Personas */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Mayor Historial de Personas</span>
            </h3>
            <button 
              onClick={() => onNavigate('usuarios')} 
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {conteoUsuariosPorEquipo.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No hay asignaciones registradas.</p>
            ) : (
              conteoUsuariosPorEquipo.map(({ equipo, totalUsuarios }) => (
                <div
                  key={equipo.id}
                  onClick={() => onSelectEquipo(equipo)}
                  className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{equipo.codigo} - {equipo.nombre}</p>
                      <p className="text-[11px] text-slate-400 truncate">Actual: {equipo.usuarioActual || 'Libre'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap ml-2">
                    {totalUsuarios} {totalUsuarios === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mantenimientos Pendientes y Próximos */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Mantenimientos Próximos</span>
            </h3>
            <button 
              onClick={() => onNavigate('mantenimientos')} 
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver agenda</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {proximosMantenimientos.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                <p className="text-xs font-medium text-slate-300">¡Al día!</p>
                <p className="text-[11px]">No hay mantenimientos pendientes por ahora.</p>
              </div>
            ) : (
              proximosMantenimientos.map((m) => {
                const eq = equiposMap[m.equipoId] || {};
                return (
                  <div
                    key={m.id}
                    onClick={() => eq.id && onSelectEquipo(eq)}
                    className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 space-y-1 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400">{m.tipo}</span>
                      <span className="text-[11px] text-slate-400">{m.fechaProxima || m.fecha}</span>
                    </div>
                    <p className="text-xs text-slate-200 truncate">{eq.codigo ? `${eq.codigo} - ${eq.nombre}` : 'Equipo'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{m.descripcion}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Timeline de Actividad Reciente */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Actividad Reciente del Sistema</span>
        </h3>

        {actividades.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No se han registrado acciones recientes.</p>
        ) : (
          <div className="space-y-2">
            {actividades.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-200">{act.descripcion}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(act.fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
