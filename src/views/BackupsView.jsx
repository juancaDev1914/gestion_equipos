import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  Cloud, 
  Calendar, 
  Trash2,
  Laptop,
  ShieldCheck
} from 'lucide-react';
import Modal from '../components/Modal';
import { db, registrarActividad } from '../db/db';

export default function BackupsView({ 
  backups = [], 
  equipos = [], 
  onSelectEquipo 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    equipoId: equipos[0]?.id || '',
    tipo: 'Completa',
    estado: 'Exitoso',
    fecha: new Date().toISOString().slice(0, 16),
    destino: 'Disco Externo / Servidor Local',
    tamano: '',
    verificado: true,
    notas: ''
  });

  const equiposMap = equipos.reduce((acc, eq) => {
    acc[eq.id] = eq;
    return acc;
  }, {});

  const backupsFiltrados = backups.filter((b) => {
    const eq = equiposMap[b.equipoId] || {};
    const q = busqueda.toLowerCase().trim();
    return (
      !q ||
      b.tipo.toLowerCase().includes(q) ||
      b.destino?.toLowerCase().includes(q) ||
      b.notas?.toLowerCase().includes(q) ||
      eq.nombre?.toLowerCase().includes(q) ||
      eq.codigo?.toLowerCase().includes(q)
    );
  });

  const handleCrearBackup = async (e) => {
    e.preventDefault();
    if (!formData.equipoId) {
      alert('Debes seleccionar un equipo.');
      return;
    }

    const eqId = Number(formData.equipoId);
    await db.backups.add({
      ...formData,
      equipoId: eqId
    });

    const eq = equiposMap[eqId];
    await registrarActividad('backup', `Copia de seguridad registrada para ${eq?.codigo || 'Equipo'}: ${formData.tipo}`, eqId);

    setShowModal(false);
    setFormData({
      equipoId: equipos[0]?.id || '',
      tipo: 'Completa',
      estado: 'Exitoso',
      fecha: new Date().toISOString().slice(0, 16),
      destino: 'Disco Externo / Servidor Local',
      tamano: '',
      verificado: true,
      notas: ''
    });
  };

  const handleToggleVerificado = async (b) => {
    await db.backups.update(b.id, { verificado: !b.verificado });
  };

  const handleEliminar = async (b) => {
    if (confirm('¿Eliminar este registro de copia de seguridad?')) {
      await db.backups.delete(b.id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Copias de Seguridad (Backups)</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Registro, verificación y auditoría de respaldos de información por equipo
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
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Respaldo</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por equipo, destino, tipo de respaldo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Listado de Backups */}
      {backupsFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/40 p-6 space-y-2">
          <Database className="w-12 h-12 mx-auto text-slate-500" />
          <h3 className="text-base font-semibold text-slate-300">No hay copias de seguridad registradas</h3>
          <p className="text-xs text-slate-400">
            {busqueda ? 'No hay resultados que coincidan con la búsqueda.' : 'Lleva un control estricto de las copias de seguridad de cada computador.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {backupsFiltrados.map((b) => {
            const eq = equiposMap[b.equipoId] || {};

            return (
              <div
                key={b.id}
                className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => eq.id && onSelectEquipo(eq)}
                      className="flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 hover:text-white border border-slate-700 cursor-pointer"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>{eq.codigo || 'EQ'} - {eq.nombre || 'Equipo'}</span>
                    </button>

                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      b.estado === 'Exitoso'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : b.estado === 'Con Advertencias'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {b.estado}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span>{b.tipo}</span>
                      {b.tamano && <span className="text-xs text-slate-400 font-normal">({b.tamano})</span>}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                      <span>Destino: <strong>{b.destino}</strong></span>
                    </p>
                  </div>

                  {b.notas && (
                    <p className="text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                      {b.notas}
                    </p>
                  )}
                </div>

                {/* Pie de tarjeta con verificación */}
                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {b.fecha ? b.fecha.replace('T', ' ') : 'N/D'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVerificado(b)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        b.verificado
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{b.verificado ? 'Verificado' : 'Sin verificar'}</span>
                    </button>

                    <button
                      onClick={() => handleEliminar(b)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nuevo Backup */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Registrar Copia de Seguridad"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCrearBackup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seleccionar Equipo *</label>
              <select
                required
                value={formData.equipoId}
                onChange={(e) => setFormData({ ...formData, equipoId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {equipos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.codigo} - {eq.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Respaldo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Completa">Copia Completa</option>
                  <option value="Incremental">Incremental</option>
                  <option value="Archivos de Usuario">Archivos de Usuario</option>
                  <option value="Base de Datos">Base de Datos</option>
                  <option value="Imagen de Disco">Imagen de Disco</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Exitoso">Exitoso</option>
                  <option value="Con Advertencias">Con Advertencias</option>
                  <option value="Fallido">Fallido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destino / Almacenamiento *</label>
                <input
                  type="text"
                  required
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  placeholder="Ej. Disco Externo Kingston 1TB"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tamaño Estimado</label>
                <input
                  type="text"
                  value={formData.tamano}
                  onChange={(e) => setFormData({ ...formData, tamano: e.target.value })}
                  placeholder="Ej. 45 GB"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha y Hora</label>
              <input
                type="datetime-local"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Observaciones</label>
              <textarea
                rows="2"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Ruta en servidor, hash SHA256 o comentarios..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="modalVerif"
                checked={formData.verificado}
                onChange={(e) => setFormData({ ...formData, verificado: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="modalVerif" className="text-xs text-slate-300 cursor-pointer">
                Confirmar que la copia de seguridad fue verificada y es recuperable
              </label>
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
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/30"
              >
                Guardar Backup
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
