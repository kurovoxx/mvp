import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('usuarios', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  rol: text('rol', { enum: ['jefe_turno', 'pañolero', 'mecanico', 'inspector'] }).notNull(),
  activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const assets = sqliteTable('activos', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  categoria: text('categoria', { enum: ['herramienta_precision', 'epp', 'equipo_mayor', 'consumible'] }).notNull(),
  nivelCriticidad: text('nivel_criticidad', { enum: ['alta', 'media', 'baja'] }).notNull(),
  estado: text('estado', { 
    enum: ['disponible', 'solicitada', 'en_uso', 'en_devolucion', 'bloqueada', 'en_evaluacion', 'en_reparacion', 'baja'] 
  }).notNull().default('disponible'),
  ubicacionFisica: text('ubicacion_fisica').notNull(),
  fechaUltimaCalibracion: integer('fecha_ultima_calibracion', { mode: 'timestamp' }),
  fechaVencimientoCalibracion: integer('fecha_vencimiento_calibracion', { mode: 'timestamp' }),
  vidaUtilEstimadaDias: integer('vida_util_estimada_dias'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const loans = sqliteTable('prestamos', {
  id: text('id').primaryKey(),
  activoId: text('id_activo').notNull().references(() => assets.id),
  mecanicoId: text('id_mecanico').notNull().references(() => users.id),
  pañoleroSalidaId: text('id_pañolero_salida').references(() => users.id),
  ordenTrabajoId: text('id_orden_trabajo').notNull(),
  fechaHoraSalida: integer('fecha_hora_salida', { mode: 'timestamp' }),
  fechaHoraDevolucion: integer('fecha_hora_devolucion', { mode: 'timestamp' }),
  inspeccionSalidaPañolero: integer('inspeccion_salida_pañolero', { mode: 'boolean' }).default(false),
  inspeccionSalidaMecanico: integer('inspeccion_salida_mecanico', { mode: 'boolean' }).default(false),
  resultadoInspeccionSalida: text('resultado_inspeccion_salida', { enum: ['aprobada', 'rechazada'] }),
  inspeccionDevolucionPañolero: integer('inspeccion_devolucion_pañolero', { mode: 'boolean' }).default(false),
  resultadoInspeccionDevolucion: text('resultado_inspeccion_devolucion', { enum: ['aprobada', 'con_daño'] }),
  falloReportadoUso: integer('fallo_reportado_uso', { mode: 'boolean' }).default(false),
  descripcionFallo: text('descripcion_fallo'),
  pañoleroDevolucionId: text('id_pañolero_devolucion').references(() => users.id),
  cierreValidado: integer('cierre_validado', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const technicalEvaluations = sqliteTable('evaluaciones_tecnicas', {
  id: text('id').primaryKey(),
  prestamoId: text('id_prestamo').notNull().references(() => loans.id),
  inspectorId: text('id_inspector').notNull().references(() => users.id),
  fechaEvaluacion: integer('fecha_evaluacion', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  clasificacionCausa: text('clasificacion_causa', { 
    enum: ['desgaste_natural', 'negligencia', 'defecto_fabrica', 'por_determinar'] 
  }).notNull(),
  descripcionTecnica: text('descripcion_tecnica').notNull(),
  dictamen: text('dictamen', { 
    enum: ['reincorporar', 'mantencion', 'baja', 'reposicion'] 
  }).notNull(),
  requiereAccionRRHH: integer('requiere_accion_rrhh', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const stateHistory = sqliteTable('historial_estados', {
  id: text('id').primaryKey(),
  activoId: text('id_activo').notNull().references(() => assets.id),
  estadoAnterior: text('estado_anterior').notNull(),
  estadoNuevo: text('estado_nuevo').notNull(),
  usuarioResponsableId: text('id_usuario_responsable').notNull().references(() => users.id),
  motivo: text('motivo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans, { relationName: 'mecanico' }),
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  loans: many(loans),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  activo: one(assets, {
    fields: [loans.activoId],
    references: [assets.id],
  }),
  mecanico: one(users, {
    fields: [loans.mecanicoId],
    references: [users.id],
    relationName: 'mecanico',
  }),
}));