import { db, registrarActividad } from '../db/db';

export const datosIniciales = {
  equipos: [
    {
      id: 1,
      codigo: 'EQ-001',
      nombre: 'Laptop Dell Latitude 5420',
      tipo: 'Laptop',
      marca: 'Dell',
      modelo: 'Latitude 5420',
      serie: 'DL5420-99882A',
      procesador: 'Intel Core i7-1185G7 @ 3.0GHz',
      ram: '16 GB DDR4',
      almacenamiento: '512 GB NVMe SSD',
      sistemaOperativo: 'Windows 11 Pro',
      ubicacion: 'Departamento de TI',
      estado: 'Operativo',
      usuarioActual: 'Carlos Mendoza',
      fechaAdquisicion: '2024-02-15',
      valorEstimado: 1200,
      notas: 'Equipo principal para desarrollo de software. Batería en buen estado.'
    },
    {
      id: 2,
      codigo: 'EQ-002',
      nombre: 'PC Escritorio HP ProDesk 400 G7',
      tipo: 'Escritorio',
      marca: 'HP',
      modelo: 'ProDesk 400 G7 SFF',
      serie: 'HP400-88123B',
      procesador: 'Intel Core i5-10500',
      ram: '16 GB DDR4',
      almacenamiento: '1 TB SSD Kingston',
      sistemaOperativo: 'Windows 10 Pro 64-bit',
      ubicacion: 'Contabilidad y Finanzas',
      estado: 'Operativo',
      usuarioActual: 'Ana Gómez',
      fechaAdquisicion: '2023-08-10',
      valorEstimado: 850,
      notas: 'Conectado a doble monitor para tareas contables y ERP.'
    },
    {
      id: 3,
      codigo: 'EQ-003',
      nombre: 'Servidor Dell PowerEdge R440',
      tipo: 'Servidor',
      marca: 'Dell',
      modelo: 'PowerEdge R440 Rack 1U',
      serie: 'SV-PE-772199',
      procesador: '2x Intel Xeon Silver 4210R',
      ram: '64 GB ECC DDR4',
      almacenamiento: '4x 2TB SAS RAID 5',
      sistemaOperativo: 'Ubuntu Server 22.04 LTS',
      ubicacion: 'Rack Principal - Data Center',
      estado: 'En Mantenimiento',
      usuarioActual: 'Soporte de Infraestructura TI',
      fechaAdquisicion: '2022-11-05',
      valorEstimado: 3500,
      notas: 'Aloja base de datos principal y servicios internos. Mantenimiento de ventiladores programado.'
    },
    {
      id: 4,
      codigo: 'EQ-004',
      nombre: 'Laptop Apple MacBook Pro 14"',
      tipo: 'Laptop',
      marca: 'Apple',
      modelo: 'MacBook Pro M2 Pro',
      serie: 'C02G99XZMD6R',
      procesador: 'Apple M2 Pro (10 núcleos)',
      ram: '16 GB Unificada',
      almacenamiento: '512 GB SSD',
      sistemaOperativo: 'macOS Sonoma 14.4',
      ubicacion: 'Marketing & Multimedia',
      estado: 'Operativo',
      usuarioActual: 'Sofía Valenzuela',
      fechaAdquisicion: '2024-05-20',
      valorEstimado: 2100,
      notas: 'Asignada para edición de video, contenido digital y redes.'
    },
    {
      id: 5,
      codigo: 'EQ-005',
      nombre: 'Impresora Multifuncional Epson EcoTank L6270',
      tipo: 'Impresora',
      marca: 'Epson',
      modelo: 'EcoTank L6270',
      serie: 'EP-L6270-4412',
      procesador: 'N/A',
      ram: 'N/A',
      almacenamiento: 'N/A',
      sistemaOperativo: 'Firmware 2024',
      ubicacion: 'Recepción y Atención al Cliente',
      estado: 'Operativo',
      usuarioActual: 'Uso Compartido / Recepción',
      fechaAdquisicion: '2023-03-12',
      valorEstimado: 450,
      notas: 'Conexión Wi-Fi y cable ethernet. Rellenado de tinta continuo.'
    }
  ],
  mantenimientos: [
    {
      id: 1,
      equipoId: 1,
      tipo: 'Preventivo',
      estado: 'Completado',
      fecha: '2026-08-15',
      fechaProxima: '2026-11-15',
      tecnico: 'Ing. David Ramos',
      costo: 35,
      descripcion: 'Limpieza interna de disipadores, cambio de pasta térmica Arctic MX-4 y actualización de BIOS a v1.18.',
      piezasCambiadas: 'Pasta térmica'
    },
    {
      id: 2,
      equipoId: 3,
      tipo: 'Correctivo',
      estado: 'En Proceso',
      fecha: '2026-09-24',
      fechaProxima: '2026-09-28',
      tecnico: 'Soporte Oficial Dell Partner',
      costo: 180,
      descripcion: 'Reemplazo del módulo de ventilación FAN-3 por alerta en iDRAC. Verificación de arreglos RAID.',
      piezasCambiadas: 'Módulo Fan Dell R440'
    },
    {
      id: 3,
      equipoId: 2,
      tipo: 'Preventivo',
      estado: 'Pendiente',
      fecha: '2026-10-05',
      fechaProxima: '2026-10-05',
      tecnico: 'Técnico de Planta TI',
      costo: 20,
      descripcion: 'Soplado con aire comprimido, limpieza de teclado y mouse, optimización de espacio en disco C:.',
      piezasCambiadas: 'Ninguna'
    },
    {
      id: 4,
      equipoId: 4,
      tipo: 'Actualización',
      estado: 'Completado',
      fecha: '2026-07-10',
      fechaProxima: '2026-12-10',
      tecnico: 'Sofía Valenzuela / TI',
      costo: 0,
      descripcion: 'Actualización de macOS, instalación de suite Adobe CC y configuración de perfiles de color.',
      piezasCambiadas: 'Software'
    },
    {
      id: 5,
      equipoId: 5,
      tipo: 'Limpieza',
      estado: 'Pendiente',
      fecha: '2026-09-30',
      fechaProxima: '2026-09-30',
      tecnico: 'Servicio Externo Impresoras',
      costo: 40,
      descripcion: 'Limpieza de cabezales y rodillos de arrastre. Purgado de mangueras de tinta.',
      piezasCambiadas: 'Almohadillas de tinta'
    }
  ],
  backups: [
    {
      id: 1,
      equipoId: 1,
      tipo: 'Archivos de Usuario',
      estado: 'Exitoso',
      fecha: '2026-09-22T14:30:00',
      destino: 'OneDrive Corporativo + NAS TI',
      tamano: '42.8 GB',
      verificado: true,
      notas: 'Respaldo completo de perfil C:\\Users\\cmendoza, proyectos Git y llaves SSH encriptadas.'
    },
    {
      id: 2,
      equipoId: 3,
      tipo: 'Imagen de Disco / RAID',
      estado: 'Exitoso',
      fecha: '2026-09-25T03:00:00',
      destino: 'Synology NAS DataCenter (RAID 6)',
      tamano: '380 GB',
      verificado: true,
      notas: 'Snapshot completo de volúmenes LVM y dump diario de PostgreSQL comprimido.'
    },
    {
      id: 3,
      equipoId: 2,
      tipo: 'Base de Datos Contable',
      estado: 'Exitoso',
      fecha: '2026-09-20T18:00:00',
      destino: 'Disco Externo SSD 1TB Encrypted',
      tamano: '12.4 GB',
      verificado: true,
      notas: 'Exportación de base contable Siigo / ERP del cierre de quincena.'
    },
    {
      id: 4,
      equipoId: 4,
      tipo: 'Completa Time Machine',
      estado: 'Con Advertencias',
      fecha: '2026-09-15T11:00:00',
      destino: 'Disco Externo Thunderbolt',
      tamano: '215 GB',
      verificado: false,
      notas: 'Completado con advertencia de poco espacio libre en el disco de destino.'
    }
  ],
  historialUsuarios: [
    // Para EQ-001 (Laptop Dell): Ya ha pasado por 3 personas
    {
      id: 1,
      equipoId: 1,
      usuario: 'Javier Restrepo',
      cargo: 'Desarrollador Junior',
      departamento: 'TI',
      fechaInicio: '2024-02-15',
      fechaFin: '2024-11-30',
      motivo: 'Asignación por ingreso a la empresa',
      estadoEntrega: 'Nuevo en caja',
      estadoDevolucion: 'Excelente estado, formateado al entregar',
      esActual: false
    },
    {
      id: 2,
      equipoId: 1,
      usuario: 'Mariana Duarte',
      cargo: 'Practicante de Sistemas',
      departamento: 'TI',
      fechaInicio: '2024-12-05',
      fechaFin: '2025-06-20',
      motivo: 'Préstamo temporal de prácticas universitarias',
      estadoEntrega: 'Buen estado físico',
      estadoDevolucion: 'Buen estado, cargador original devuelto',
      esActual: false
    },
    {
      id: 3,
      equipoId: 1,
      usuario: 'Carlos Mendoza',
      cargo: 'Líder Técnico Frontend',
      departamento: 'TI',
      fechaInicio: '2025-07-01',
      fechaFin: '',
      motivo: 'Equipo de trabajo asignado de planta',
      estadoEntrega: 'Operativo, reconfigurado con 16GB RAM',
      estadoDevolucion: '',
      esActual: true
    },
    // Para EQ-002 (PC Escritorio HP): 2 personas
    {
      id: 4,
      equipoId: 2,
      usuario: 'Laura Morales',
      cargo: 'Auxiliar Contable',
      departamento: 'Contabilidad',
      fechaInicio: '2023-08-10',
      fechaFin: '2025-01-15',
      motivo: 'Puesto de trabajo fijo',
      estadoEntrega: 'Equipo nuevo',
      estadoDevolucion: 'Entrega por cambio de cargo',
      esActual: false
    },
    {
      id: 5,
      equipoId: 2,
      usuario: 'Ana Gómez',
      cargo: 'Especialista Contable',
      departamento: 'Contabilidad',
      fechaInicio: '2025-01-16',
      fechaFin: '',
      motivo: 'Reasignación de estación fija',
      estadoEntrega: 'Limpio y formateado con perfiles corporativos',
      estadoDevolucion: '',
      esActual: true
    },
    // Para EQ-004 (MacBook Pro): 1 persona
    {
      id: 6,
      equipoId: 4,
      usuario: 'Sofía Valenzuela',
      cargo: 'Diseñadora UI/UX & Video',
      departamento: 'Marketing',
      fechaInicio: '2024-05-20',
      fechaFin: '',
      motivo: 'Equipo de alto rendimiento asignado',
      estadoEntrega: 'Nuevo en caja sellada con Magic Mouse y funda',
      estadoDevolucion: '',
      esActual: true
    }
  ]
};

export async function inicializarDatosPrueba(forzar = false) {
  const count = await db.equipos.count();
  if (count === 0 || forzar) {
    if (forzar) {
      await db.equipos.clear();
      await db.mantenimientos.clear();
      await db.backups.clear();
      await db.historialUsuarios.clear();
      await db.actividades.clear();
    }

    await db.equipos.bulkAdd(datosIniciales.equipos);
    await db.mantenimientos.bulkAdd(datosIniciales.mantenimientos);
    await db.backups.bulkAdd(datosIniciales.backups);
    await db.historialUsuarios.bulkAdd(datosIniciales.historialUsuarios);
    
    await registrarActividad('sistema', 'Sistema inicializado con catálogo base de equipos y registros de prueba.');
    return true;
  }
  return false;
}
