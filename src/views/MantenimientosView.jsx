import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  User, 
  Trash2,
  Laptop
} from 'lucide-react';
import Modal from '../components/Modal';
import { db, registrarActividad } from '../db/db';

export default function MantenimientosView({ 
  mantenimientos = [], 
  equipos = [], 
  onSelectEquipo 
}) {
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    equipoId: equipos[0]?.id || '',
    tipo: 'Preventivo',
    estado: 'Pendiente',
    fecha: new Date().toISOString().slice(0, 10),
    fechaProxima: '',
    tecnico: '',
    costo: '',
    descripcion: '',
    piezasCambiadas: ''
  });

  const equiposMap = equipos.reduce((acc, eq) => {
    acc[eq.id] = eq;
    return acc;
  }, {});

  const mantenimientosFiltrados = mantenimientos.filter((m) => {
    const eq = equiposMap[m.equipoId] || {};
    const q = busqueda.toLowerCase().trim();
    const coincideBusqueda = 
      !q || 
      m.tipo.toLowerCase().includes(q) ||
      m.tecnico?.toLowerCase().includes(q) ||
      m.descripcion?.toLowerCase().includes(q) ||
      eq.nombre?.toLowerCase().includes(q) ||
      eq.codigo?.toLowerCase().includes(q);

    const coincideEstado = 
      filtroEstado === 'Todos' ||
      (filtroEstado === 'Pendientes' && (m.estado === 'Pendiente' || m.estado === 'En Proceso')) ||
      (filtroEstado === 'Completados' && m.estado === 'Completado');

    return coincideBusqueda && coincideEstado;
  });

  const handleCrearMantenimiento = async (e) => {
    e.preventDefault();
    if (!formData.equipoId) {
      alert('Debes seleccionar un equipo.');
      return;
    }

    const eqId = Number(formData.equipoId);
    await db.mantenimientos.add({
      ...formData,
      equipoId: eqId,
      costo: formData.costo ? Number(formData.costo) : 0
    });

    const eq = equiposMap[eqId];
    if (formData.estado === 'En Proceso') {
      await db.equipos.update(eqId, { estado: 'En Mantenimiento' });
    }

    await registrarActividad('mantenimiento', `Mantenimiento ${formData.tipo} programado para ${eq?.codigo || 'Equipo'}`, eqId);

    setShowModal(false);
    setFormData({
      equipoId: equipos[0]?.id || '',
      tipo: 'Preventivo',
      estado: 'Pendiente',
      fecha: new Date().toISOString().slice(0, 10),
      fechaProxima: '',
      tecnico: '',
      costo: '',
      descripcion: '',
      piezasCambiadas: ''
    });
  };

  const handleMarcarCompletado = async (m) => {
    await db.mantenimientos.update(m.id, { estado: 'Completado' });
    const eq = equiposMap[m.equipoId];
    if (eq && eq.estado === 'En Mantenimiento') {
      await db.equipos.update(eq.id, { estado: 'Operativo' });
    }
    await registrarActividad('mantenimiento', `Mantenimiento completado en ${eq?.codigo || 'Equipo'}`, m.equipoId);
  };

  const handleEliminar = async (m) => {
    if (confirm('¿Eliminar este registro de mantenimiento?')) {
      await db.mantenimientos.delete(m.id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Gestión de Mantenimientos</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Planificación y seguimiento técnico de revisiones preventivas y correctivas
          </p>
        </div>
        <button
          onClick={() => {
            if (equipos.length === 0) {
              alert('Primero debes registrar al menos un equipo en el catálogo.');
              return;
            }
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Mantenimiento</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por equipo, técnico, descripción..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          {['Todos', 'Pendientes', 'Completados'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFiltroEstado(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filtroEstado === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Mantenimientos */}
      {mantenimientosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/40 p-6 space-y-2">
          <Wrench className="w-12 h-12 mx-auto text-slate-500" />
          <h3 className="text-base font-semibold text-slate-300">No hay registros de mantenimientos</h3>
          <p className="text-xs text-slate-400">
            {busqueda ? 'No hay resultados que coincidan con la búsqueda.' : 'Programa un mantenimiento para empezar a rastrear el estado del equipo.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mantenimientosFiltrados.map((m) => {
            const eq = equiposMap[m.equipoId] || {};
            const esPendiente = m.estado === 'Pendiente' || m.estado === 'En Proceso';

            return (
              <div
                key={m.id}
                className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      m.tipo === 'Preventivo'
                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {m.tipo}
                    </span>

                    <button
                      onClick={() => eq.id && onSelectEquipo(eq)}
                      className="flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-blue-300 hover:text-white border border-slate-700 cursor-pointer"
                      title="Ver ficha de este equipo"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>{eq.codigo || 'EQ'} - {eq.nombre || 'Equipo Desconocido'}</span>
                    </button>

                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      m.estado === 'Completado'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
                    }`}>
                      {m.estado}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    {m.descripcion}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Fecha: {m.fecha}
                    </span>
                    {m.fechaProxima && (
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Clock className="w-3.5 h-3.5" />
                        Próximo: {m.fechaProxima}
                      </span>
                    )}
                    {m.tecnico && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Técnico: {m.tecnico}
                      </span>
                    )}
                    {m.costo > 0 && (
                      <span className="font-semibold text-emerald-400">
                        ${m.costo} USD
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {esPendiente && (
                    <button
                      onClick={() => handleMarcarCompletado(m)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completado</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminar(m)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Programar Mantenimiento */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Programar Nuevo Mantenimiento"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCrearMantenimiento} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seleccionar Equipo *</label>
              <select
                required
                value={formData.equipoId}
                onChange={(e) => setFormData({ ...formData, equipoId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {equipos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.codigo} - {eq.nombre} ({eq.ubicacion || 'Sin área'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Mantenimiento</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Limpieza">Limpieza de Hardware</option>
                  <option value="Actualización">Actualización Software</option>
                  <option value="Diagnóstico">Diagnóstico Técnico</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Pendiente">Pendiente / Programado</option>
                  <option value="En Proceso">En Taller / Proceso</option>
                  <option value="Completado">Ya Realizado / Completado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Programada</label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Próxima Fecha Sugerida</label>
                <input
                  type="date"
                  value={formData.fechaProxima}
                  onChange={(e) => setFormData({ ...formData, fechaProxima: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Técnico o Proveedor</label>
                <input
                  type="text"
                  value={formData.tecnico}
                  onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                  placeholder="Ej. Soporte Interno / Dell"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Costo Estimado ($ USD)</label>
                <input
                  type="number"
                  value={formData.costo}
                  onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción de las Tareas *</label>
              <textarea
                required
                rows="3"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Detalle de actividades a realizar, piezas a cambiar..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30"
              >
                Guardar Registro
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
