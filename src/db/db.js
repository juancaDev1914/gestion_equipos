import Dexie from 'dexie';

export const db = new Dexie('GestionEquiposDB');

// Definición del esquema de la base de datos IndexedDB local
db.version(1).stores({
  equipos: '++id, codigo, nombre, tipo, marca, estado, ubicacion, usuarioActual, fechaAdquisicion',
  mantenimientos: '++id, equipoId, tipo, estado, fecha, fechaProxima, tecnico',
  backups: '++id, equipoId, tipo, estado, fecha, destino, verificado',
  historialUsuarios: '++id, equipoId, usuario, cargo, departamento, fechaInicio, fechaFin, estadoActual',
  actividades: '++id, tipo, descripcion, fecha, equipoId'
});

// Función para registrar actividad reciente en el sistema
export async function registrarActividad(tipo, descripcion, equipoId = null) {
  try {
    await db.actividades.add({
      tipo,
      descripcion,
      fecha: new Date().toISOString(),
      equipoId
    });
  } catch (error) {
    console.error('Error registrando actividad:', error);
  }
}
