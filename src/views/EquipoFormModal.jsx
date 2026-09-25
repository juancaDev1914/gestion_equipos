import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { db, registrarActividad } from '../db/db';
import { Laptop, Save, AlertCircle } from 'lucide-react';

export default function EquipoFormModal({ isOpen, onClose, equipoParaEditar = null, onGuardado }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'Laptop',
    marca: '',
    modelo: '',
    serie: '',
    procesador: '',
    ram: '',
    almacenamiento: '',
    sistemaOperativo: '',
    ubicacion: '',
    estado: 'Operativo',
    usuarioActual: '',
    fechaAdquisicion: new Date().toISOString().slice(0, 10),
    valorEstimado: '',
    notas: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (equipoParaEditar) {
      setFormData({
        codigo: equipoParaEditar.codigo || '',
        nombre: equipoParaEditar.nombre || '',
        tipo: equipoParaEditar.tipo || 'Laptop',
        marca: equipoParaEditar.marca || '',
        modelo: equipoParaEditar.modelo || '',
        serie: equipoParaEditar.serie || '',
        procesador: equipoParaEditar.procesador || '',
        ram: equipoParaEditar.ram || '',
        almacenamiento: equipoParaEditar.almacenamiento || '',
        sistemaOperativo: equipoParaEditar.sistemaOperativo || '',
        ubicacion: equipoParaEditar.ubicacion || '',
        estado: equipoParaEditar.estado || 'Operativo',
        usuarioActual: equipoParaEditar.usuarioActual || '',
        fechaAdquisicion: equipoParaEditar.fechaAdquisicion || new Date().toISOString().slice(0, 10),
        valorEstimado: equipoParaEditar.valorEstimado || '',
        notas: equipoParaEditar.notas || ''
      });
    } else {
      setFormData({
        codigo: `EQ-${String(Math.floor(100 + Math.random() * 900))}`,
        nombre: '',
        tipo: 'Laptop',
        marca: '',
        modelo: '',
        serie: '',
        procesador: '',
        ram: '',
        almacenamiento: '',
        sistemaOperativo: '',
        ubicacion: '',
        estado: 'Operativo',
        usuarioActual: '',
        fechaAdquisicion: new Date().toISOString().slice(0, 10),
        valorEstimado: '',
        notas: ''
      });
    }
    setError('');
  }, [equipoParaEditar, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre o modelo del equipo es obligatorio.');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        valorEstimado: formData.valorEstimado ? Number(formData.valorEstimado) : 0
      };

      if (equipoParaEditar && equipoParaEditar.id) {
        await db.equipos.update(equipoParaEditar.id, dataToSave);
        await registrarActividad('equipo', `Equipo modificado: ${formData.codigo} - ${formData.nombre}`, equipoParaEditar.id);
      } else {
        const newId = await db.equipos.add(dataToSave);
        
        // Si se especificó un usuario actual al crearlo, registrarlo en el historial de usuarios
        if (formData.usuarioActual.trim()) {
          await db.historialUsuarios.add({
            equipoId: newId,
            usuario: formData.usuarioActual.trim(),
            cargo: 'Responsable inicial',
            departamento: formData.ubicacion || 'General',
            fechaInicio: formData.fechaAdquisicion || new Date().toISOString().slice(0, 10),
            fechaFin: '',
            motivo: 'Asignación de equipo nuevo',
            estadoEntrega: 'Equipo registrado en inventario',
            estadoDevolucion: '',
            esActual: true
          });
        }

        await registrarActividad('equipo', `Nuevo equipo creado: ${formData.codigo} - ${formData.nombre}`, newId);
      }

      if (onGuardado) onGuardado();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Error guardando el equipo en la base de datos local.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={equipoParaEditar ? `Editar Equipo: ${formData.codigo}` : 'Registrar Nuevo Equipo'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sección 1: Datos Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Código / Inventario *</label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="EQ-001"
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre / Denominación *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Laptop Dell Latitude 5420"
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sección 2: Tipo, Marca, Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Equipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Laptop">Laptop / Portátil</option>
              <option value="Escritorio">PC Escritorio</option>
              <option value="Servidor">Servidor</option>
              <option value="Impresora">Impresora / Multifuncional</option>
              <option value="Switch/Router">Switch / Router / Red</option>
              <option value="Tablet">Tablet</option>
              <option value="Celular">Teléfono Celular</option>
              <option value="Otro">Otro Dispositivo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Marca</label>
            <input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              placeholder="Dell, HP, Apple, Lenovo..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Estado Operativo</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Operativo">Operativo (Activo)</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="En Reparación">En Reparación</option>
              <option value="En Espera">En Espera / Stock</option>
              <option value="De Baja">De Baja (Retirado)</option>
            </select>
          </div>
        </div>

        {/* Sección 3: Serie, Modelo, Ubicación */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Número de Serie (S/N)</label>
            <input
              type="text"
              name="serie"
              value={formData.serie}
              onChange={handleChange}
              placeholder="SN-123456789"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo Exacto</label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              placeholder="Latitude 5420 G2"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ubicación / Área</label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              placeholder="Contabilidad, TI, Almacén..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sección 4: Hardware y Sistema */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Procesador (CPU)</label>
            <input
              type="text"
              name="procesador"
              value={formData.procesador}
              onChange={handleChange}
              placeholder="Intel i7 11th Gen"
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Memoria RAM</label>
            <input
              type="text"
              name="ram"
              value={formData.ram}
              onChange={handleChange}
              placeholder="16 GB DDR4"
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Almacenamiento</label>
            <input
              type="text"
              name="almacenamiento"
              value={formData.almacenamiento}
              onChange={handleChange}
              placeholder="512 GB NVMe SSD"
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sistema Operativo</label>
            <input
              type="text"
              name="sistemaOperativo"
              value={formData.sistemaOperativo}
              onChange={handleChange}
              placeholder="Windows 11 / Linux / macOS"
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sección 5: Asignación y Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Persona Asignada Actualmente</label>
            <input
              type="text"
              name="usuarioActual"
              value={formData.usuarioActual}
              onChange={handleChange}
              placeholder="Nombre del usuario"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Adquisición</label>
            <input
              type="date"
              name="fechaAdquisicion"
              value={formData.fechaAdquisicion}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Estimado ($ USD)</label>
            <input
              type="number"
              name="valorEstimado"
              value={formData.valorEstimado}
              onChange={handleChange}
              placeholder="1200"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Observaciones / Notas Técnicas</label>
          <textarea
            name="notas"
            rows="2"
            value={formData.notas}
            onChange={handleChange}
            placeholder="Detalles sobre periféricos, cargadores, estado físico..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
          ></textarea>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Equipo</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
