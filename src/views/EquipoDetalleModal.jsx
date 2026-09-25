import React, { useState } from 'react';
import Modal from '../components/Modal';
import { db, registrarActividad } from '../db/db';
import { 
  Laptop, 
  Wrench, 
  Database, 
  Users, 
  FileText, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  HardDrive,
  Cpu,
  Layers,
  MapPin,
  Tag,
  AlertTriangle,
  Download,
  Trash2,
  Edit
} from 'lucide-react';
import { exportarFichaTecnicaEquipoPDF } from '../utils/exportPdf';

export default function EquipoDetalleModal({ 
  isOpen, 
  onClose, 
  equipo, 
  mantenimientos = [], 
  backups = [], 
  historialUsuarios = [],
  onEditEquipo,
  onDeleted
}) {
  const [activeTab, setActiveTab] = useState('especificaciones');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddMantModal, setShowAddMantModal] = useState(false);
  const [showAddBackupModal, setShowAddBackupModal] = useState(false);

  // Estados para nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    usuario: '',
    cargo: '',
    departamento: equipo?.ubicacion || '',
    fechaInicio: new Date().toISOString().slice(0, 10),
    motivo: 'Asignación de equipo',
    estadoEntrega: 'Buen estado operativo'
  });

  // Estados para nuevo mantenimiento
  const [nuevoMant, setNuevoMant] = useState({
    tipo: 'Preventivo',
    estado: 'Completado',
    fecha: new Date().toISOString().slice(0, 10),
    fechaProxima: '',
    tecnico: '',
    costo: '',
    descripcion: '',
    piezasCambiadas: ''
  });

  // Estados para nuevo backup
  const [nuevoBackup, setNuevoBackup] = useState({
    tipo: 'Completa',
    estado: 'Exitoso',
    fecha: new Date().toISOString().slice(0, 16),
    destino: 'Nube Corporativa / Disco Externo',
    tamano: '',
    verificado: true,
    notas: ''
  });

  if (!equipo) return null;

  // Filtrar los registros relacionados con este equipo
  const misMantenimientos = mantenimientos.filter(m => m.equipoId === equipo.id);
  const misBackups = backups.filter(b => b.equipoId === equipo.id);
  const misUsuarios = historialUsuarios.filter(u => u.equipoId === equipo.id);

  // Calcular cantidad de personas que han usado este equipo
  const totalPersonasUnicas = new Set(misUsuarios.map(u => u.usuario.trim().toLowerCase())).size;

  // Asignar nuevo usuario (cierra el actual si existe)
  const handleGuardarNuevoUsuario = async (e) => {
    e.preventDefault();
    if (!nuevoUsuario.usuario.trim()) return;

    // 1. Marcar los anteriores usuarios como no actuales y con fechaFin hoy
    const anteriores = await db.historialUsuarios.where('equipoId').equals(equipo.id).toArray();
    for (const ant of anteriores) {
      if (ant.esActual) {
        await db.historialUsuarios.update(ant.id, {
          esActual: false,
          fechaFin: new Date().toISOString().slice(0, 10),
          estadoDevolucion: 'Devuelto por reasignación'
        });
      }
    }

    // 2. Insertar el nuevo usuario en el historial
    await db.historialUsuarios.add({
      equipoId: equipo.id,
      usuario: nuevoUsuario.usuario.trim(),
      cargo: nuevoUsuario.cargo.trim(),
      departamento: nuevoUsuario.departamento.trim(),
      fechaInicio: nuevoUsuario.fechaInicio,
      fechaFin: '',
      motivo: nuevoUsuario.motivo,
      estadoEntrega: nuevoUsuario.estadoEntrega,
      estadoDevolucion: '',
      esActual: true
    });

    // 3. Actualizar el usuario actual en el equipo
    await db.equipos.update(equipo.id, {
      usuarioActual: nuevoUsuario.usuario.trim()
    });

    await registrarActividad('usuario', `Equipo ${equipo.codigo} asignado a: ${nuevoUsuario.usuario.trim()}`, equipo.id);

    setShowAddUserModal(false);
    setNuevoUsuario({
      usuario: '',
      cargo: '',
      departamento: equipo.ubicacion || '',
      fechaInicio: new Date().toISOString().slice(0, 10),
      motivo: 'Asignación de equipo',
      estadoEntrega: 'Buen estado operativo'
    });
  };

  // Guardar nuevo mantenimiento
  const handleGuardarMantenimiento = async (e) => {
    e.preventDefault();
    await db.mantenimientos.add({
      equipoId: equipo.id,
      ...nuevoMant,
      costo: nuevoMant.costo ? Number(nuevoMant.costo) : 0
    });

    // Si el mantenimiento está en proceso o reparación, actualizar estado del equipo
    if (nuevoMant.estado === 'En Proceso') {
      await db.equipos.update(equipo.id, { estado: 'En Mantenimiento' });
    } else if (nuevoMant.estado === 'Completado' && equipo.estado === 'En Mantenimiento') {
      await db.equipos.update(equipo.id, { estado: 'Operativo' });
    }

    await registrarActividad('mantenimiento', `Mantenimiento ${nuevoMant.tipo} registrado en ${equipo.codigo}`, equipo.id);
    setShowAddMantModal(false);
  };

  // Guardar nuevo backup
  const handleGuardarBackup = async (e) => {
    e.preventDefault();
    await db.backups.add({
      equipoId: equipo.id,
      ...nuevoBackup
    });

    await registrarActividad('backup', `Copia de seguridad (${nuevoBackup.tipo}) realizada en ${equipo.codigo}`, equipo.id);
    setShowAddBackupModal(false);
  };

  const handleEliminarEquipo = async () => {
    if (confirm(`¿Estás seguro de eliminar el equipo "${equipo.codigo} - ${equipo.nombre}"? También se eliminarán sus registros asociados.`)) {
      await db.equipos.delete(equipo.id);
      await db.mantenimientos.where('equipoId').equals(equipo.id).delete();
      await db.backups.where('equipoId').equals(equipo.id).delete();
      await db.historialUsuarios.where('equipoId').equals(equipo.id).delete();
      await registrarActividad('sistema', `Equipo eliminado: ${equipo.codigo} - ${equipo.nombre}`);
      if (onDeleted) onDeleted();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ficha Técnica: ${equipo.codigo}`} maxWidth="max-w-4xl">
      <div className="space-y-5">
        {/* Cabecera del Equipo con Resumen */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-cyan-400 border border-slate-600">
                  {equipo.codigo}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">{equipo.nombre}</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  equipo.estado === 'Operativo'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : equipo.estado === 'En Mantenimiento'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {equipo.estado}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>{equipo.marca} {equipo.modelo}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {equipo.ubicacion || 'Sin ubicación'}</span>
                <span>•</span>
                <span className="text-blue-300 font-medium">Asignado a: {equipo.usuarioActual || 'Libre / En Bodega'}</span>
              </p>
            </div>
          </div>

          {/* Acciones principales de cabecera */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => exportarFichaTecnicaEquipoPDF(equipo, misMantenimientos, misBackups, misUsuarios)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar Ficha Técnica en PDF"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => { onClose(); onEditEquipo(equipo); }}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              onClick={handleEliminarEquipo}
              className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
              title="Eliminar este equipo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('especificaciones')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'especificaciones'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Especificaciones
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Historial Personas ({totalPersonasUnicas})</span>
          </button>
          <button
            onClick={() => setActiveTab('mantenimientos')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'mantenimientos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Mantenimientos ({misMantenimientos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'backups'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backups ({misBackups.length})</span>
          </button>
        </div>

        {/* PESTAÑA 1: ESPECIFICACIONES */}
        {activeTab === 'especificaciones' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block">Tipo</span>
                <span className="text-sm font-medium text-slate-200">{equipo.tipo}</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block">Número de Serie</span>
                <span className="text-sm font-medium text-cyan-300 font-mono">{equipo.serie || 'N/A'}</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block">Fecha Adquisición</span>
                <span className="text-sm font-medium text-slate-200">{equipo.fechaAdquisicion || 'N/D'}</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block">Valor Estimado</span>
                <span className="text-sm font-semibold text-emerald-400">${equipo.valorEstimado || 0} USD</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Hardware y Rendimiento
                </h4>
                <div className="text-xs space-y-1.5 text-slate-300">
                  <p><strong className="text-slate-400">CPU:</strong> {equipo.procesador || 'No especificado'}</p>
                  <p><strong className="text-slate-400">RAM:</strong> {equipo.ram || 'No especificada'}</p>
                  <p><strong className="text-slate-400">Disco / Almacenamiento:</strong> {equipo.almacenamiento || 'No especificado'}</p>
                  <p><strong className="text-slate-400">Sistema Operativo:</strong> {equipo.sistemaOperativo || 'No especificado'}</p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Notas y Observaciones
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {equipo.notas || 'Sin notas u observaciones adicionales registradas.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: HISTORIAL DE PERSONAS / USUARIOS (Requerimiento Clave) */}
        {activeTab === 'usuarios' && (
          <div className="space-y-4">
            {/* Banner contador de personas */}
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Historial de Uso del Equipo</h4>
                  <p className="text-xs text-blue-200">
                    Este equipo ha sido utilizado por <strong className="text-white text-sm font-extrabold">{totalPersonasUnicas} personas distintas</strong> a lo largo de su vida útil.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Asignar a Nueva Persona</span>
              </button>
            </div>

            {/* Listado de personas / historial */}
            {misUsuarios.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-2xl border border-slate-700/40">
                <Users className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">No hay registros de personas asignadas a este equipo.</p>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="mt-3 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  + Asignar primera persona
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {misUsuarios.map((u) => (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      u.esActual
                        ? 'bg-blue-950/40 border-blue-500/40 ring-1 ring-blue-500/30'
                        : 'bg-slate-800/40 border-slate-700/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          u.esActual ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {u.usuario.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{u.usuario}</span>
                            {u.esActual && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Usuario Actual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {u.cargo ? `${u.cargo} • ` : ''}{u.departamento || 'Área no especificada'}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-2 self-start sm:self-auto">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {u.fechaInicio} ➔ {u.fechaFin ? u.fechaFin : 'Presente (En uso)'}
                        </span>
                      </div>
                    </div>

                    {(u.motivo || u.estadoEntrega || u.estadoDevolucion) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        {u.motivo && (
                          <p><strong className="text-slate-400">Motivo:</strong> {u.motivo}</p>
                        )}
                        {u.estadoEntrega && (
                          <p><strong className="text-slate-400">Entrega:</strong> {u.estadoEntrega}</p>
                        )}
                        {u.estadoDevolucion && (
                          <p className="col-span-full"><strong className="text-slate-400">Devolución:</strong> {u.estadoDevolucion}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: MANTENIMIENTOS */}
        {activeTab === 'mantenimientos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-300">Historial Técnico de Mantenimiento</h4>
              <button
                onClick={() => setShowAddMantModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Mantenimiento</span>
              </button>
            </div>

            {misMantenimientos.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-2xl border border-slate-700/40">
                <Wrench className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">No se han registrado mantenimientos para este equipo.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {misMantenimientos.map((m) => (
                  <div key={m.id} className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          m.tipo === 'Preventivo' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {m.tipo}
                        </span>
                        <span className="text-xs text-slate-400">{m.fecha}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.estado === 'Completado' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {m.estado}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">{m.descripcion}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                      <span>Técnico: {m.tecnico || 'No especificado'}</span>
                      {m.fechaProxima && <span>Próximo: {m.fechaProxima}</span>}
                      {m.costo > 0 && <span className="text-emerald-400 font-semibold">${m.costo}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: BACKUPS */}
        {activeTab === 'backups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-300">Historial de Copias de Seguridad</h4>
              <button
                onClick={() => setShowAddBackupModal(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Backup</span>
              </button>
            </div>

            {misBackups.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-2xl border border-slate-700/40">
                <Database className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">No hay copias de seguridad registradas para este equipo.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {misBackups.map((b) => (
                  <div key={b.id} className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400">{b.tipo}</span>
                        <span className="text-xs text-slate-400">{b.fecha?.replace('T', ' ')}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.estado === 'Exitoso' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {b.estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <span>Destino: <strong>{b.destino}</strong></span>
                      {b.tamano && <span>Tamaño: <strong>{b.tamano}</strong></span>}
                      <span>{b.verificado ? '✓ Verificado' : '⚠ No verificado'}</span>
                    </div>
                    {b.notas && <p className="text-xs text-slate-400">{b.notas}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SUB-MODAL: ASIGNAR NUEVA PERSONA */}
      {showAddUserModal && (
        <Modal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          title={`Asignar Nueva Persona a ${equipo.codigo}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleGuardarNuevoUsuario} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo de la Persona *</label>
              <input
                type="text"
                required
                value={nuevoUsuario.usuario}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })}
                placeholder="Ej. Juan Pérez"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo</label>
                <input
                  type="text"
                  value={nuevoUsuario.cargo}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, cargo: e.target.value })}
                  placeholder="Analista, Diseñador..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Departamento</label>
                <input
                  type="text"
                  value={nuevoUsuario.departamento}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, departamento: e.target.value })}
                  placeholder="TI, Finanzas..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={nuevoUsuario.fechaInicio}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo de Asignación</label>
                <input
                  type="text"
                  value={nuevoUsuario.motivo}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, motivo: e.target.value })}
                  placeholder="Ingreso, Préstamo..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estado de Entrega del Equipo</label>
              <input
                type="text"
                value={nuevoUsuario.estadoEntrega}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, estadoEntrega: e.target.value })}
                placeholder="Equipo limpio, formateado, con cargador original..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-blue-300 bg-blue-900/30 p-2.5 rounded-lg border border-blue-500/20">
              💡 Al guardar, el usuario anterior ({equipo.usuarioActual || 'Ninguno'}) quedará registrado en el histórico y {nuevoUsuario.usuario || 'la nueva persona'} pasará a ser el usuario activo.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Registrar Asignación
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* SUB-MODAL: REGISTRAR MANTENIMIENTO */}
      {showAddMantModal && (
        <Modal
          isOpen={showAddMantModal}
          onClose={() => setShowAddMantModal(false)}
          title={`Registrar Mantenimiento - ${equipo.codigo}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleGuardarMantenimiento} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo</label>
                <select
                  value={nuevoMant.tipo}
                  onChange={(e) => setNuevoMant({ ...nuevoMant, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Actualización">Actualización Software/Hardware</option>
                  <option value="Diagnóstico">Diagnóstico / Revisión</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                <select
                  value={nuevoMant.estado}
                  onChange={(e) => setNuevoMant({ ...nuevoMant, estado: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="Completado">Completado</option>
                  <option value="Pendiente">Pendiente / Programado</option>
                  <option value="En Proceso">En Proceso</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={nuevoMant.fecha}
                  onChange={(e) => setNuevoMant({ ...nuevoMant, fecha: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Próxima Fecha (Opcional)</label>
                <input
                  type="date"
                  value={nuevoMant.fechaProxima}
                  onChange={(e) => setNuevoMant({ ...nuevoMant, fechaProxima: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Técnico / Proveedor</label>
                <input
                  type="text"
                  value={nuevoMant.tecnico}
                  onChange={(e) => setNuevoMant({ ...nuevoMant, tecnico: e.target.value })}
                  placeholder="Nombre del técnico"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Costo ($ USD)</label>
                <input
                  type="number"
                  value={nuevoMant.costo}
                  onChange={(e) => setNuevoMant({ ...nuevoMant, costo: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción de las Tareas *</label>
              <textarea
                required
                rows="2"
                value={nuevoMant.descripcion}
                onChange={(e) => setNuevoMant({ ...nuevoMant, descripcion: e.target.value })}
                placeholder="Cambio de pasta térmica, limpieza de polvo, actualización..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMantModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Guardar Mantenimiento
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* SUB-MODAL: REGISTRAR BACKUP */}
      {showAddBackupModal && (
        <Modal
          isOpen={showAddBackupModal}
          onClose={() => setShowAddBackupModal(false)}
          title={`Registrar Backup - ${equipo.codigo}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleGuardarBackup} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Respaldo</label>
                <select
                  value={nuevoBackup.tipo}
                  onChange={(e) => setNuevoBackup({ ...nuevoBackup, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
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
                  value={nuevoBackup.estado}
                  onChange={(e) => setNuevoBackup({ ...nuevoBackup, estado: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="Exitoso">Exitoso</option>
                  <option value="Con Advertencias">Con Advertencias</option>
                  <option value="Fallido">Fallido</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destino / Almacenamiento</label>
                <input
                  type="text"
                  required
                  value={nuevoBackup.destino}
                  onChange={(e) => setNuevoBackup({ ...nuevoBackup, destino: e.target.value })}
                  placeholder="Disco Externo, NAS, Drive..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tamaño (ej. 35 GB)</label>
                <input
                  type="text"
                  value={nuevoBackup.tamano}
                  onChange={(e) => setNuevoBackup({ ...nuevoBackup, tamano: e.target.value })}
                  placeholder="45 GB"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Hash / Ubicación</label>
              <textarea
                rows="2"
                value={nuevoBackup.notas}
                onChange={(e) => setNuevoBackup({ ...nuevoBackup, notas: e.target.value })}
                placeholder="Ruta en el servidor o notas adicionales..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              ></textarea>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verificado"
                checked={nuevoBackup.verificado}
                onChange={(e) => setNuevoBackup({ ...nuevoBackup, verificado: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="verificado" className="text-xs text-slate-300 cursor-pointer">
                Copia de seguridad comprobada y verificada
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBackupModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
              >
                Guardar Backup
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Modal>
  );
}
